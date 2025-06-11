import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View } from "react-native";
import EmptyHero from "~/components/commerce/empty-hero";
import ProductHit from "~/components/commerce/product-hit";
import { ProductGridSkeleton } from "~/components/commerce/product-skeleton";
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
    return (
      <View className="flex flex-1 p-4">
        <ProductGridSkeleton numColumns={2} numItems={6} />
      </View>
    );
  }

  if (!wishList?.customerProductListItems?.length) {
    return (
      <EmptyHero
        title="Your Wishlist is Empty"
        description="Explore our products and add items you love to your wishlist!"
        buttonText="Browse Products"
        redirectPath="/(tabs)/search"
      />
    );
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
