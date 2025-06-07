import WidgetKit
import SwiftUI

// MARK: - Data Models
struct EinsteinResponse: Codable {
    let recoUUID: String
    let recs: [Rec]
}

struct Rec: Codable, Identifiable {
    let id: String
    let image_url: String
    let product_name: String
    let product_url: String
}

// MARK: - Timeline Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), recommendation: sampleRecommendations().first, image: UIImage(named: "placeholder"))
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), recommendation: sampleRecommendations().first, image: UIImage(named: "placeholder"))
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        Task {
            // 1. Load the recommendation data from UserDefaults
            let recommendations = loadRecommendations()
            guard !recommendations.isEmpty else {
                let entry = SimpleEntry(date: Date(), recommendation: nil, image: nil)
                let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600))) // Try again in an hour
                completion(timeline)
                return
            }

            var entries: [SimpleEntry] = []
            let currentDate = Date()

            // 2. Asynchronously download images and create an entry for each recommendation
            for (index, rec) in recommendations.enumerated() {
                // Set the display time for each entry (e.g., 30 seconds apart for better viewing)
                let entryDate = Calendar.current.date(byAdding: .second, value: index * 30, to: currentDate)!
                if let url = URL(string: rec.image_url), let image = await downloadImage(from: url) {
                    let entry = SimpleEntry(date: entryDate, recommendation: rec, image: image)
                    entries.append(entry)
                } else {
                    // Create entry without image if download fails
                    let entry = SimpleEntry(date: entryDate, recommendation: rec, image: nil)
                    entries.append(entry)
                }
            }
            
            // If no entries were created, create a placeholder timeline
            if entries.isEmpty {
                let entry = SimpleEntry(date: Date(), recommendation: recommendations.first, image: UIImage(named: "placeholder"))
                entries.append(entry)
            }

            // 3. Create the timeline with the downloaded entries and set the refresh policy
            let timeline = Timeline(entries: entries, policy: .atEnd)
            completion(timeline)
        }
    }
    
    // Asynchronous function to download an image from a URL
    private func downloadImage(from url: URL) async -> UIImage? {
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            return UIImage(data: data)
        } catch {
            print("Error downloading image: \(error)")
            return nil
        }
    }

    private func loadRecommendations() -> [Rec] {
        let defaults = UserDefaults(suiteName: "group.fervillanuevas.data")
        guard let jsonString = defaults?.string(forKey: "recommendations"),
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
    let date: Date
    let recommendation: Rec?
    let image: UIImage?
}

// MARK: - Widget Views
struct widgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        Group {
            switch family {
            case .systemSmall:
                SmallWidgetView(entry: entry)
            case .systemMedium:
                MediumWidgetView(entry: entry)
            case .systemLarge:
                LargeWidgetView(entry: entry)
            default:
                SmallWidgetView(entry: entry)
            }
        }
        .widgetURL(createDeepLink(for: entry.recommendation))
    }
    
    private func createDeepLink(for recommendation: Rec?) -> URL? {
        guard let rec = recommendation else { return nil }
        return URL(string: "myapp://product/\(rec.id)")
    }
}

struct SmallWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // Full-size image background
                if let image = entry.image {
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .clipped()
                } else {
                    Color.gray.opacity(0.3)
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .overlay(
                            Image(systemName: "photo")
                                .foregroundColor(.gray)
                        )
                }
                
                // Gradient overlay for text visibility
                LinearGradient(
                    gradient: Gradient(colors: [.black.opacity(0.7), .clear]),
                    startPoint: .bottom,
                    endPoint: .top
                )
                .frame(height: 60)
                
                // Text overlay
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                            .font(.system(size: 10))
                        Text("Recommended")
                            .font(.system(size: 10))
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                        Spacer()
                    }
                    
                    if let rec = entry.recommendation {
                        Text(rec.product_name)
                            .font(.caption)
                            .fontWeight(.medium)
                            .lineLimit(2)
                            .foregroundColor(.white)
                    } else {
                        Text("No recommendations available")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
                .padding(8)
            }
        }
    }
}

struct MediumWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottomLeading) {
                // Full-size image background
                if let image = entry.image {
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .clipped()
                } else {
                    Color.gray.opacity(0.3)
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .overlay(
                            Image(systemName: "photo")
                                .foregroundColor(.gray)
                        )
                }
                
                // Gradient overlay for text visibility
                LinearGradient(
                    gradient: Gradient(colors: [.black.opacity(0.8), .black.opacity(0.3), .clear]),
                    startPoint: .bottom,
                    endPoint: .top
                )
                .frame(height: 80)
                
                // Text overlay with proper title
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                            .font(.system(size: 12))
                        Text("Recommended For You")
                            .font(.system(size: 12))
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                        Spacer()
                    }
                    
                    if let rec = entry.recommendation {
                        Text(rec.product_name)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .lineLimit(2)
                            .foregroundColor(.white)
                    } else {
                        Text("No recommendations available")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
                .padding(12)
            }
        }
    }
}

struct LargeWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Full-size image background
                if let image = entry.image {
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .clipped()
                } else {
                    Color.gray.opacity(0.3)
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .overlay(
                            Image(systemName: "photo")
                                .foregroundColor(.gray)
                        )
                }
                
                // Gradient overlay for text visibility
                LinearGradient(
                    gradient: Gradient(colors: [.black.opacity(0.8), .black.opacity(0.4), .clear]),
                    startPoint: .bottom,
                    endPoint: .top
                )
                
                // Content overlay
                VStack(alignment: .leading, spacing: 6) {
                    Spacer()
                    
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                        Text("Recommended For You")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        Spacer()
                    }
                    
                    if let rec = entry.recommendation {
                        Text(rec.product_name)
                            .font(.title3)
                            .fontWeight(.semibold)
                            .lineLimit(2)
                            .foregroundColor(.white)
                            .padding(.top, 2)
                        
                        // Add a "View Details" button-like element
                        HStack {
                            Text("View Details")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(.white)
                            
                            Image(systemName: "arrow.right")
                                .font(.caption)
                                .foregroundColor(.white)
                        }
                        .padding(.vertical, 4)
                        .padding(.horizontal, 8)
                        .background(Color.white.opacity(0.3))
                        .cornerRadius(12)
                        .padding(.top, 4)
                        
                    } else {
                        Text("No recommendations available")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
                .padding(12)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
            }
        }
    }
}

// MARK: - Widget Configuration
struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .contentMarginsDisabled()
        .configurationDisplayName("Product Recommendations")
        .description("Shows personalized product recommendations")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Previews
#Preview(as: .systemSmall) {
    widget()
} timeline: {
    SimpleEntry(date: Date(), recommendation: Rec(id: "1", image_url: "", product_name: "Summer Bomber Jacket", product_url: ""), image: UIImage(systemName: "photo"))
    SimpleEntry(date: Date(), recommendation: Rec(id: "2", image_url: "", product_name: "Smart Watch", product_url: ""), image: UIImage(systemName: "photo"))
}

#Preview(as: .systemMedium) {
    widget()
} timeline: {
    SimpleEntry(date: Date(), recommendation: Rec(id: "1", image_url: "", product_name: "Summer Bomber Jacket", product_url: ""), image: UIImage(systemName: "photo"))
    SimpleEntry(date: Date(), recommendation: Rec(id: "2", image_url: "", product_name: "Smart Watch", product_url: ""), image: UIImage(systemName: "photo"))
}

#Preview(as: .systemLarge) {
    widget()
} timeline: {
    SimpleEntry(date: Date(), recommendation: Rec(id: "1", image_url: "", product_name: "Summer Bomber Jacket", product_url: ""), image: UIImage(systemName: "photo"))
    SimpleEntry(date: Date(), recommendation: Rec(id: "2", image_url: "", product_name: "Smart Watch", product_url: ""), image: UIImage(systemName: "photo"))
}