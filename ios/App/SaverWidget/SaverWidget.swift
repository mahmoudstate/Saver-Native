import WidgetKit
import SwiftUI
import UIKit

// Saver home screen widgets. Each reads the one snapshot the app writes into
// the shared App Group and renders it; amounts are already formatted by the app
// so nothing here does money math. Logos and category icons arrive as PNG
// data-URLs (the app rasterises its SVGs). Spacing, type and surfaces all come
// from WidgetTokens.swift.

private let appGroup = "group.com.savertrack.app"

// MARK: - Model

struct Bank: Codable, Identifiable {
    var id: String
    var name: String
    var abbrev: String
    var available: String
    var color: String
    var logo: String?
    var logoFull: Bool?
}

struct Quick: Codable, Identifiable {
    var id: String
    var label: String
    var amount: String
    var color: String
    var icon: String?
}

struct Goal: Codable, Identifiable {
    var id: String?
    var name: String
    var saved: String
    var target: String
    var percent: Int
    var color: String
}

struct BillRow: Codable, Identifiable {
    var id: String
    var name: String
    var amount: String
    var due: String
    var overdue: Bool
    var color: String
    var abbrev: String
    var logo: String?
    var logoFull: Bool?
}

struct Bills: Codable {
    var count: Int
    var total: String
    var nextName: String
    var nextAmount: String
    var nextDueIn: Int?
    var list: [BillRow]?
}

struct WidgetData: Codable {
    var safeToSpend: String
    var totalBalance: String
    var monthSpent: String
    /// Percent change against last month; nil when there's nothing to compare to.
    var spentDelta: Int?
    var bankCount: Int
    var banks: [Bank]
    var quick: [Quick]
    var goal: Goal?
    var goals: [Goal]?
    var bills: Bills

    static let sample = WidgetData(
        safeToSpend: "1,446", totalBalance: "2,310", monthSpent: "540", spentDelta: 12, bankCount: 3,
        banks: [
            Bank(id: "1", name: "Main account", abbrev: "MA", available: "426", color: "#1F8A5C", logo: nil, logoFull: nil),
            Bank(id: "2", name: "Cash wallet", abbrev: "CW", available: "120", color: "#D97706", logo: nil, logoFull: nil),
            Bank(id: "3", name: "Savings", abbrev: "SA", available: "900", color: "#2563EB", logo: nil, logoFull: nil),
        ],
        quick: [
            Quick(id: "q1", label: "Grocery", amount: "150", color: "#0E9F6E", icon: nil),
            Quick(id: "q2", label: "Coffee", amount: "30", color: "#D97706", icon: nil),
            Quick(id: "q3", label: "Transport", amount: "40", color: "#2563EB", icon: nil),
        ],
        goal: Goal(id: "g1", name: "New phone", saved: "600", target: "1,000", percent: 60, color: "#7C3AED"),
        goals: [
            Goal(id: "g1", name: "New phone", saved: "600", target: "1,000", percent: 60, color: "#7C3AED"),
            Goal(id: "g2", name: "Emergency fund", saved: "2,400", target: "10,000", percent: 24, color: "#2563EB"),
        ],
        bills: Bills(count: 2, total: "320", nextName: "Netflix", nextAmount: "120", nextDueIn: 3, list: [
            BillRow(id: "b1", name: "Netflix", amount: "120", due: "In 3d", overdue: false, color: "#E50914", abbrev: "NE", logo: nil, logoFull: nil),
            BillRow(id: "b2", name: "Spotify", amount: "20", due: "In 8d", overdue: false, color: "#1ED760", abbrev: "SP", logo: nil, logoFull: nil),
        ])
    )
}

func loadWidgetData() -> WidgetData {
    guard
        let raw = UserDefaults(suiteName: appGroup)?.string(forKey: "widgetData"),
        let data = raw.data(using: .utf8),
        let parsed = try? JSONDecoder().decode(WidgetData.self, from: data)
    else { return .sample }
    return parsed
}

func decodeImage(_ s: String?) -> UIImage? {
    guard var str = s, !str.isEmpty else { return nil }
    if let comma = str.firstIndex(of: ",") { str = String(str[str.index(after: comma)...]) }
    guard let data = Data(base64Encoded: str) else { return nil }
    return UIImage(data: data)
}

// MARK: - Colors

extension Color {
    /// The brand mint. Fine as a fill you put dark ink on; not fine as text on a
    /// light surface, where it measures 1.4:1 against the card and effectively
    /// isn't there. Use `saverMintText` for numbers and `saverMint` for fills.
    static let saverMint = Color(red: 95 / 255, green: 227 / 255, blue: 192 / 255)
    static let saverMintInk = Color(red: 8 / 255, green: 59 / 255, blue: 48 / 255)
    /// Light mode darkens the mint the same way the app does (mint at 48% over
    /// black), which measures 5.4:1 on the card — the mint itself stays in dark,
    /// where it already reads at 9.4:1.
    static let saverMintText = Color(lightHex: "#2E6D5C", darkHex: "#5FE3C0")

    /// A fixed colour that still answers to light and dark.
    init(lightHex: String, darkHex: String) {
        self = Color(UIColor { $0.userInterfaceStyle == .dark
            ? UIColor(Color(hex: darkHex))
            : UIColor(Color(hex: lightHex)) })
    }

    init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet(charactersIn: "# ")).uppercased()
        var int: UInt64 = 0
        Scanner(string: h).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8) & 0xFF) / 255
        let b = Double(int & 0xFF) / 255
        self = Color(red: r, green: g, blue: b)
    }
}

// MARK: - Shared pieces

private struct AddCircle: View {
    var size: CGFloat = 34
    var body: some View {
        ZStack {
            Circle().fill(Color.saverMint).frame(width: size, height: size)
            Image(systemName: "plus").font(.system(size: size * 0.48, weight: .bold)).foregroundColor(.saverMintInk)
        }
    }
}

// Safe-to-spend / total-balance / spent-this-month face.
//
// A small widget holds one thing, so it fills the stage rather than sitting on a
// card: a lone card inside a small widget is just a box drawn inside a box. The
// number is the widget; the add button is an accessory pinned to the bottom
// corner instead of a target dominating the middle.
private struct StatFace: View {
    let label: String
    let value: String
    /// The line under the number. A small widget has room for exactly one more
    /// fact, and Calendar/Reminders spend it on one — an empty half is the tell
    /// that a widget was laid out rather than designed.
    let support: String
    var tint: Color = .saverMintText
    var showsAdd: Bool = true
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(label).font(WFont.label).foregroundColor(.secondary)
                .lineLimit(1).minimumScaleFactor(0.8)
            Spacer(minLength: WSpace.gap)
            Text(value).font(WFont.hero).foregroundColor(tint)
                .minimumScaleFactor(0.4).lineLimit(1)
                .frame(maxWidth: .infinity, alignment: .leading)
            Text(support).font(WFont.caption).foregroundColor(.secondary)
                .lineLimit(1).minimumScaleFactor(0.7)
                .padding(.top, 2)
            Spacer(minLength: WSpace.gap)
            if showsAdd {
                HStack { Spacer(); AddCircle(size: WMetric.addButton) }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .saverStage()
        .widgetURL(URL(string: showsAdd ? "savertrack://add" : "savertrack://home"))
    }
}

// "Across 4 accounts" — bankCount was already in the payload and unused.
private func accountsLine(_ n: Int) -> String {
    n == 1 ? "Across 1 account" : "Across \(n) accounts"
}

// "12% more than last month" reads as a fact; "+12%" reads as a stock ticker.
private func spentLine(_ delta: Int?) -> String {
    guard let d = delta else { return "First month of spending" }
    if d == 0 { return "Same as last month" }
    if d <= -100 { return "Nothing spent yet" }
    return d > 0 ? "\(d)% more than last month" : "\(abs(d))% less than last month"
}

struct Entry: TimelineEntry { let date: Date; let data: WidgetData }

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> Entry { Entry(date: Date(), data: .sample) }
    func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
        completion(Entry(date: Date(), data: loadWidgetData()))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        completion(Timeline(entries: [Entry(date: Date(), data: loadWidgetData())], policy: .never))
    }
}

// MARK: - 1. Safe to spend  &  2. Total balance

struct SafeToSpendWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "SafeToSpend", provider: Provider()) { StatFace(label: "SAFE TO SPEND", value: $0.data.safeToSpend, support: accountsLine($0.data.bankCount)) }
            .configurationDisplayName("Safe to spend")
            .description("What is safe to spend right now, with a quick add button.")
            .supportedFamilies([.systemSmall])
    }
}

struct TotalBalanceWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "TotalBalance", provider: Provider()) { StatFace(label: "TOTAL BALANCE", value: $0.data.totalBalance, support: accountsLine($0.data.bankCount)) }
            .configurationDisplayName("Total balance")
            .description("Your total balance across all accounts.")
            .supportedFamilies([.systemSmall])
    }
}

// MARK: - 3. Quick add

// One shortcut on its own card: icon, the amount it logs, what it's called.
private struct QuickTile: View {
    @Environment(\.colorScheme) private var scheme
    let quick: Quick
    var body: some View {
        // The tint behind the icon sits on the card, not the dark stage: at 0.22
        // it read on the dark card but nearly vanished on the light one, so light
        // mode gets a stronger wash.
        let tintOpacity = scheme == .dark ? 0.22 : 0.28
        return SurfaceCard {
            VStack(alignment: .leading, spacing: WSpace.tight) {
                ZStack {
                    Circle().fill(Color(hex: quick.color).opacity(tintOpacity)).frame(width: 30, height: 30)
                    if let ui = decodeImage(quick.icon) {
                        Image(uiImage: ui).resizable().scaledToFit().frame(width: 17, height: 17)
                    } else {
                        Image(systemName: "tag.fill").font(.system(size: 13, weight: .semibold)).foregroundColor(Color(hex: quick.color))
                    }
                }
                Spacer(minLength: WSpace.tight)
                Text(quick.amount).font(WFont.rowValue).foregroundColor(.primary)
                    .lineLimit(1).minimumScaleFactor(0.5)
                Text(quick.label).font(WFont.caption).foregroundColor(.secondary)
                    .lineLimit(1).minimumScaleFactor(0.6)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

// The wide card the widget opens with — the shortcut everyone needs, given the
// full width, the way the YouTube widget leads with its search bar.
private struct AddBar: View {
    var body: some View {
        SurfaceCard {
            HStack(spacing: WSpace.gap) {
                AddCircle(size: WMetric.addButton)
                Text("Add expense").font(WFont.rowName).foregroundColor(.primary)
                Spacer(minLength: 0)
            }
            .frame(maxHeight: .infinity)
        }
        .frame(height: WMetric.barHeight)
    }
}

struct QuickAddView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var body: some View {
        if family == .systemSmall {
            VStack(alignment: .leading, spacing: 0) {
                Text("QUICK ADD").font(WFont.label).foregroundColor(.secondary)
                Spacer()
                AddCircle(size: 50)
                Spacer()
                Text("Add expense").font(WFont.caption).foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .saverStage()
            .widgetURL(URL(string: "savertrack://add"))
        } else {
            // Four shortcuts, not three: the app already caps them at four, and
            // cutting one here is half of why a fourth never showed up.
            let shown = Array(data.quick.prefix(4))
            VStack(spacing: WSpace.gap) {
                Link(destination: URL(string: "savertrack://add")!) { AddBar() }
                HStack(spacing: WSpace.gap) {
                    ForEach(shown) { q in
                        Link(destination: URL(string: "savertrack://quick/\(q.id)")!) { QuickTile(quick: q) }
                            .frame(maxWidth: .infinity)
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .saverStage()
        }
    }
}

struct QuickAddWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "QuickAdd", provider: Provider()) { QuickAddView(data: $0.data) }
            .configurationDisplayName("Quick add")
            .description("Your quick actions plus a one tap add button.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - 4. Banks (batteries style, with logos)

// Round logo — a padded brand mark on white, a full-bleed image, or a coloured
// monogram fallback. Shared by accounts and bills so a logo looks the same in
// both. Takes raw fields rather than a Bank so any row type can use it.
private struct LogoCircle: View {
    let logo: String?
    let logoFull: Bool
    let color: String
    let abbrev: String
    var size: CGFloat
    var body: some View {
        ZStack {
            if let ui = decodeImage(logo) {
                if logoFull {
                    Image(uiImage: ui).resizable().scaledToFill().frame(width: size, height: size).clipShape(Circle())
                } else {
                    // The white disc these logos sit on vanishes into a light-mode
                    // card, leaving the mark floating; the hairline gives it an edge.
                    Circle().fill(Color.white)
                        .overlay(Circle().stroke(Color.black.opacity(0.10), lineWidth: 0.5))
                        .frame(width: size, height: size)
                    Image(uiImage: ui).resizable().scaledToFit().frame(width: size * 0.69, height: size * 0.69)
                }
            } else {
                Circle().fill(Color(hex: color)).frame(width: size, height: size)
                Text(abbrev).font(.system(size: size * 0.33, weight: .heavy)).foregroundColor(.white)
            }
        }
        .frame(width: size, height: size)
    }
}

private func BankLogoCircle(bank: Bank, size: CGFloat) -> LogoCircle {
    LogoCircle(logo: bank.logo, logoFull: bank.logoFull == true, color: bank.color, abbrev: bank.abbrev, size: size)
}

// The header every accounts widget opens with: what's available, and the way to
// add. Two tap targets living on one card — Links can't nest, so the stat and
// the add button are separate Links sharing the card's background.
private struct AvailableHeader: View {
    let value: String
    /// The large widget can afford a taller header and a bigger number; giving
    /// both sizes the identical header made the two read as the same widget.
    var prominent: Bool = false
    var body: some View {
        SurfaceCard {
            HStack(spacing: WSpace.gap) {
                Link(destination: URL(string: "savertrack://home")!) {
                    VStack(alignment: .leading, spacing: WSpace.tight) {
                        Text("AVAILABLE TO SPEND").font(WFont.label).foregroundColor(.secondary)
                        Text(value).font(prominent ? WFont.heroLarge : WFont.hero).foregroundColor(.saverMintText)
                            .lineLimit(1).minimumScaleFactor(0.4)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                Link(destination: URL(string: "savertrack://add")!) { AddCircle(size: prominent ? 40 : 36) }
                    .layoutPriority(1)
            }
        }
        // Height from its content, width from the widget — without this the card
        // takes an equal share of the height like the rows below it.
        .frame(height: WMetric.headerHeight)
    }
}

// One account on its own card: logo, name, amount at the trailing edge. Its own
// card rather than a row in a shared one, so each account reads as its own thing
// and carries its own tap target. Flips for Arabic on its own.
private struct BankRowCard: View {
    let bank: Bank
    var body: some View {
        SurfaceCard {
            HStack(spacing: WSpace.gap) {
                BankLogoCircle(bank: bank, size: WMetric.logo)
                Text(bank.name).font(WFont.rowName).foregroundColor(.primary)
                    .lineLimit(1).minimumScaleFactor(0.7)
                Spacer(minLength: WSpace.gap)
                Text(bank.available).font(WFont.rowValue).foregroundColor(.saverMintText)
                    .lineLimit(1).minimumScaleFactor(0.6)
                    .layoutPriority(1)
            }
        }
        .frame(minHeight: WMetric.row, maxHeight: WMetric.rowMax)
    }
}

// Medium tile: one account as its own card. Laid out across rather than down —
// the medium widget only leaves a tile 46pt of content, and a logo stacked over
// a name over an amount needs 61. Side by side, the same three facts need 39.
private struct BankTile: View {
    let bank: Bank
    var body: some View {
        SurfaceCard {
            HStack(spacing: WSpace.tight + 2) {
                BankLogoCircle(bank: bank, size: WMetric.logo)
                VStack(alignment: .leading, spacing: 1) {
                    Text(bank.name).font(WFont.caption).foregroundColor(.secondary)
                        .lineLimit(1).minimumScaleFactor(0.7)
                    Text(bank.available).font(WFont.rowValue).foregroundColor(.saverMintText)
                        .lineLimit(1).minimumScaleFactor(0.65)
                }
                Spacer(minLength: 0)
            }
            .frame(maxHeight: .infinity)
        }
    }
}

struct BanksView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var body: some View {
        if family == .systemLarge { large } else { medium }
    }

    // Large: the header card, then one card per account — each its own link into
    // that account, the way each YouTube tile opens its own tab.
    private var large: some View {
        let shown = Array(data.banks.prefix(6))
        return VStack(spacing: WSpace.gap) {
            AvailableHeader(value: data.safeToSpend, prominent: true)
            // The rows own the rest of the widget and share it between them, so
            // fewer accounts means taller cards rather than a hole at the bottom.
            // Centred, so once they hit their ceiling the slack splits evenly.
            VStack(spacing: WSpace.gap) {
                ForEach(shown) { bank in
                    Link(destination: URL(string: "savertrack://account/\(bank.id)")!) {
                        BankRowCard(bank: bank)
                    }
                }
            }
            .frame(maxHeight: .infinity, alignment: .center)
        }
        .saverStage()
    }

    // Medium: header card, then up to three account cards side by side. Three,
    // not four — a fourth is what made these run together in the first place.
    private var medium: some View {
        let shown = Array(data.banks.prefix(3))
        return VStack(spacing: WSpace.gap) {
            AvailableHeader(value: data.safeToSpend)
            HStack(spacing: WSpace.gap) {
                ForEach(shown) { bank in
                    Link(destination: URL(string: "savertrack://account/\(bank.id)")!) {
                        BankTile(bank: bank)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .saverStage()
    }
}

struct BanksWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "Banks", provider: Provider()) { BanksView(data: $0.data) }
            .configurationDisplayName("Accounts")
            .description("Each account and what is available to spend from it.")
            .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - 5. Savings goals (rings, batteries-style)

// A goal as a progress ring with the percent inside and its name beneath. Just
// the dial + label; the surrounding card is the caller's, so the tile and the
// full-widget hero can share it.
private struct GoalRing: View {
    let goal: Goal
    var ring: CGFloat
    /// The line under the name — the saved amount in a tile, "saved of target"
    /// on the small widget where there's room for both.
    var subtitle: String?
    var body: some View {
        VStack(spacing: WSpace.gap) {
            ZStack {
                Circle().stroke(Color.primary.opacity(0.14), lineWidth: ring * 0.1)
                Circle().trim(from: 0, to: CGFloat(goal.percent) / 100)
                    .stroke(Color(hex: goal.color), style: StrokeStyle(lineWidth: ring * 0.1, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Text("\(goal.percent)%").font(.system(size: ring * 0.27, weight: .heavy, design: .rounded))
                    .foregroundColor(.primary).lineLimit(1).minimumScaleFactor(0.5)
            }
            .frame(width: ring, height: ring)
            VStack(spacing: 1) {
                Text(goal.name).font(WFont.caption).foregroundColor(.primary)
                    .lineLimit(1).minimumScaleFactor(0.6)
                if let subtitle {
                    Text(subtitle).font(WFont.caption).foregroundColor(.secondary)
                        .lineLimit(1).minimumScaleFactor(0.6)
                }
            }
        }
    }
}

struct GoalView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var body: some View {
        let goals = data.goals ?? data.goal.map { [$0] } ?? []
        if goals.isEmpty {
            SurfaceCard {
                VStack(spacing: WSpace.tight) {
                    Image(systemName: "target").font(.system(size: 24)).foregroundColor(.secondary)
                    Text("No active goal").font(WFont.caption).foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .saverStage()
            .widgetURL(URL(string: "savertrack://home"))
        } else if family == .systemSmall {
            // One dial filling its own card, with the amount underneath.
            Link(destination: URL(string: "savertrack://home")!) {
                SurfaceCard {
                    GoalRing(goal: goals[0], ring: 74, subtitle: "\(goals[0].saved) of \(goals[0].target)")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .saverStage()
        } else {
            // A "GOALS" header on its own card, then a row of dial cards. The
            // header is a card, not bare text, so the top of the widget is grey
            // like the bills widget: the system paints a legibility sheen on the
            // widget's top edge, and over exposed black (bare text) it reads as a
            // grey gradient, while over a card it's barely there.
            let ring: CGFloat = goals.count >= 4 ? 48 : 56
            VStack(spacing: WSpace.gap) {
                SurfaceCard {
                    HStack {
                        Text("GOALS").font(WFont.label).foregroundColor(.secondary)
                        Spacer()
                        Text(goals.count == 1 ? "1 active" : "\(goals.count) active")
                            .font(WFont.caption).foregroundColor(.secondary)
                    }
                    .frame(maxHeight: .infinity)
                }
                .frame(height: 38)
                HStack(spacing: WSpace.gap) {
                    ForEach(goals) { goal in
                        Link(destination: URL(string: "savertrack://home")!) {
                            SurfaceCard {
                                GoalRing(goal: goal, ring: ring, subtitle: goals.count <= 3 ? goal.saved : nil)
                                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                            }
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .frame(maxHeight: .infinity)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .saverStage()
        }
    }
}

struct GoalWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "Goal", provider: Provider()) { GoalView(data: $0.data) }
            .configurationDisplayName("Savings goals")
            .description("Progress toward your savings goals.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - 6. Spent this month

struct MonthSpentView: View {
    let data: WidgetData
    var body: some View {
        // Money going out, so it doesn't wear the mint the balances wear.
        StatFace(label: "SPENT THIS MONTH", value: data.monthSpent, support: spentLine(data.spentDelta), tint: .primary)
    }
}

struct MonthSpentWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MonthSpent", provider: Provider()) { MonthSpentView(data: $0.data) }
            .configurationDisplayName("Spent this month")
            .description("How much you have spent so far this month.")
            .supportedFamilies([.systemSmall])
    }
}

// MARK: - 7. Bills due

// One upcoming bill on its own card: logo, name over its due label, amount at
// the trailing edge. Same rhythm as an account row.
private struct BillRowCard: View {
    let bill: BillRow
    var body: some View {
        SurfaceCard(padding: WSpace.card - 1) {
            HStack(spacing: WSpace.gap - 1) {
                LogoCircle(logo: bill.logo, logoFull: bill.logoFull == true, color: bill.color, abbrev: bill.abbrev, size: WMetric.logoCompact)
                VStack(alignment: .leading, spacing: 0) {
                    Text(bill.name).font(WFont.rowName).foregroundColor(.primary)
                        .lineLimit(1).minimumScaleFactor(0.7)
                    Text(bill.due).font(WFont.caption)
                        .foregroundColor(bill.overdue ? Color(hex: "#F2766E") : .secondary)
                        .lineLimit(1).minimumScaleFactor(0.7)
                }
                Spacer(minLength: WSpace.gap)
                Text(bill.amount).font(WFont.rowValue).foregroundColor(.primary)
                    .lineLimit(1).minimumScaleFactor(0.6)
            }
            .frame(maxHeight: .infinity)
        }
        .frame(minHeight: WMetric.rowCompact, maxHeight: WMetric.rowMax)
    }
}

struct BillsView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var body: some View {
        if family == .systemMedium { medium } else { small }
    }

    // Small: the total due as the hero, with the very next bill on its own card.
    private var small: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("BILLS DUE").font(WFont.label).foregroundColor(.secondary)
            Spacer(minLength: WSpace.gap)
            Text(data.bills.count > 0 ? data.bills.total : "0")
                .font(WFont.hero).foregroundColor(.primary)
                .lineLimit(1).minimumScaleFactor(0.4)
            Text(data.bills.count > 0 ? "\(data.bills.count) unpaid" : "All paid")
                .font(WFont.caption).foregroundColor(.secondary)
                .lineLimit(1).minimumScaleFactor(0.7)
            Spacer(minLength: WSpace.gap)
            if !data.bills.nextName.isEmpty {
                SurfaceCard {
                    VStack(alignment: .leading, spacing: 1) {
                        Text(data.bills.nextName).font(WFont.caption).foregroundColor(.primary)
                            .lineLimit(1).minimumScaleFactor(0.7)
                        Text(data.bills.nextAmount).font(WFont.rowValue).foregroundColor(.primary)
                            .lineLimit(1).minimumScaleFactor(0.5)
                    }
                }
                .frame(height: WMetric.barHeight)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .saverStage()
        .widgetURL(URL(string: "savertrack://bills"))
    }

    // Medium: a one-line total-due header, then the soonest bills on their own
    // cards. Two rows, not three: 138pt of widget only pays for a 44pt header,
    // a gap and two 39pt rows — a third would squeeze them all together.
    private var medium: some View {
        let list = Array((data.bills.list ?? []).prefix(2))
        return VStack(spacing: WSpace.gap) {
            SurfaceCard {
                HStack(spacing: WSpace.gap) {
                    Text("BILLS DUE").font(WFont.label).foregroundColor(.secondary)
                    Spacer(minLength: 0)
                    Text(data.bills.count > 0 ? data.bills.total : "All paid")
                        .font(WFont.heroSmall).foregroundColor(.primary)
                        .lineLimit(1).minimumScaleFactor(0.4)
                }
                .frame(maxHeight: .infinity)
            }
            .frame(height: WMetric.headerCompact)
            if list.isEmpty {
                Spacer(minLength: 0)
            } else {
                VStack(spacing: WSpace.gap) {
                    ForEach(list) { bill in
                        Link(destination: URL(string: "savertrack://bills")!) { BillRowCard(bill: bill) }
                    }
                }
                .frame(maxHeight: .infinity, alignment: .center)
            }
        }
        .saverStage()
        .widgetURL(URL(string: "savertrack://bills"))
    }
}

struct BillsWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "Bills", provider: Provider()) { BillsView(data: $0.data) }
            .configurationDisplayName("Bills due")
            .description("What is due and coming up next.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Bundle

@main
struct SaverWidgetBundle: WidgetBundle {
    var body: some Widget {
        SafeToSpendWidget()
        TotalBalanceWidget()
        QuickAddWidget()
        BanksWidget()
        GoalWidget()
        MonthSpentWidget()
        BillsWidget()
    }
}
