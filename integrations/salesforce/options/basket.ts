import {
  addItemToNewOrExistingBasket,
  addPaymentInstrumentToBasket,
  deleteBasket,
  getBasket,
  getShippingMethodsForShipment,
  mergeBasket,
  updateBillingAddressForBasket,
  updateCustomerForBasket,
  updateItemInBasket,
  updateShippingAddressForShipment,
  updateShippingMethod,
  updateShippingMethodForShipment,
} from "~/integrations/salesforce/server/basket";

import {
  AddItemToBasketParams,
  AddPaymentInstrumentToBasketParams,
  UpdateBillingAddressForBasketParams,
  UpdateShippingAddressForShipmentParams,
  UpdateShippingMethodForShipmentParams,
  UpdateShippingMethodParams,
} from "~/integrations/salesforce/types/params";

import { queryOptions, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

export const useAddItemToBasketMutation = () => {
  return useMutation({
    mutationFn: async (params: AddItemToBasketParams) =>
      //@ts-ignore
      addItemToNewOrExistingBasket({ data: params }),
    meta: {
      sucessMessage: "Product Added",
      errorMessage: "Something went worng",
      invalidateQuery: getBasketQueryOptions().queryKey,
    },
  });
};

export const useMergeBasketMutation = () => {
  return useMutation({
    mutationFn: async () => mergeBasket({ data: {} }),
  });
};

export const useUpdateCustomerForBasketMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string; basketId: string }) =>
      updateCustomerForBasket({ data }),
    meta: {
      invalidateQuery: getBasketQueryOptions().queryKey,
    },
  });
};

export const useDeleteBasketMutation = () => {
  return useMutation({
    mutationFn: async (data: { basketId: string }) => deleteBasket({ data }),
    onSuccess: () => {
      router.replace("/");
    },
    meta: {
      invalidateQuery: getBasketQueryOptions().queryKey,
    },
  });
};

export const useUpdateShippingAddressForShipmentMutation = () => {
  return useMutation({
    mutationFn: async (data: UpdateShippingAddressForShipmentParams) =>
      updateShippingAddressForShipment({ data }),
    meta: {
      invalidateQuery: getBasketQueryOptions().queryKey,
    },
  });
};

export const useUpdateShippingMethodMutation = () => {
  return useMutation({
    mutationFn: async (data: UpdateShippingMethodParams) =>
      updateShippingMethod({ data }),
    meta: {
      invalidateQuery: getBasketQueryOptions().queryKey,
    },
  });
};

export const useUpdateShippingMethodForShipmentMutation = () => {
  return useMutation({
    mutationFn: async (data: UpdateShippingMethodForShipmentParams) =>
      updateShippingMethodForShipment({ data }),
    meta: {
      invalidateQuery: getBasketQueryOptions().queryKey,
    },
  });
};

export const useUpdateBillingAddressForBasketMutation = () => {
  return useMutation({
    mutationFn: async (data: UpdateBillingAddressForBasketParams) =>
      updateBillingAddressForBasket({ data }),
    meta: {
      invalidateQuery: getBasketQueryOptions().queryKey,
    },
  });
};

export const useAddPaymentInstrumentToBasketMutation = () => {
  return useMutation({
    mutationFn: async (data: AddPaymentInstrumentToBasketParams) =>
      addPaymentInstrumentToBasket({ data }),
    meta: {
      invalidateQuery: getBasketQueryOptions().queryKey,
    },
  });
};

export const getShippingMethodsForShipmentQueryOptions = ({
  basketId,
}: {
  basketId: string;
}) => {
  return queryOptions({
    queryKey: ["basket", "shippingMethods", { basketId }],
    queryFn: async () => getShippingMethodsForShipment({ data: { basketId } }),
    meta: {
      invalidateQuery: getBasketQueryOptions().queryKey,
    },
  });
};

export const getBasketQueryOptions = () => {
  return queryOptions({
    queryKey: ["basket"],
    queryFn: async () => getBasket({ data: {} }),
  });
};

export const useUpdateItemInBasketMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      basketId: string;
      itemId: string;
      quantity: number;
    }) => updateItemInBasket({ data }),
    meta: {
      invalidateQuery: getBasketQueryOptions().queryKey,
    },
  });
};
