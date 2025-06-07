import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View } from "react-native";
import ProductHit from "~/components/commerce/product-hit";
import Loading from "~/components/loading";
import { useWishList } from "~/hooks/use-wishlist";
import { getProductsByIdsQueryOptions } from "~/integrations/salesforce/options/products";

export default function SearchPage() {
  const { wishList } = useWishList();

  const productIds =
    wishList?.customerProductListItems
      ?.map((item) => item.productId)
      .filter(Boolean)
      .join(",") || "";

  const { data: productsResult, isLoading: productsLoading } = useQuery(
    getProductsByIdsQueryOptions({ ids: productIds }),
  );

  const products = productsResult?.data || [];

  if (productsLoading) {
    return <Loading />;
  }

  return (
    <View className="flex flex-1 p-4">
      <FlashList
        data={wishList?.customerProductListItems}
        numColumns={2}
        estimatedItemSize={253}
        renderItem={({ item }) => {
          const product = products.find((p) => p.id === item.productId);

          if (!product) {
            return <></>;
          }

          return (
            <ProductHit
              showWishList
              product={product}
              isFavorite={true}
              onPress={() => {
                router.push({
                  pathname: "/product/[id]",
                  params: {
                    id: product?.id,
                  },
                });
              }}
              className="w-full p-2"
            />
          );
        }}
      />
    </View>
  );
}
