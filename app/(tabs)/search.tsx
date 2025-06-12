import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { ShopperProductsTypes } from "commerce-sdk-isomorphic";
import currency from "currency.js";
import { router } from "expo-router";
import { debounce } from "lodash";
import { useState } from "react";
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import AvoidingBlur from "~/components/avoiding-blur";
import AnimatedStateView from "~/components/commerce/animated-state-view";
import EmptyHero from "~/components/commerce/empty-hero";
import Icon from "~/components/icon";
import Image from "~/components/image";
import HorizontalList from "~/components/skeletons/horizontal-items-skeleton";
import { Input } from "~/components/ui/input";
import { H4, P } from "~/components/ui/typography";
import { getProductsByIdsQueryOptions } from "~/integrations/salesforce/options/products";
import { getSearchSuggestionsOptions } from "~/integrations/salesforce/options/search";
import { normalizeProduct } from "~/lib/commerce/utils";
import { cn } from "~/lib/utils";

const SearchResult = ({
  product,
  className,
  ...rest
}: {
  product: ShopperProductsTypes.Product;
} & TouchableOpacityProps) => {
  const normalize = normalizeProduct(product);

  return (
    <TouchableOpacity
      {...rest}
      className={cn(
        "mb-4 flex flex-row items-center justify-between",
        className,
      )}
    >
      <View className="flex flex-row items-center gap-3">
        <Image
          source={normalize.image}
          className="aspect-square w-16 rounded-md"
        />
        <View className="flex flex-col gap-1">
          <H4>{normalize.name}</H4>
          <P>{currency(normalize.price || 0).format()}</P>
        </View>
      </View>
      <Icon name="arrow-forward" size={22} />
    </TouchableOpacity>
  );
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isError, refetch, isFetching } = useQuery(
    getSearchSuggestionsOptions({
      q: searchQuery,
    }),
  );

  const productIds =
    data?.productSuggestions?.products
      ?.map((item) => item.productId)
      .filter(Boolean)
      .join(",") || "";

  const { data: productsResult, isLoading: productsLoading } = useQuery(
    getProductsByIdsQueryOptions({ ids: productIds }),
  );

  const handleChangeText = debounce((q) => {
    setSearchQuery(q);
  }, 300);

  const products = productsResult?.data || [];

  // Determine state
  const getState = () => {
    if (productsLoading || isFetching) return "loading";
    if (isError) return "error";
    if (!data?.productSuggestions?.products && !productsLoading) return "empty";
    return "success";
  };

  return (
    <View className="flex flex-1 p-4">
      <AnimatedStateView
        state={getState()}
        duration={250}
        animationPreset="fade"
        loadingComponent={<HorizontalList />}
        errorComponent={<EmptyHero title="Search products" hideButton />}
        emptyComponent={<EmptyHero title="Search products" hideButton />}
      >
        <FlashList
          data={data?.productSuggestions?.products}
          estimatedItemSize={100}
          renderItem={({ item }) => {
            const product = products.find((p) => p.id === item.productId);

            if (!product) {
              return <></>;
            }

            return (
              <SearchResult
                product={product}
                onPress={() => {
                  router.push({
                    pathname: "/product/[id]",
                    params: {
                      id: item.productId,
                    },
                  });
                }}
              />
            );
          }}
        />
      </AnimatedStateView>

      <AvoidingBlur bottom={0} style={{ paddingBottom: 8 }}>
        <Input placeholder="Search" onChangeText={handleChangeText} />
      </AvoidingBlur>
    </View>
  );
}
