import { Award, Leaf, Truck } from "lucide-react-native";
import { View } from "react-native";
import Image from "~/components/image";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Muted } from "~/components/ui/typography";

interface BrandStoryProps {
  component: {
    data: {
      title: string;
      subtitle: string;
      description: string;
      image: string;
      features: Array<{
        icon: string;
        title: string;
        description: string;
      }>;
      ctaText: string;
    };
  };
}

const iconMap = {
  leaf: Leaf,
  award: Award,
  truck: Truck,
};

export function BrandStory({ component }: BrandStoryProps) {
  const { title, subtitle, description, image, features, ctaText } =
    component.data;

  return (
    <View className="mb-8 px-4">
      <Image source={{ uri: image }} className="mb-6 h-64 w-full rounded-2xl" />

      <View className="mb-6">
        <Text className="mb-2 text-center text-2xl font-bold">{title}</Text>
        <Muted className="mb-4 text-center text-lg">{subtitle}</Muted>
        <Muted className="text-center leading-relaxed">{description}</Muted>
      </View>

      <View className="mb-6 flex-row justify-between">
        {features.map((feature, index) => {
          const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
          return (
            <View key={index} className="flex-1 items-center">
              <View className="mb-3 rounded-full bg-blue-100 p-3">
                <IconComponent size={24} color="#3b82f6" />
              </View>
              <Text className="mb-1 text-center font-semibold">
                {feature.title}
              </Text>
              <Muted className="text-center">{feature.description}</Muted>
            </View>
          );
        })}
      </View>

      <Button>
        <Text>{ctaText}</Text>
      </Button>
    </View>
  );
}
