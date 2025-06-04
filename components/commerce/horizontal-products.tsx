import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Text, View } from "react-native";
import ProductHit from "~/components/commerce/product-hit";
import { H1 } from "~/components/ui/typography";
import { getProductsQueryOptions } from "~/integrations/salesforce/options/products";

export default function HorizontalProducts({
  title,
  category,
}: {
  category: string;
  title?: string;
}) {
  const { data, isLoading } = useQuery(
    getProductsQueryOptions({ refine: [`cgid=${category}`], limit: 8 })
  );

  if (isLoading) {
    return <Text>Loading</Text>;
  }

  if (!data?.hits) {
    return <></>;
  }

  return (
    <View className="gap-4">
      <H1>{title || category}</H1>
      <FlashList
        ListEmptyComponent={<Text>Empty</Text>}
        data={data?.hits}
        horizontal
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={175}
        renderItem={({ item, index }) => {
          return (
            <ProductHit
              onPress={() => {
                router.push({
                  pathname: "/product/[id]",
                  params: {
                    id: item.productId,
                  },
                });
              }}
              product={item}
            />
          );
        }}
      />
    </View>
  );
}
