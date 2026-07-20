import SwiftUI
import WidgetKit

// Saver widgets — the design system. Every widget pulls its spacing, type,
// colour and surfaces from here; no View should carry a loose number.
//
// The model is grouped surfaces (what the YouTube and Shortcuts widgets do):
// the widget background is a near-black stage, and each section sits on its own
// slightly lighter card with its own tap target. Cards are what separate
// sections — not dividers, and not empty space alone.

// MARK: - Colour
//
// Two greys, and they have to be far enough apart to read as separate layers.
// Fixed values, not system semantic ones: .secondarySystemFill is translucent
// and picked up the wallpaper, and .systemBackground let the system's own widget
// material show through instead of painting — both came out washed out with the
// wallpaper bleeding in. These are the YouTube widget's own tones: a flat black
// stage (not #0F0F0F, which read as a grey top under the system's legibility
// wash) with a clearly lighter grey card on it.
enum WColor {
    static let stage = Color(lightHex: "#FFFFFF", darkHex: "#000000")
    static let card = Color(lightHex: "#F2F2F4", darkHex: "#1F1F21")
    /// A hairline on the card edge. The stage/card contrast alone defined the
    /// edges, but iOS paints a faint legibility gradient on the widget's top,
    /// which swallowed that contrast on the topmost card while the ones below
    /// stayed crisp. An explicit border defines every edge regardless.
    static let cardBorder = Color(lightHex: "#000000", darkHex: "#FFFFFF")
}

// MARK: - Spacing

// One gap and one padding, used by everything. The earlier set had three gaps
// (6/8/12) and two paddings (8/12), which is what made the widgets read as
// arbitrary: a header padded 12 put its label on a different vertical line than
// the logos in the rows padded 8 below it, so nothing lined up down the card.
enum WSpace {
    /// The only gap: card to card, and element to element inside a card.
    static let gap: CGFloat = 8
    /// The only padding: card edge to its content.
    static let card: CGFloat = 8
    /// Gap between two lines of text that belong together.
    static let tight: CGFloat = 4
}

// MARK: - Type

// One scale, three jobs: a label that names things, a hero number, and row text.
//
// Text is Cairo, the app's own face — the system font was rendering Arabic names
// in SF Arabic, so a bank called "سلفه شريف" didn't look like it does in the app.
// Numbers stay SF Rounded: it's what gives the amounts their shape, and Cairo has
// no rounded numerals to match. monospacedDigit keeps columns of money aligned,
// which is most of what separates a finished money widget from a rough one.
enum WFont {
    private static func cairo(_ size: CGFloat, _ weight: Weight) -> Font {
        Font.custom(weight == .semibold ? "Cairo-SemiBold" : "Cairo-Bold", size: size)
    }
    enum Weight { case semibold, bold }

    static let label = cairo(11, .bold)
    static let heroLarge = Font.system(size: 34, weight: .heavy, design: .rounded).monospacedDigit()
    static let hero = Font.system(size: 30, weight: .heavy, design: .rounded).monospacedDigit()
    static let heroSmall = Font.system(size: 22, weight: .heavy, design: .rounded).monospacedDigit()
    static let rowName = cairo(14, .semibold)
    static let rowValue = Font.system(size: 17, weight: .heavy, design: .rounded).monospacedDigit()
    static let caption = cairo(11, .semibold)
    /// Quick Add leads with the category NAME (what the shortcut is), bold and
    /// white like a title; the amount it logs is the supporting line beneath.
    static let quickName = cairo(14, .bold)
    static let quickValue = Font.system(size: 13, weight: .bold, design: .rounded).monospacedDigit()
    /// A goal's "saved of target" line — the amount is the point, so it's a
    /// touch larger and bolder than a plain caption, in white.
    static let goalDetail = Font.system(size: 12, weight: .semibold, design: .rounded).monospacedDigit()
}

// MARK: - Metrics

// Heights are derived from content plus the one padding, never picked by eye —
// and sized for the SMALLEST widget, because widget size follows the device.
// A medium widget is 364x170 on a 430pt iPhone but only 338x158 on a 393pt one,
// so the content budget is 138 on the big phones and 126 on the small ones. Fit
// 126 or the layout collapses on half the devices: a 44pt header plus two 38pt
// rows and their gaps needs 136, which is what pushed the bills rows together.
enum WMetric {
    /// Tight on purpose (was 12, then 9): a fixed radius reads rounder the smaller
    /// the card, and the compact rows/tiles were still going pill-ish. 6 keeps a
    /// crisp card corner at every size.
    static let cardRadius: CGFloat = 6
    static let logo: CGFloat = 22
    /// The medium accounts tile drops the bank name and leans on the logo to
    /// identify the account, so the logo grows (was 18) — but the tile only gets
    /// what the 68pt header leaves of a 126pt budget, so 24 is the ceiling that
    /// still stacks a logo over the amount without overflowing.
    static let logoTile: CGFloat = 24
    static let addButton: CGFloat = 34

    /// padding + logo + padding.
    static var row: CGFloat { WSpace.card * 2 + logo }
    /// Rows share what the header leaves: six accounts sit at `row`, four grow
    /// toward `rowMax` and the list centres, so the space is used either way.
    static let rowMax: CGFloat = 52
    /// padding + label + tight + hero line + padding.
    static let headerHeight: CGFloat = 68
    /// A one-line header: label and value side by side.
    static let headerCompact: CGFloat = 40
    /// A row that shares a medium widget with a header: 126 - 40 header - 8 gap
    /// leaves 78 for two rows and the gap between them, so 34 each with room over.
    static let rowCompact: CGFloat = 34
    /// Three single-line rows in that same 78pt budget, with two 4pt (tight) gaps
    /// between them instead of two 8pt ones: (78 - 8) / 3 ≈ 23.
    static let rowCompact3: CGFloat = 23
    static let logoCompact: CGFloat = 20
    /// padding + button + padding.
    static var barHeight: CGFloat { WSpace.card * 2 + addButton }
}

// MARK: - Surface

/// The card every section sits on. One fill, one radius, one padding.
///
/// In the Home Screen's Tinted and Clear appearances WidgetKit renders the whole
/// hierarchy as a tint silhouette built from each view's coverage, so an opaque
/// card fill turns into a solid white/tinted block that swallows its own text.
/// In those modes (`renderingMode != .fullColor`) the fill drops to a faint wash
/// — enough to keep the card readable as a group, light enough that the text on
/// top stays the brightest thing in the silhouette.
struct SurfaceCard<Content: View>: View {
    @Environment(\.widgetRenderingMode) private var renderingMode
    var padding: CGFloat = WSpace.card
    @ViewBuilder var content: () -> Content

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: WMetric.cardRadius, style: .continuous)
        let flat = renderingMode != .fullColor
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .background(flat ? Color.white.opacity(0.12) : WColor.card, in: shape)
            .overlay(shape.strokeBorder(WColor.cardBorder.opacity(flat ? 0 : 0.12), lineWidth: 0.75))
    }
}

extension View {
    /// Widget stage, and the only place an outer margin is set. iOS 17 already
    /// insets widget content by its own standard margin, so adding one on top of
    /// it is what left the cards stranded in the middle. iOS 16 has no such
    /// margin, so it gets one here.
    @ViewBuilder func saverStage() -> some View {
        // An explicit filled Rectangle, not just the Color, so the fill is fully
        // opaque edge to edge and the system's widget material can't tint the top.
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(for: .widget) { Rectangle().fill(WColor.stage) }
        } else {
            self.padding(14).background(Rectangle().fill(WColor.stage))
        }
    }

    /// In the Home Screen's Tinted (dark, no-colour) icon appearance, WidgetKit
    /// renders the widget as two tone groups: an "accented" group painted in the
    /// user's bright tint, and a "default" group rendered dim. Anything left in
    /// the default group with a mid-tone colour (mint, `.saverMintText`) drops to
    /// nearly the same value as the card behind it and reads as gone — which is
    /// why the amounts vanished in tinted mode. `widgetAccentable(true)` moves the
    /// key figures into the BRIGHT group so they stay legible. (An earlier attempt
    /// used `false` — the exact wrong direction, it kept them dim — and
    /// `widgetAccentedRenderingMode`, which is `Image`-only and won't build on a
    /// generic view.)
    @ViewBuilder func prominentInTint() -> some View {
        if #available(iOSApplicationExtension 16.0, *) {
            self.widgetAccentable(true)
        } else {
            self
        }
    }
}
