import {
  ShopperProductsTypes,
  ShopperSearchTypes,
} from "commerce-sdk-isomorphic";
import { CardTypes } from "~/integrations/salesforce/enums";

import valid from "card-validator";

// Union type for both product types
export type ProductLike =
  | ShopperSearchTypes.ProductSearchHit
  | ShopperProductsTypes.Product;

// Normalized product interface that handles differences between the two types
export interface NormalizedProduct {
  id: string;
  name: string;
  image?: string;
  imageAlt?: string;
  price?: number;
  priceMax?: number;
  currency: string;
  orderable: boolean;
  promotions?: Array<any>;
  imageGroups?: Array<any>;
  priceRanges?: Array<any>;
  brand?: string;
  shortDescription?: string;
  longDescription?: string;
}

// Utility function to normalize product data
export function normalizeProduct(product: ProductLike): NormalizedProduct {
  // Type guards to check which type we're dealing with
  const isSearchHit = "productId" in product;

  if (isSearchHit) {
    const searchHit = product as ShopperSearchTypes.ProductSearchHit;
    return {
      id: searchHit.productId,
      name: searchHit.productName || `Product ${searchHit.productId}`,
      image:
        searchHit.image?.link || searchHit.imageGroups?.[0]?.images?.[0]?.link,
      imageAlt: searchHit.image?.alt || searchHit.productName,
      price: searchHit.price,
      priceMax: searchHit.priceMax,
      currency: searchHit.currency || "USD",
      orderable: searchHit.orderable ?? true,
      promotions: searchHit.productPromotions,
      imageGroups: searchHit.imageGroups,
      priceRanges: searchHit.priceRanges,
    };
  } else {
    const productData = product as ShopperProductsTypes.Product;
    return {
      id: productData.id,
      name: productData.name || `Product ${productData.id}`,
      image: productData.imageGroups?.[0]?.images?.[0]?.link,
      imageAlt: productData.name,
      price: productData.price,
      priceMax: productData.priceMax,
      currency: productData.currency || "USD",
      orderable: true, // Products are generally orderable unless specified
      promotions: productData.productPromotions,
      imageGroups: productData.imageGroups,
      priceRanges: productData.priceRanges,
      brand: productData.brand,
      shortDescription: productData.shortDescription,
      longDescription: productData.longDescription,
    };
  }
}

export const cleanCardNumber = (cardNumber: string): string => {
  return cardNumber.replace(/\s/g, ""); // Remove all spaces
};

export const formatCardNumberForDisplay = (value: string) => {
  // If already masked, don't format
  if (value.includes("*")) {
    return value;
  }

  // Remove all non-digits
  const v = value.replace(/\D/g, "");

  // Add spaces every 4 digits for display
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts: string[] = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(" ");
  } else {
    return v;
  }
};

// Helper function to detect card type from number
export const detectCardType = (cardNumber: string): CardTypes | null => {
  const validation = valid.number(cardNumber);

  if (validation.card && validation.card.type) {
    // Map card-validator types to our enum
    const typeMap: Record<string, CardTypes> = {
      visa: CardTypes.VISA,
      mastercard: CardTypes.MASTERCARD,
      "american-express": CardTypes.AMERICAN_EXPRESS,
    };

    return typeMap[validation.card.type] || null;
  }
  return null;
};
