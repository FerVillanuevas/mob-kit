import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import AnimatedStateView from "~/components/commerce/animated-state-view";
import EmptyHero from "~/components/commerce/empty-hero";
import ProductHit from "~/components/commerce/product-hit";
import { ProductGridSkeleton } from "~/components/commerce/product-skeleton";
import { Text } from "~/components/ui/text";
import { useWishList } from "~/hooks/use-wishlist";
import { getProductsByIdsQueryOptions } from "~/integrations/salesforce/options/products";

export default function SearchPage() {
  const { wishList } = useWishList();

  const productIds =
    wishList?.customerProductListItems
      ?.map((item) => item.productId)
      .filter(Boolean)
      .join(",") || "";

  const {
    data: productsResult,
    isLoading: productsLoading,
    refetch,
    isFetching,
    isError,
  } = useQuery(getProductsByIdsQueryOptions({ ids: productIds }));

  const products = productsResult?.data || [];

  // Determine state
  const getState = () => {
    if (productsLoading || isFetching) return "loading";
    if (isError) return "error";
    if (!wishList?.customerProductListItems?.length && !productsLoading)
      return "empty";
    return "success";
  };

  return (
    <View className="flex flex-1 p-4">
      <AnimatedStateView
        state={getState()}
        duration={250}
        animationPreset="fade"
        loadingComponent={<ProductGridSkeleton numColumns={2} numItems={6} />}
        errorComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-500">Search failed</Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text className="mt-2 text-blue-500">Try again</Text>
            </TouchableOpacity>
          </View>
        }
        emptyComponent={
          <EmptyHero
            title="Your Wishlist is Empty"
            description="Explore our products and add items you love to your wishlist!"
            buttonText="Browse Products"
            redirectPath="/(tabs)/search"
          />
        }
      >
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
      </AnimatedStateView>
    </View>
  );
}
