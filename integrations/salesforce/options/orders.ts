import { queryOptions } from "@tanstack/react-query";
import { ShopperOrdersTypes } from "commerce-sdk-isomorphic";
import { getOrder } from "~/integrations/salesforce/server/orders";

export const getOrderQueryOptions = (orderNo: string) => {
  return queryOptions<ShopperOrdersTypes.Order>({
    queryKey: ["orders", orderNo],
    queryFn: async () => getOrder({ data: { orderNo } }),
  });
};
