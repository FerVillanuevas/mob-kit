import {
  ShopperProductsTypes,
  ShopperSearchTypes,
} from "commerce-sdk-isomorphic";

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
