import { TouchableOpacity, View } from "react-native";
import Image from "~/components/image";
import { Text } from "~/components/ui/text";
import { Muted } from "~/components/ui/typography";

interface CategoryShowcaseProps {
  component: {
    data: {
      title: string;
      subtitle: string;
      categories: Array<{
        id: string;
        name: string;
        image: string;
        itemCount: number;
        featured: boolean;
      }>;
    };
  };
}

export function CategoryShowcase({ component }: CategoryShowcaseProps) {
  const { title, subtitle, categories } = component.data;

  return (
    <View className="mb-8 px-4">
      <View className="mb-6">
        <Text className="mb-2 text-center text-2xl font-bold">{title}</Text>
        <Muted className="text-center">{subtitle}</Muted>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            className={`${index < 2 ? "h-48 w-[48%]" : "h-32 w-[48%]"} mb-4 overflow-hidden rounded-2xl shadow-sm`}
          >
            <Image source={{ uri: category.image }} className="h-full w-full" />
            <View className="absolute inset-0 bg-black/30" />
            <View className="absolute bottom-4 left-4 right-4">
              <Text className="mb-1 text-lg font-bold text-primary-foreground">
                {category.name}
              </Text>
              <Muted>{category.itemCount} items</Muted>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
