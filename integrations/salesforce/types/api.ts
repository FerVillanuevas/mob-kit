import type { ShopperCustomersTypes } from "commerce-sdk-isomorphic";

export interface Address extends ShopperCustomersTypes.CustomerAddress {}
export interface Customer extends ShopperCustomersTypes.Customer {}

export interface EinsteinResponse {
  recoUUID: string;
  recs: Rec[];
}

export interface Rec {
  id: string;
  image_url: string;
  product_name: string;
  product_url: string;
}
