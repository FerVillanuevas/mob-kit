import { queryOptions, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { getBasketQueryOptions } from "~/integrations/salesforce/options/basket";
import { createOrder, getOrder } from "~/integrations/salesforce/server/orders";
import { CreateOrderParams } from "~/integrations/salesforce/types/params";

export const getOrderQueryOptions = (params: { orderNo: string }) => {
  return queryOptions({
    queryKey: ["orders", { ...params }],
    queryFn: async () => getOrder({ data: params }),
  });
};

export const useCreateOrderMutation = () => {
  return useMutation({
    mutationFn: async (data: CreateOrderParams) => createOrder({ data }),
    onSuccess: () => {
      router.replace("/");
    },
    meta: {
      errorMessage: "Something Went wtong",
      invalidateQuery: getBasketQueryOptions().queryKey,
      sucessMessage: "Order Placed",
    },
  });
};
