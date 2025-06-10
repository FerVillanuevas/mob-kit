import { Clock } from "lucide-react-native"
import { TouchableOpacity, View } from "react-native"
import { Text } from "~/components/ui/text"

interface PromoBannerProps {
  component: {
    data: {
      title: string
      subtitle: string
      description: string
      ctaText: string
      backgroundColor: string
      textColor: string
      accentColor: string
      timer?: {
        enabled: boolean
        endDate: string
      }
    }
  }
}

export function PromoBanner({ component }: PromoBannerProps) {
  const { title, subtitle, description, ctaText, backgroundColor, textColor, accentColor } = component.data

  return (
    <View className="mx-4 mb-8 rounded-2xl p-6 shadow-lg" style={{ backgroundColor }}>
      <View className="items-center text-center">
        <Text className="text-3xl font-bold mb-2" style={{ color: textColor }}>
          {title}
        </Text>
        <Text className="text-xl font-semibold mb-3" style={{ color: accentColor }}>
          {subtitle}
        </Text>
        <Text className="text-base mb-6 text-center leading-relaxed" style={{ color: textColor }}>
          {description}
        </Text>

        <View className="flex-row items-center mb-6">
          <Clock size={16} color={accentColor} />
          <Text className="ml-2 font-medium" style={{ color: accentColor }}>
            Limited Time Only
          </Text>
        </View>

        <TouchableOpacity className="rounded-full px-8 py-4 shadow-md" style={{ backgroundColor: accentColor }}>
          <Text className="font-bold text-lg" style={{ color: backgroundColor }}>
            {ctaText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
