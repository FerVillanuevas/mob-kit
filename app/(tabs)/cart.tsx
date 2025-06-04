import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import currency from "currency.js";
import { router } from "expo-router";
import { isEmpty } from "lodash";
import { ScrollView, View } from "react-native";
import Image from "~/components/image";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { H1, H4, P, Small } from "~/components/ui/typography";
import { getBasketQueryOptions } from "~/integrations/salesforce/options/basket";
import { getProductsByIdsQueryOptions } from "~/integrations/salesforce/options/products";

export default function CartPage() {
  const { data: basket, isLoading: basketLoading } = useQuery(
    getBasketQueryOptions()
  );

  const productIds =
    basket?.productItems
      ?.map((item) => item.productId)
      .filter(Boolean)
      .join(",") || "";

  // Fetch full product details
  const { data: productsResult, isLoading: productsLoading } = useQuery({
    ...getProductsByIdsQueryOptions({ ids: productIds }),
    enabled: productIds.length > 0,
  });

  const isLoading = basketLoading || productsLoading;

  const enhancedItems =
    basket?.productItems?.map((basketItem) => {
      const fullProduct = productsResult?.data?.find(
        (product) => product.id === basketItem.productId
      );
      return {
        ...basketItem,
        product: fullProduct,
      };
    }) || [];

  if (isLoading || !basket?.basketId) {
    return null;
  }

  if (isEmpty(basket.productItems)) {
    return (
      <View className="flex flex-1 justify-center items-center">
        <H1>Your cart is empty</H1>
      </View>
    );
  }

  return (
    <View className="flex flex-1">
      <View className="flex flex-1  px-4">
        <FlashList
          data={enhancedItems}
          ListHeaderComponent={() => {
            return (
              <View className="gap-3 pb-4 pt-4">
                <View className="flex justify-between flex-row items-center">
                  <Small>Subtotal</Small>
                  <Text>{currency(basket.productSubTotal || 0).format()}</Text>
                </View>

                {!isEmpty(basket.shippingTotal) && (
                  <View className="flex justify-between">
                    <Small>Shipping Total</Small>
                    <Text>{currency(basket.shippingTotal || 0).format()}</Text>
                  </View>
                )}

                {!isEmpty(basket.taxTotal) && (
                  <View className="flex justify-between flex-row items-center">
                    <Small>Tax</Small>
                    <Text>{currency(basket.taxTotal || 0).format()}</Text>
                  </View>
                )}

                {!isEmpty(basket.orderTotal) && (
                  <View className="flex justify-between flex-row items-center">
                    <Small>Total</Small>
                    <Text>{currency(basket.orderTotal || 0).format()}</Text>
                  </View>
                )}
              </View>
            );
          }}
          estimatedItemSize={111}
          renderItem={({ item }) => {
            return (
              <View className="flex flex-row gap-3 mb-3">
                <Image
                  className="w-32 aspect-square rounded-md border-2 border-border"
                  source={
                    item.product?.imageGroups?.find(
                      (ig) => ig.viewType === "large"
                    )?.images[0].disBaseLink
                  }
                />
                <View className="flex flex-col gap-2">
                  <H4 className="font-semibold">{item.productName}</H4>
                  <View className="flex-1">
                    {item?.product?.shortDescription && (
                      <P
                        className="text-xs text-muted-foreground flex-1"
                        numberOfLines={2}
                      >
                        {item.product.shortDescription}
                      </P>
                    )}
                  </View>
                  <ScrollView horizontal>
                    <View>
                      <View className="flex flex-row gap-3">
                        <Badge>
                          <Text>quantity: {item.quantity}</Text>
                        </Badge>
                        {item.product?.variationValues &&
                          Object.keys(item.product.variationValues).length >
                            0 && (
                            <>
                              {Object.entries(item.product.variationValues).map(
                                ([key, value]) => (
                                  <Badge
                                    key={key}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    <Text>
                                      {key}: {value}
                                    </Text>
                                  </Badge>
                                )
                              )}
                            </>
                          )}
                      </View>
                    </View>
                  </ScrollView>

                  <Text className="font-semibold">
                    {currency(item.price || 0).format()}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </View>

      <View className="p-4">
        <Button
          onPress={() => {
            router.push({
              pathname: "/(checkout)/customer",
            });
          }}
        >
          <Text>Proceed to Checkout</Text>
        </Button>
      </View>
    </View>
  );
}
