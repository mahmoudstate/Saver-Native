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
}

// MARK: - Metrics

// Heights are derived from content plus the one padding, never picked by eye —
// and sized for the SMALLEST widget, because widget size follows the device.
// A medium widget is 364x170 on a 430pt iPhone but only 338x158 on a 393pt one,
// so the content budget is 138 on the big phones and 126 on the small ones. Fit
// 126 or the layout collapses on half the devices: a 44pt header plus two 38pt
// rows and their gaps needs 136, which is what pushed the bills rows together.
enum WMetric {
    /// Kept well under half the shortest card (34pt rows): at 18 the radius met
    /// in the middle and the rows rendered as capsules instead of cards.
    static let cardRadius: CGFloat = 12
    static let logo: CGFloat = 22
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
    static let logoCompact: CGFloat = 20
    /// padding + button + padding.
    static var barHeight: CGFloat { WSpace.card * 2 + addButton }
}

// MARK: - Surface

/// The card every section sits on. One fill, one radius, one padding.
struct SurfaceCard<Content: View>: View {
    var padding: CGFloat = WSpace.card
    @ViewBuilder var content: () -> Content

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: WMetric.cardRadius, style: .continuous)
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .background(WColor.card, in: shape)
            .overlay(shape.strokeBorder(WColor.cardBorder.opacity(0.12), lineWidth: 0.75))
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
}
