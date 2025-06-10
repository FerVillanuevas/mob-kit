import { ScrollView, TouchableOpacity, View } from "react-native";
import Image from "~/components/image";
import { Text } from "~/components/ui/text";
import { Muted } from "~/components/ui/typography";

interface ProductCarouselProps {
  component: {
    data: {
      title: string;
      subtitle: string;
      showViewAll: boolean;
      products: Array<{
        id: string;
        name: string;
        price: number;
        originalPrice?: number;
        discount?: number;
        image: string;
        rating: number;
        reviewCount: number;
        badge?: string;
      }>;
    };
  };
}

export function ProductCarousel({ component }: ProductCarouselProps) {
  const { title, subtitle, showViewAll, products } = component.data;

  return (
    <View className="mb-8">
      <View className="mb-6 flex-row items-center justify-between px-4">
        <View>
          <Text className="mb-1 text-2xl font-bold">{title}</Text>
          <Muted>{subtitle}</Muted>
        </View>
        {showViewAll && (
          <TouchableOpacity>
            <Text className="font-semibold text-destructive">View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-4"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            className="mr-4 w-48 overflow-hidden rounded-2xl border border-border bg-card"
          >
            <Image source={{ uri: product.image }} className="h-48 w-full" />

            <View className="p-4">
              <Text
                className="mb-2 font-medium leading-tight"
                numberOfLines={2}
              >
                {product.name}
              </Text>

              <View className="flex-row items-center">
                <Text className="text-lg font-bold">${product.price}</Text>
                {product.originalPrice && (
                  <Muted className="ml-2 line-through">
                    ${product.originalPrice}
                  </Muted>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
