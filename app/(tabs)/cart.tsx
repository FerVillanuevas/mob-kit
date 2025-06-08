import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import type {
  ShopperBasketsTypes,
  ShopperProductsTypes,
} from "commerce-sdk-isomorphic";
import currency from "currency.js";
import { router } from "expo-router";
import { isEmpty } from "lodash";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { QuantitySelector } from "~/components/commerce/quantity-selector";
import Icon from "~/components/icon";
import Image from "~/components/image";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { H1, H2, H4, Muted } from "~/components/ui/typography";
import {
  getBasketQueryOptions,
  useUpdateItemInBasketMutation,
} from "~/integrations/salesforce/options/basket";
import { getProductsByIdsQueryOptions } from "~/integrations/salesforce/options/products";

// Enhanced type definitions
interface EnhancedBasketItem extends ShopperBasketsTypes.ProductItem {
  product?: ShopperProductsTypes.Product;
  basketId: string;
}

interface CartSummaryProps {
  basket: ShopperBasketsTypes.Basket;
}

interface BasketItemProps extends EnhancedBasketItem {}

// Constants
const CURRENCY_OPTIONS = {
  style: "currency",
  currency: "USD",
} as const;

const ESTIMATED_ITEM_SIZE = 140;

// Utility functions
const formatCurrency = (amount = 0): string => {
  return currency(amount).format();
};

const getProductImage = (
  product?: ShopperProductsTypes.Product,
): string | undefined => {
  return product?.imageGroups?.find((ig) => ig.viewType === "large")
    ?.images?.[0]?.disBaseLink;
};

const getVariationDisplay = (variationValues?: Record<string, string>) => {
  if (!variationValues || Object.keys(variationValues).length === 0) {
    return null;
  }

  return Object.entries(variationValues).map(([key, value]) => ({
    key,
    value,
    display: `${key}: ${value}`,
  }));
};

// Cart Summary Component
const CartSummary = ({ basket }: CartSummaryProps) => {
  const itemCount = basket.productItems?.length || 0;

  const hasShipping =
    basket.shippingTotal !== undefined && basket.shippingTotal !== null;
  const hasTax = basket.taxTotal !== undefined && basket.taxTotal !== null;
  const hasTotal =
    basket.orderTotal !== undefined && basket.orderTotal !== null;

  return (
    <Card className="mb-4 border-0 shadow-none">
      <CardContent className="p-4">
        <H2 className="mb-4 text-lg font-semibold">Order Summary</H2>

        <View className="space-y-3">
          <View className="flex-row items-center justify-between">
            <Muted>
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
            </Muted>
            <Text className="font-semibold">
              {formatCurrency(basket.productSubTotal)}
            </Text>
          </View>

          {hasShipping && (
            <View className="flex-row items-center justify-between">
              <Muted>Shipping</Muted>
              <Text className="font-semibold">
                {formatCurrency(basket.shippingTotal)}
              </Text>
            </View>
          )}

          {hasTax && (
            <View className="flex-row items-center justify-between">
              <Muted>Tax</Muted>
              <Text className="font-semibold">
                {formatCurrency(basket.taxTotal)}
              </Text>
            </View>
          )}

          {hasTotal && (
            <>
              <Separator className="my-2" />
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold">Total</Text>
                <Text className="text-lg font-bold">
                  {formatCurrency(basket.orderTotal)}
                </Text>
              </View>
            </>
          )}
        </View>
      </CardContent>
    </Card>
  );
};

// Basket Item Component
const BasketItem = ({ product, basketId, ...item }: BasketItemProps) => {
  const updateItemMutation = useUpdateItemInBasketMutation();

  const isUpdating = updateItemMutation.isPending;
  const productImage = getProductImage(product);
  const variations = getVariationDisplay(product?.variationValues);

  const handleQuantityChange = async (newQuantity: number) => {
    if (!item.itemId || !basketId) {
      console.warn("Missing itemId or basketId for quantity update");
      return;
    }

    try {
      await updateItemMutation.mutateAsync({
        itemId: item.itemId,
        quantity: newQuantity,
        basketId,
      });
    } catch (error) {
      console.error("Failed to update item quantity:", error);
      Alert.alert(
        "Update Failed",
        "Unable to update quantity. Please check your connection and try again.",
        [{ text: "OK" }],
      );
    }
  };

  const handleRemoveItem = async () => {
    if (!item.itemId || !basketId) {
      console.warn("Missing itemId or basketId for item removal");
      return;
    }

    Alert.alert(
      "Remove Item",
      `Remove "${product?.name || "this item"}" from your cart?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await updateItemMutation.mutateAsync({
                itemId: item.itemId!,
                quantity: 0,
                basketId,
              });
            } catch (error) {
              console.error("Failed to remove item:", error);
              Alert.alert(
                "Removal Failed",
                "Unable to remove item. Please try again.",
                [{ text: "OK" }],
              );
            }
          },
        },
      ],
    );
  };

  return (
    <Card className="mx-4 mb-3 shadow-none">
      <CardContent className="p-4">
        <View className="flex-row gap-3">
          {/* Product Image */}
          <View className="relative">
            <Image
              className="aspect-square w-24 rounded-lg border border-border"
              source={productImage}
              accessibilityLabel={`Image of ${product?.name || "product"}`}
            />
            {isUpdating && (
              <View className="absolute inset-0 items-center justify-center rounded-lg bg-background/80">
                <ActivityIndicator size="small" />
              </View>
            )}
          </View>

          {/* Product Details */}
          <View className="flex-1 space-y-2">
            {/* Header with name and remove button */}
            <View className="flex-row items-start justify-between">
              <H4 className="flex-1 pr-2 font-semibold" numberOfLines={2}>
                {product?.name || "Unknown Product"}
              </H4>
              <Button
                variant="ghost"
                size="icon"
                onPress={handleRemoveItem}
                disabled={isUpdating}
                accessibilityLabel="Remove item from cart"
                className="h-8 w-8"
              >
                <Icon name="trash" className="text-destructive" size={16} />
              </Button>
            </View>

            {/* Product Variations */}
            {variations && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="max-h-6"
              >
                <View className="flex-row gap-2">
                  {variations.map(({ key, display }) => (
                    <View key={key} className="rounded bg-muted px-2 py-1">
                      <Muted className="text-xs">{display}</Muted>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* Price and Quantity */}
            <View className="flex-row items-center justify-between pt-2">
              <Text className="text-lg font-bold">
                {formatCurrency(item.price)}
              </Text>
              <QuantitySelector
                value={item.quantity || 0}
                onValueChange={handleQuantityChange}
                min={1}
                max={99}
                disabled={isUpdating}
                className="ml-2"
              />
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

// Empty Cart Component
const EmptyCart = () => (
  <View className="flex-1 items-center justify-center px-6">
    <Icon name="bag-outline" size={80} className="mb-6 text-muted-foreground" />
    <H1 className="mb-3 text-center">Your cart is empty</H1>
    <Text className="mb-8 max-w-sm text-center text-muted-foreground">
      Discover amazing products and add them to your cart to get started
    </Text>
    <Button onPress={() => router.push("/")} className="min-w-[200px]">
      <View className="flex-row items-center gap-2">
        <Icon name="storefront" size={16} className="text-primary-foreground" />
        <Text>Start Shopping</Text>
      </View>
    </Button>
  </View>
);

// Loading Component
const CartLoading = () => (
  <View className="flex-1 items-center justify-center">
    <ActivityIndicator size="large" />
    <Text className="mt-4 text-muted-foreground">Loading your cart...</Text>
  </View>
);

// Main Cart Component
export default function CartPage() {
  const {
    data: basket,
    isLoading: basketLoading,
    error: basketError,
  } = useQuery(getBasketQueryOptions());

  // Let React Compiler optimize this instead of manual memoization
  const productIds =
    basket?.productItems
      ?.map((item) => item.productId)
      .filter(Boolean)
      .join(",") || "";

  const {
    data: productsResult,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    ...getProductsByIdsQueryOptions({ ids: productIds }),
    enabled: productIds.length > 0,
  });

  // Let React Compiler optimize this instead of manual memoization
  const enhancedItems =
    !basket?.productItems || !basket.basketId
      ? []
      : basket.productItems.map((basketItem) => {
          const fullProduct = productsResult?.data?.find(
            (product) => product.id === basketItem.productId,
          );
          return {
            ...basketItem,
            product: fullProduct,
            basketId: basket.basketId!,
          };
        });

  const renderItem = ({ item }: { item: EnhancedBasketItem }) => (
    <BasketItem {...item} />
  );

  const handleCheckout = () => {
    router.push({
      pathname: "/(checkout)/customer",
    });
  };

  // Loading state
  const isLoading = basketLoading || productsLoading;
  if (isLoading) {
    return <CartLoading />;
  }

  // Error state
  if (basketError || productsError) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Icon name="alert-circle" size={64} className="mb-4 text-destructive" />
        <H1 className="mb-2 text-center">Something went wrong</H1>
        <Text className="mb-6 text-center text-muted-foreground">
          Unable to load your cart. Please try again.
        </Text>
        <Button onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  // No basket or empty cart
  if (!basket?.basketId || isEmpty(basket.productItems)) {
    return <EmptyCart />;
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={enhancedItems}
        renderItem={renderItem}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => <CartSummary basket={basket} />}
        contentContainerStyle={{ paddingTop: 16 }}
        keyExtractor={(item) =>
          item.itemId || item.productId || Math.random().toString()
        }
      />

      {/* Checkout Section */}
      <View className="safe-area-bottom border-t border-border bg-background p-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold">Total</Text>
          <Text className="text-xl font-bold">
            {formatCurrency(basket.orderTotal)}
          </Text>
        </View>

        <Button
          size="lg"
          onPress={handleCheckout}
          className="w-full"
          accessibilityLabel="Proceed to checkout"
        >
          <View className="flex-row items-center gap-2">
            <Icon name="card" size={20} className="text-primary-foreground" />
            <Text className="font-semibold">Proceed to Checkout</Text>
          </View>
        </Button>
      </View>
    </View>
  );
}
