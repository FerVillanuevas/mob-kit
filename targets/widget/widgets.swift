import WidgetKit
import SwiftUI

// MARK: - Data Models
struct EinsteinResponse: Codable {
    let recoUUID: String
    let recs: [Rec]
}

struct Rec: Codable {
    let id: String
    let image_url: String
    let product_name: String
    let product_url: String
}

// MARK: - Timeline Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(recommendations: sampleRecommendations())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let recommendations = loadRecommendations()
        let entry = SimpleEntry(recommendations: recommendations)
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let recommendations = loadRecommendations()
        let entry = SimpleEntry(recommendations: recommendations)
        let timeline = Timeline(entries: [entry], policy: .never)
        completion(timeline)
    }
    
    private func loadRecommendations() -> [Rec] {
        let defaults = UserDefaults(suiteName: "group.com.fervillanuev4s.mob-widget")
        guard let jsonString = defaults?.string(forKey: "recomendation"),
              let jsonData = jsonString.data(using: .utf8) else {
            return sampleRecommendations()
        }
        
        do {
            let response = try JSONDecoder().decode(EinsteinResponse.self, from: jsonData)
            return response.recs
        } catch {
            print("Error decoding recommendations: \(error)")
            return sampleRecommendations()
        }
    }
    
    private func sampleRecommendations() -> [Rec] {
        return [
            Rec(id: "1", image_url: "", product_name: "Sample Product 1", product_url: ""),
            Rec(id: "2", image_url: "", product_name: "Sample Product 2", product_url: ""),
            Rec(id: "3", image_url: "", product_name: "Sample Product 3", product_url: "")
        ]
    }
}

// MARK: - Timeline Entry
struct SimpleEntry: TimelineEntry {
    let date: Date = Date()
    let recommendations: [Rec]
}

// MARK: - Widget Views
struct widgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(recommendations: entry.recommendations)
        case .systemMedium:
            MediumWidgetView(recommendations: entry.recommendations)
        case .systemLarge:
            LargeWidgetView(recommendations: entry.recommendations)
        default:
            SmallWidgetView(recommendations: entry.recommendations)
        }
    }
}

struct SmallWidgetView: View {
    let recommendations: [Rec]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "star.fill")
                    .foregroundColor(.yellow)
                    .font(.caption)
                Text("Recommended")
                    .font(.caption)
                    .fontWeight(.semibold)
                Spacer()
            }
            
            if let firstRec = recommendations.first {
                VStack(alignment: .leading, spacing: 2) {
                    Text(firstRec.product_name)
                        .font(.caption)
                        .fontWeight(.medium)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                }
            } else {
                Text("No recommendations available")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding()
    }
}

struct MediumWidgetView: View {
    let recommendations: [Rec]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "star.fill")
                    .foregroundColor(.yellow)
                Text("Product Recommendations")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
            }
            
            if recommendations.isEmpty {
                Text("No recommendations available")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
            } else {
                HStack(spacing: 12) {
                    ForEach(Array(recommendations.prefix(2).enumerated()), id: \.element.id) { index, rec in
                        VStack(alignment: .leading, spacing: 4) {
                            RoundedRectangle(cornerRadius: 6)
                                .fill(Color.gray.opacity(0.3))
                                .overlay(
                                    Image(systemName: "tag")
                                        .foregroundColor(.gray)
                                        .font(.caption)
                                )
                                .frame(height: 50)
                            
                            Text(rec.product_name)
                                .font(.caption)
                                .fontWeight(.medium)
                                .lineLimit(2)
                                .multilineTextAlignment(.leading)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                Spacer()
            }
        }
        .padding()
    }
}

struct LargeWidgetView: View {
    let recommendations: [Rec]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "star.fill")
                    .foregroundColor(.yellow)
                Text("Product Recommendations")
                    .font(.title2)
                    .fontWeight(.bold)
                Spacer()
            }
            
            if recommendations.isEmpty {
                Text("No recommendations available")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
            } else {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 12) {
                    ForEach(Array(recommendations.prefix(4).enumerated()), id: \.element.id) { index, rec in
                        VStack(alignment: .leading, spacing: 6) {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.gray.opacity(0.3))
                                .overlay(
                                    Image(systemName: "tag")
                                        .foregroundColor(.gray)
                                )
                                .frame(height: 80)
                            
                            Text(rec.product_name)
                                .font(.caption)
                                .fontWeight(.medium)
                                .lineLimit(2)
                                .multilineTextAlignment(.leading)
                        }
                    }
                }
                Spacer()
            }
        }
        .padding()
    }
}

// MARK: - Widget Configuration
struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Product Recommendations")
        .description("Shows personalized product recommendations")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Previews
#Preview(as: .systemSmall) {
    widget()
} timeline: {
    SimpleEntry(recommendations: [
        Rec(id: "1", image_url: "https://example.com/product1.jpg", product_name: "Wireless Headphones", product_url: "https://example.com/product1"),
        Rec(id: "2", image_url: "https://example.com/product2.jpg", product_name: "Smart Watch", product_url: "https://example.com/product2")
    ])
    SimpleEntry(recommendations: [])
}

#Preview(as: .systemMedium) {
    widget()
} timeline: {
    SimpleEntry(recommendations: [
        Rec(id: "1", image_url: "https://example.com/product1.jpg", product_name: "Wireless Headphones", product_url: "https://example.com/product1"),
        Rec(id: "2", image_url: "https://example.com/product2.jpg", product_name: "Smart Watch", product_url: "https://example.com/product2")
    ])
}

#Preview(as: .systemLarge) {
    widget()
} timeline: {
    SimpleEntry(recommendations: [
        Rec(id: "1", image_url: "https://example.com/product1.jpg", product_name: "Wireless Headphones", product_url: "https://example.com/product1"),
        Rec(id: "2", image_url: "https://example.com/product2.jpg", product_name: "Smart Watch", product_url: "https://example.com/product2"),
        Rec(id: "3", image_url: "https://example.com/product3.jpg", product_name: "Bluetooth Speaker", product_url: "https://example.com/product3"),
        Rec(id: "4", image_url: "https://example.com/product4.jpg", product_name: "Phone Case", product_url: "https://example.com/product4")
    ])
}
