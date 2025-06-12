import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import Image from "~/components/image";
import Loading from "~/components/loading";
import { H3, H4 } from "~/components/ui/typography";
import getProductRecsQueryOptions from "~/integrations/salesforce/options/einstein";
import { Rec } from "~/integrations/salesforce/types/api";

export default function ProductRecomendations({
  recId,
  products,
}: {
  recId: string;
  products?: { id: string }[];
}) {
  const { data, isLoading } = useQuery(
    getProductRecsQueryOptions({
      recId: recId,
      products: products,
    }),
  );

  const renderItem = ({ item }: { item: Rec }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/product/[id]",
            params: {
              id: item.id,
            },
          });
        }}
        className="mr-4 w-44"
        key={item.id}
      >
        <Image
          source={item.image_url}
          className="aspect-[8/11] w-full rounded-md"
        />

        <H4 numberOfLines={1}>{item.product_name}</H4>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="h-[168] w-full">
        <Loading />
      </View>
    );
  }

  if (!data?.recs) {
    return <></>;
  }

  return (
    <View className="gap-3">
      <H3>Product Recomendations</H3>

      <FlashList
        data={data.recs}
        ListEmptyComponent={
          <View className="flex h-[168] w-full items-center justify-center">
            <H3>No recomendations</H3>
          </View>
        }
        estimatedItemSize={168}
        showsHorizontalScrollIndicator={false}
        horizontal
        renderItem={renderItem}
      />
    </View>
  );
}
