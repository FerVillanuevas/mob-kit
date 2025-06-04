import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import ProductHit from "~/components/commerce/product-hit";
import Loading from "~/components/loading";
import { getProductsQueryOptions } from "~/integrations/salesforce/options/products";
import { REQUESTED_LIMIT } from "~/lib/constants";

export default function CategoryPage() {
  const { id } = useLocalSearchParams();

  const { data: products, isLoading } = useQuery(
    getProductsQueryOptions({
      refine: [`cgid=${id}`],
      limit: REQUESTED_LIMIT,
    })
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <FlashList
      data={products?.hits}
      ListEmptyComponent={() => {
        return <Text>Emptu</Text>;
      }}
      numColumns={2}
      estimatedItemSize={315}
      renderItem={({ item }) => {
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
            className="w-full p-4"
          />
        );
      }}
    />
  );
}
