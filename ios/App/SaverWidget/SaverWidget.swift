import WidgetKit
import SwiftUI
import UIKit

// Saver home screen widgets. Each reads the one snapshot the app writes into
// the shared App Group and renders it; amounts are already formatted by the app
// so nothing here does money math. Logos and category icons arrive as PNG
// data-URLs (the app rasterises its SVGs). Colors lean on system semantic
// colors so light and dark both look right; the mint accent and per-item colors
// are fixed values.

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

struct Goal: Codable {
    var name: String
    var saved: String
    var target: String
    var percent: Int
    var color: String
}

struct Bills: Codable {
    var count: Int
    var total: String
    var nextName: String
    var nextAmount: String
    var nextDueIn: Int?
}

struct WidgetData: Codable {
    var safeToSpend: String
    var totalBalance: String
    var monthSpent: String
    var bankCount: Int
    var banks: [Bank]
    var quick: [Quick]
    var goal: Goal?
    var bills: Bills

    static let sample = WidgetData(
        safeToSpend: "1,446", totalBalance: "2,310", monthSpent: "540", bankCount: 3,
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
        goal: Goal(name: "New phone", saved: "600", target: "1,000", percent: 60, color: "#7C3AED"),
        bills: Bills(count: 2, total: "320", nextName: "Netflix", nextAmount: "120", nextDueIn: 3)
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
    static let saverMint = Color(red: 95 / 255, green: 227 / 255, blue: 192 / 255)
    static let saverMintInk = Color(red: 8 / 255, green: 59 / 255, blue: 48 / 255)

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

extension View {
    @ViewBuilder func saverBackground() -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(for: .widget) { Color(.systemBackground) }
        } else {
            self.background(Color(.systemBackground))
        }
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

// Safe-to-spend / total-balance face: label, big number, and a big add button
// centered under it.
private struct StatFace: View {
    let label: String
    let value: String
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(label).font(.system(size: 11, weight: .bold)).foregroundColor(.secondary)
            Spacer()
            Text(value).font(.system(size: 28, weight: .heavy)).foregroundColor(.primary)
                .minimumScaleFactor(0.4).lineLimit(1)
                .frame(maxWidth: .infinity, alignment: .leading)
            Spacer()
            HStack { Spacer(); AddCircle(size: 46); Spacer() }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16).saverBackground()
        .widgetURL(URL(string: "savertrack://add"))
    }
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
        StaticConfiguration(kind: "SafeToSpend", provider: Provider()) { StatFace(label: "SAFE TO SPEND", value: $0.data.safeToSpend) }
            .configurationDisplayName("Safe to spend")
            .description("What is safe to spend right now, with a quick add button.")
            .supportedFamilies([.systemSmall])
    }
}

struct TotalBalanceWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "TotalBalance", provider: Provider()) { StatFace(label: "TOTAL BALANCE", value: $0.data.totalBalance) }
            .configurationDisplayName("Total balance")
            .description("Your total balance across all accounts.")
            .supportedFamilies([.systemSmall])
    }
}

// MARK: - 3. Quick add

private struct QuickChip: View {
    let quick: Quick
    var body: some View {
        VStack(spacing: 7) {
            ZStack {
                Circle().fill(Color(hex: quick.color).opacity(0.18)).frame(width: 50, height: 50)
                if let ui = decodeImage(quick.icon) {
                    Image(uiImage: ui).resizable().scaledToFit().frame(width: 27, height: 27)
                } else {
                    Image(systemName: "tag.fill").font(.system(size: 20, weight: .semibold)).foregroundColor(Color(hex: quick.color))
                }
            }
            Text(quick.amount).font(.system(size: 13, weight: .bold)).foregroundColor(.primary).lineLimit(1).minimumScaleFactor(0.6)
            Text(quick.label).font(.system(size: 10, weight: .semibold)).foregroundColor(.secondary).lineLimit(1).minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity)
    }
}

struct QuickAddView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var body: some View {
        if family == .systemSmall {
            VStack(spacing: 10) {
                AddCircle(size: 54)
                Text("Add expense").font(.system(size: 12, weight: .semibold)).foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(14).saverBackground()
            .widgetURL(URL(string: "savertrack://add"))
        } else {
            HStack(spacing: 6) {
                ForEach(data.quick.prefix(3)) { q in
                    Link(destination: URL(string: "savertrack://quick/\(q.id)")!) { QuickChip(quick: q) }
                }
                Link(destination: URL(string: "savertrack://add")!) {
                    VStack(spacing: 7) {
                        AddCircle(size: 50)
                        Text("Add").font(.system(size: 10, weight: .semibold)).foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.horizontal, 12).padding(.vertical, 14).saverBackground()
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

// Round bank logo (white padded, full-bleed, or a coloured abbrev fallback),
// shared by the compact grid tile and the large-widget list row.
private struct BankLogoCircle: View {
    let bank: Bank
    var size: CGFloat
    var body: some View {
        ZStack {
            if let ui = decodeImage(bank.logo) {
                if bank.logoFull == true {
                    Image(uiImage: ui).resizable().scaledToFill().frame(width: size, height: size).clipShape(Circle())
                } else {
                    Circle().fill(Color.white).frame(width: size, height: size)
                    Image(uiImage: ui).resizable().scaledToFit().frame(width: size * 0.69, height: size * 0.69)
                }
            } else {
                Circle().fill(Color(hex: bank.color)).frame(width: size, height: size)
                Text(bank.abbrev).font(.system(size: size * 0.33, weight: .heavy)).foregroundColor(.white)
            }
        }
        .frame(width: size, height: size)
    }
}

// Compact tile used by the medium banks grid: logo over name over amount.
private struct BankChip: View {
    let bank: Bank
    var body: some View {
        VStack(spacing: 7) {
            BankLogoCircle(bank: bank, size: 52)
            Text(bank.name).font(.system(size: 10, weight: .semibold)).foregroundColor(.secondary).lineLimit(1).minimumScaleFactor(0.7)
            Text(bank.available).font(.system(size: 17, weight: .heavy)).foregroundColor(.saverMint).lineLimit(1).minimumScaleFactor(0.5)
        }
        .frame(maxWidth: .infinity)
    }
}

// One line of the large banks list: logo + name on the leading side, amount
// pinned to the trailing edge. Flips correctly for Arabic (RTL).
private struct BankRow: View {
    let bank: Bank
    var body: some View {
        HStack(spacing: 12) {
            BankLogoCircle(bank: bank, size: 40)
            Text(bank.name).font(.system(size: 15, weight: .semibold)).foregroundColor(.primary).lineLimit(1).minimumScaleFactor(0.7)
            Spacer(minLength: 8)
            Text(bank.available).font(.system(size: 18, weight: .heavy)).foregroundColor(.saverMint).lineLimit(1).minimumScaleFactor(0.5)
        }
    }
}

struct BanksView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var body: some View {
        if family == .systemLarge { large } else { medium }
    }

    // Large: total available to spend up top with a quick-add button, then each
    // account as its own clean row.
    private var large: some View {
        let shown = Array(data.banks.prefix(6))
        return VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("AVAILABLE TO SPEND").font(.system(size: 11, weight: .bold)).foregroundColor(.secondary)
                    Text(data.safeToSpend).font(.system(size: 30, weight: .heavy)).foregroundColor(.saverMint)
                        .lineLimit(1).minimumScaleFactor(0.5)
                }
                Spacer()
                Link(destination: URL(string: "savertrack://add")!) { AddCircle(size: 34) }
            }
            Divider().padding(.top, 12).padding(.bottom, 10)
            VStack(spacing: 12) { ForEach(shown) { BankRow(bank: $0) } }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(16).saverBackground()
        .widgetURL(URL(string: "savertrack://home"))
    }

    // Medium: compact grid of up to four account tiles.
    private var medium: some View {
        let shown = Array(data.banks.prefix(4))
        return VStack(alignment: .leading, spacing: 14) {
            Text("AVAILABLE PER BANK").font(.system(size: 11, weight: .bold)).foregroundColor(.secondary)
            HStack(alignment: .top, spacing: 6) { ForEach(shown) { BankChip(bank: $0) } }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(16).saverBackground()
        .widgetURL(URL(string: "savertrack://home"))
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

// MARK: - 5. Savings goal progress

struct GoalView: View {
    let data: WidgetData
    var body: some View {
        if let goal = data.goal {
            HStack(spacing: 16) {
                ZStack {
                    Circle().stroke(Color.gray.opacity(0.2), lineWidth: 9)
                    Circle().trim(from: 0, to: CGFloat(goal.percent) / 100)
                        .stroke(Color(hex: goal.color), style: StrokeStyle(lineWidth: 9, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    Text("\(goal.percent)%").font(.system(size: 17, weight: .heavy)).foregroundColor(.primary)
                }
                .frame(width: 74, height: 74)
                VStack(alignment: .leading, spacing: 3) {
                    Text(goal.name).font(.system(size: 15, weight: .bold)).foregroundColor(.primary).lineLimit(1)
                    Text("\(goal.saved) of \(goal.target)").font(.system(size: 12, weight: .semibold)).foregroundColor(.secondary)
                }
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .padding(16).saverBackground()
            .widgetURL(URL(string: "savertrack://home"))
        } else {
            Text("No active goal").font(.system(size: 13, weight: .semibold)).foregroundColor(.secondary)
                .frame(maxWidth: .infinity, maxHeight: .infinity).padding(16).saverBackground()
        }
    }
}

struct GoalWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "Goal", provider: Provider()) { GoalView(data: $0.data) }
            .configurationDisplayName("Savings goal")
            .description("Progress toward your savings goal.")
            .supportedFamilies([.systemMedium])
    }
}

// MARK: - 6. Spent this month

struct MonthSpentView: View {
    let data: WidgetData
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("SPENT THIS MONTH").font(.system(size: 11, weight: .bold)).foregroundColor(.secondary)
            Spacer()
            Text(data.monthSpent).font(.system(size: 30, weight: .heavy)).foregroundColor(.primary)
                .minimumScaleFactor(0.4).lineLimit(1)
                .frame(maxWidth: .infinity, alignment: .leading)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16).saverBackground()
        .widgetURL(URL(string: "savertrack://home"))
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

struct BillsView: View {
    let data: WidgetData
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("BILLS DUE").font(.system(size: 11, weight: .bold)).foregroundColor(.secondary)
            Spacer()
            Text("\(data.bills.count)").font(.system(size: 36, weight: .heavy)).foregroundColor(.primary)
            if data.bills.count > 0 {
                Text("\(data.bills.total) total").font(.system(size: 12, weight: .semibold)).foregroundColor(.secondary)
            }
            Spacer()
            if !data.bills.nextName.isEmpty {
                Text("Next: \(data.bills.nextName)").font(.system(size: 12, weight: .semibold)).foregroundColor(.primary).lineLimit(1)
            } else {
                Text("All paid").font(.system(size: 12, weight: .semibold)).foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16).saverBackground()
        .widgetURL(URL(string: "savertrack://bills"))
    }
}

struct BillsWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "Bills", provider: Provider()) { BillsView(data: $0.data) }
            .configurationDisplayName("Bills due")
            .description("How many bills are due and what is coming up next.")
            .supportedFamilies([.systemSmall])
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
