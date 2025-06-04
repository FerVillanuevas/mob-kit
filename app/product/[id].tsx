import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import type {
  ShopperBasketsTypes,
  ShopperProductsTypes,
} from "commerce-sdk-clean";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Carousel from "~/components/carousel";
import { ProductVariations } from "~/components/commerce/product-variations";
import Icon from "~/components/icon";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import MaskedBlur from "~/components/ui/masked-blur";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Text } from "~/components/ui/text";
import { H1, H3 } from "~/components/ui/typography";
import { useWishList } from "~/hooks/use-wishlist";
import { useAddItemToBasketMutation } from "~/integrations/salesforce/options/basket";
import { useAddItemToProductListMutation } from "~/integrations/salesforce/options/customer";
import { getProductQueryOptions } from "~/integrations/salesforce/options/products";
import { cn } from "~/lib/utils";

// Helper function to get default selections for variation attributes
function getDefaultSelections(variationAttributes: any[], variants: any[]) {
  const defaultSelections: Record<string, string> = {};

  variationAttributes?.forEach((attr) => {
    if (attr.values && attr.values.length > 0) {
      // Filter orderable values
      const orderableValues = attr.values.filter((value: any) => {
        // Check if any variant with this value is orderable
        return variants?.some(
          (variant) =>
            variant.variationValues?.[attr.id] === value.value &&
            variant.orderable !== false
        );
      });

      // If only one orderable option, auto-select it
      if (orderableValues.length === 1) {
        defaultSelections[attr.id] = orderableValues[0].value;
      }
      // If multiple options, select the first orderable one as default
      else if (orderableValues.length > 1) {
        defaultSelections[attr.id] = orderableValues[0].value;
      }
    }
  });

  return defaultSelections;
}

const Price = ({
  price,
  currency,
  priceMax,
  promotion,
  className,
}: {
  price?: number;
  currency?: string;
  priceMax?: number;
  promotion?: any;
  className?: string;
}) => {
  const formatPrice = (amount?: number) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  return (
    <View className={cn("flex-row items-center gap-2", className)}>
      {promotion?.promotionalPrice ? (
        <>
          <Text className="text-2xl font-bold text-destructive">
            {formatPrice(promotion.promotionalPrice)}
          </Text>
          <Text className="text-lg text-muted-foreground line-through">
            {formatPrice(price)}
          </Text>
        </>
      ) : (
        <Text className="text-2xl font-bold">
          {priceMax && priceMax !== price
            ? `${formatPrice(price)} - ${formatPrice(priceMax)}`
            : formatPrice(price)}
        </Text>
      )}
    </View>
  );
};

const ProductInBundleCard = ({
  product,
}: {
  product: ShopperProductsTypes.Product;
}) => {
  const primaryImage = product.imageGroups?.find(
    (group) => group.viewType === "large"
  )?.images?.[0];

  return (
    <Card className="w-48 mr-4 overflow-hidden">
      <View className="relative aspect-square">
        {primaryImage ? (
          <View className="w-full h-full bg-muted rounded-t-lg" />
        ) : (
          <View className="bg-muted flex h-full w-full items-center justify-center rounded-t-lg">
            <Text className="text-muted-foreground text-sm">No Image</Text>
          </View>
        )}
        {product.productPromotions?.[0] && (
          <Badge className="absolute top-2 left-2 bg-destructive">
            <Text className="text-destructive-foreground text-xs">Sale</Text>
          </Badge>
        )}
      </View>
      <CardContent className="p-3 space-y-2">
        {product.brand && (
          <Badge variant="outline">
            <Text className="text-xs">{product.brand}</Text>
          </Badge>
        )}
        <Text className="text-sm font-semibold" numberOfLines={2}>
          {product.name}
        </Text>
        <Price
          price={product.price}
          currency={product.currency}
          priceMax={product.priceMax}
          promotion={product.productPromotions?.[0]}
          className="text-base"
        />
        <View className="flex-row items-center justify-between pt-1">
          <View className="flex-row items-center gap-1">
            {product.inventory?.stockLevel !== 0 ? (
              <>
                <Icon
                  name="checkmark-circle"
                  className="text-green-600"
                  size={12}
                />
                <Text className="text-xs font-medium text-green-600">
                  In Stock
                </Text>
              </>
            ) : (
              <>
                <Icon name="alert-circle" className="text-red-600" size={12} />
                <Text className="text-xs font-medium text-red-600">
                  Out of Stock
                </Text>
              </>
            )}
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

export default function ProductPage() {
  const { id, variations: urlVariations } = useLocalSearchParams<{
    id: string;
    variations?: string;
    pid?: string;
  }>();

  const { wishList } = useWishList();

  const [selectedVariations, setSelectedVariations] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const { width, height } = useWindowDimensions();
  const h = useHeaderHeight();

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery(
    getProductQueryOptions({
      id,
      perPricebook: true,
      expand: [
        "availability",
        "promotions",
        "options",
        "images",
        "prices",
        "variations",
        "set_products",
        "bundled_products",
      ],
      allImages: true,
    })
  );

  const addToBasketMutation = useAddItemToBasketMutation();
  const addToWishListMutation = useAddItemToProductListMutation();

  // Initialize default selections
  useEffect(() => {
    if (product?.variationAttributes && product?.variants) {
      const defaultSelections = getDefaultSelections(
        product.variationAttributes,
        product.variants
      );

      // Parse URL variations if they exist
      let parsedUrlVariations = {};
      if (urlVariations) {
        try {
          parsedUrlVariations = JSON.parse(urlVariations);
        } catch (e) {
          console.warn("Failed to parse URL variations:", e);
        }
      }

      // Merge URL variations with defaults (URL takes precedence)
      const initialSelections = {
        ...defaultSelections,
        ...parsedUrlVariations,
      };

      setSelectedVariations(initialSelections);

      // Set initial quantity
      setQuantity(product.minOrderQuantity || 1);
    }
  }, [product?.variationAttributes, product?.variants, urlVariations]);

  // Find the selected variant
  const selectedVariant = product?.variants?.find((variant) => {
    return Object.entries(selectedVariations).every(([attrId, value]) => {
      return variant.variationValues?.[attrId] === value;
    });
  });

  const { minOrderQuantity = 1, stepQuantity = 1 } = product || {};
  const isInStock =
    selectedVariant?.orderable !== false &&
    selectedVariant?.inventory?.stockLevel !== 0;
  const stockLevel =
    selectedVariant?.inventory?.stockLevel || product?.inventory?.stockLevel;
  const promotion = product?.productPromotions?.[0];

  // Calculate stock status
  const getStockStatus = () => {
    if (!isInStock)
      return { status: "out-of-stock", color: "red", text: "Out of Stock" };
    if (stockLevel && stockLevel <= 5)
      return {
        status: "low-stock",
        color: "orange",
        text: `Only ${stockLevel} left`,
      };
    if (stockLevel && stockLevel <= 20)
      return { status: "limited", color: "yellow", text: "Limited Stock" };
    return { status: "in-stock", color: "green", text: "In Stock" };
  };

  const stockStatus = getStockStatus();

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(minOrderQuantity, quantity + delta);
    if (stepQuantity > 1) {
      const remainder = (newQuantity - minOrderQuantity) % stepQuantity;
      setQuantity(
        remainder === 0 ? newQuantity : newQuantity - remainder + stepQuantity
      );
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleVariationChange = (newVariations: Record<string, string>) => {
    setSelectedVariations(newVariations);

    // Find the selected variant based on new variations
    const newSelectedVariant = product?.variants?.find((variant) => {
      return Object.entries(newVariations).every(([attrId, value]) => {
        return variant.variationValues?.[attrId] === value;
      });
    });

    router.setParams({
      variations:
        Object.keys(newVariations).length > 0
          ? JSON.stringify(newVariations)
          : undefined,
      pid: newSelectedVariant?.productId || undefined,
    });
  };

  const handleAddToBasket = async () => {
    const productSelectionValues: ShopperBasketsTypes.ProductItem[] = [
      {
        productId: selectedVariant?.productId || product?.id,
        price: selectedVariant?.price || product?.price,
        quantity,
      },
    ];

    await addToBasketMutation.mutateAsync({
      body: productSelectionValues,
    });
  };

  const handleAddToWishList = async () => {
    if (!wishList?.id) {
      return;
    }

    await addToWishListMutation.mutateAsync({
      listId: wishList.id,
      productId: id,
    });
  };

  const wishListed = wishList?.customerProductListItems?.some(
    (p) => p.id === id
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Loading product...</Text>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Icon name="alert-circle" className="text-destructive mb-4" size={48} />
        <H3 className="text-center mb-2">Product Not Found</H3>
        <Text className="text-center text-muted-foreground mb-4">
          The product youre looking for doesnt exist or has been removed.
        </Text>
        <Button onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  const largeImages = product.imageGroups?.find(
    (ig) => ig.viewType === "large"
  );
  const images =
    largeImages?.images?.map((image) => image.disBaseLink || "") || [];

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specs" },
  ];

  return (
    <View style={{ width, height: height - h }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        {images.length > 0 && (
          <View className="relative">
            {promotion && (
              <Badge className="absolute top-4 left-4 z-10 bg-destructive">
                <View className="flex-row items-center">
                  <Icon
                    name="flash"
                    className="text-destructive-foreground mr-1"
                    size={12}
                  />
                  <Text className="text-destructive-foreground text-xs">
                    {promotion.calloutMsg || "Special Offer"}
                  </Text>
                </View>
              </Badge>
            )}
            <Carousel data={images} />
          </View>
        )}

        <View className="p-4 gap-3" style={{ paddingBottom: 120 }}>
          <View className="flex flex-row justify-between items-center gap-4">
            <H1 className="text-2xl font-bold leading-tight flex-1">{product.name}</H1>
            <TouchableOpacity
              onPress={handleAddToWishList}
              className={cn(
                "p-2 rounded-full border",
                wishListed
                  ? "bg-destructive border-destructive"
                  : "bg-background border-border"
              )}
            >
              <Icon
                name={wishListed ? "heart" : "heart-outline"}
                className={
                  wishListed
                    ? "text-destructive-foreground"
                    : "text-muted-foreground"
                }
                size={20}
              />
            </TouchableOpacity>
          </View>

          <Separator />

          {product.variationAttributes &&
            product.variationAttributes.length > 0 && (
              <ProductVariations
                variationAttributes={product.variationAttributes}
                variants={product.variants}
                selectedVariations={selectedVariations}
                onVariationChange={handleVariationChange}
              />
            )}

          {/* Tab Headers */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex-col gap-1.5"
          >
            <TabsList className="flex-row w-full">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex-1">
                  <Text>{tab.label}</Text>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="description">
              <Card className="mt-4">
                <CardContent className="p-4">
                  {product.longDescription ? (
                    <Text className="text-sm leading-relaxed">
                      {product.longDescription.replace(/<[^>]*>/g, "")}
                    </Text>
                  ) : (
                    <Text className="text-muted-foreground text-sm">
                      No detailed description available for this product.
                    </Text>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications">
              <Card className="mt-4">
                <CardContent className="p-4 space-y-4">
                  {product.manufacturerName && (
                    <View className="space-y-1">
                      <Text className="text-sm font-medium">Manufacturer</Text>
                      <Text className="text-muted-foreground text-sm">
                        {product.manufacturerName}
                      </Text>
                    </View>
                  )}
                  {product.manufacturerSku && (
                    <View className="space-y-1">
                      <Text className="text-sm font-medium">
                        Manufacturer SKU
                      </Text>
                      <Text className="text-muted-foreground text-sm">
                        {product.manufacturerSku}
                      </Text>
                    </View>
                  )}
                  {product.upc && (
                    <View className="space-y-1">
                      <Text className="text-sm font-medium">UPC</Text>
                      <Text className="text-muted-foreground text-sm">
                        {product.upc}
                      </Text>
                    </View>
                  )}
                  {product.unit && (
                    <View className="space-y-1">
                      <Text className="text-sm font-medium">Unit</Text>
                      <Text className="text-muted-foreground text-sm">
                        {product.unit}
                      </Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </View>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 px-4 pt-8 pb-safe flex flex-row gap-8">
        <MaskedBlur />

        {/* Add to Cart Button */}
        <Price
          price={selectedVariant?.price || product.price}
          currency={product.currency}
          priceMax={product.priceMax}
          promotion={promotion}
        />

        <Button
          onPress={handleAddToBasket}
          disabled={!isInStock || addToBasketMutation.isPending}
          className="flex-1"
        >
          <View className="flex-row items-center gap-2">
            {addToBasketMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="bag" className="text-primary-foreground" size={20} />
            )}
            <Text className="text-primary-foreground font-medium">
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </Text>
          </View>
        </Button>
      </View>
    </View>
  );
}
