import { TouchableOpacity, View } from "react-native";
import Image from "~/components/image";
import { Text } from "~/components/ui/text";
import { Muted } from "~/components/ui/typography";

interface CollectionGridProps {
  component: {
    data: {
      title: string;
      collections: Array<{
        id: string;
        name: string;
        description: string;
        image: string;
        itemCount: number;
        startingPrice: number;
      }>;
    };
  };
}

export function CollectionGrid({ component }: CollectionGridProps) {
  const { title, collections } = component.data;

  return (
    <View className="mb-8 px-4">
      <Text className="mb-6 text-center text-2xl font-bold">{title}</Text>

      <View className="gap-y-4">
        {collections.map((collection, index) => (
          <TouchableOpacity
            key={collection.id}
            className="overflow-hidden rounded-2xl border border-border"
          >
            <View className="flex-row">
              <Image source={{ uri: collection.image }} className="h-32 w-32" />
              <View className="flex-1 justify-center p-4">
                <Text className="mb-2 text-lg font-bold">
                  {collection.name}
                </Text>
                <Muted className="mb-3 text-sm leading-relaxed">
                  {collection.description}
                </Muted>
                <View className="flex-row items-center justify-between">
                  <Muted>{collection.itemCount} items</Muted>
                  <Text className="text-sm font-semibold">
                    From ${collection.startingPrice}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
