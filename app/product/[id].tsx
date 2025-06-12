import { useQuery } from "@tanstack/react-query";
import { ShopperBasketsTypes } from "commerce-sdk-isomorphic";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import AvoidingBlur from "~/components/avoiding-blur";
import Carousel from "~/components/carousel";
import EmptyHero from "~/components/commerce/empty-hero";
import ProductRecomendations from "~/components/commerce/product-recomandations";
import { ProductVariations } from "~/components/commerce/product-variations";
import { QuantitySelector } from "~/components/commerce/quantity-selector";
import Icon from "~/components/icon";
import Loading from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { H1, H3 } from "~/components/ui/typography";
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
            variant.orderable !== false,
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

export default function ProductPage() {
  const { id, variations: urlVariations } = useLocalSearchParams<{
    id: string;
    variations?: string;
    pid?: string;
  }>();

  const [wishListed] = useState(true);
  const [selectedVariations, setSelectedVariations] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);

  const addToBasketMutation = useAddItemToBasketMutation();
  const addToWishListMutation = useAddItemToProductListMutation();

  const { data: product, isLoading } = useQuery(
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
    }),
  );

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

  // Find the selected variant
  const selectedVariant = product?.variants?.find((variant) => {
    return Object.entries(selectedVariations).every(([attrId, value]) => {
      return variant.variationValues?.[attrId] === value;
    });
  });

  const largeImages = product?.imageGroups?.find(
    (ig) => ig.viewType === "large",
  );

  const images =
    largeImages?.images?.map((image) => image.disBaseLink || "") || [];

  const isInStock =
    selectedVariant?.orderable !== false &&
    selectedVariant?.inventory?.stockLevel !== 0;
  const stockLevel =
    selectedVariant?.inventory?.stockLevel || product?.inventory?.stockLevel;

  // Initialize default selections
  useEffect(() => {
    if (product?.variationAttributes && product?.variants) {
      const defaultSelections = getDefaultSelections(
        product.variationAttributes,
        product.variants,
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

  if (isLoading) {
    return <Loading />;
  }

  if (!product) {
    return <EmptyHero />;
  }

  return (
    <View className="flex flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        {images.length > 0 && (
          <View className="relative">
            <Carousel data={images} />
          </View>
        )}

        <View className="gap-3 p-4" style={{ paddingBottom: 120 }}>
          <View className="flex flex-row items-center justify-between gap-4">
            <H1 className="flex-1 text-2xl font-bold leading-tight">
              {product.name}
            </H1>
            <TouchableOpacity
              onPress={() => {}}
              className={cn(
                "rounded-full border p-2",
                wishListed
                  ? "border-destructive bg-destructive"
                  : "border-border bg-background",
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

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <H3>Quantity</H3>
            </View>

            <QuantitySelector
              value={quantity}
              onValueChange={setQuantity}
              min={1}
              max={stockLevel || 999}
              disabled={!isInStock}
            />
          </View>

          {product.longDescription ? (
            <Text className="text-sm leading-relaxed">
              {product.longDescription.replace(/<[^>]*>/g, "")}
            </Text>
          ) : (
            <Text className="text-sm text-muted-foreground">
              No detailed description available for this product.
            </Text>
          )}

          <ProductRecomendations
            products={[{ id }]}
            recId="pdp-similar-items"
          />
        </View>
      </ScrollView>

      <AvoidingBlur
        bottom={0}
        className="pb-safe flex flex-row gap-4 px-4 pt-4"
      >
        {/* Add to Cart Button */}
        <Price
          price={selectedVariant?.price || product.price}
          currency={product.currency}
          priceMax={product.priceMax}
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
            <Text className="font-medium text-primary-foreground">
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </Text>
          </View>
        </Button>
      </AvoidingBlur>
    </View>
  );
}
