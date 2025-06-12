import { queryOptions, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { ProductListTypes } from "~/integrations/salesforce/enums";
import {
  addItemToProductList,
  createCustomerAddress,
  createCustomerPaymentInstrument,
  createProductList,
  customerProductLists,
  deleteCustomerAddress,
  deleteCustomerPaymentInstrument,
  deleteItemFormProductList,
  getCustomer,
  getCustomerOrders,
  getCustomerPaymentInstrument,
  updateCustomerAddress,
} from "~/integrations/salesforce/server/customer";

import { Customer } from "~/integrations/salesforce/types/api";

import {
  CreateCustomerAddressParams,
  CreateCustomerPaymentInstrumentParams,
  CustomerOrdersParams,
} from "~/integrations/salesforce/types/params";

export const getCustomerQueryOptions = () => {
  return queryOptions<Customer>({
    queryKey: ["customers"],
    queryFn: async () => getCustomer({ data: {} }),
  });
};

export const getCustomerOrdersQueryOptions = (data: CustomerOrdersParams) => {
  return queryOptions({
    queryKey: ["customers", "orders", { ...data }],
    queryFn: async () => getCustomerOrders({ data }),
  });
};

export const getProductListQueryOptions = () => {
  return queryOptions({
    queryKey: ["customers", "productLists"],
    queryFn: async () => customerProductLists({ data: {} }),
  });
};

export const useCreateProductListMutation = () => {
  return useMutation({
    mutationFn: async (data: { type: ProductListTypes }) => {
      return createProductList({ data });
    },
    meta: {
      invalidateQuery: getProductListQueryOptions().queryKey,
    },
  });
};

export const useAddItemToProductListMutation = () => {
  return useMutation({
    mutationFn: async (data: { listId: string; productId: string }) => {
      return addItemToProductList({ data });
    },
    meta: {
      sucessMessage: "Done",
      invalidateQuery: getProductListQueryOptions().queryKey,
    },
  });
};

export const useDeleteItemFromProductListMutation = () => {
  return useMutation({
    mutationFn: async (data: { listId: string; itemId: string }) => {
      return deleteItemFormProductList({ data });
    },
    meta: {
      sucessMessage: "Product deleted",
      invalidateQuery: getProductListQueryOptions().queryKey,
    },
  });
};

export const useCreateCustumerAddressMutation = () => {
  return useMutation({
    mutationFn: async (data: CreateCustomerAddressParams) =>
      createCustomerAddress({ data }),
    onSuccess: console.log,
    onError: console.log,
    meta: {
      sucessMessage: "New Address created",
      errorMessage: "Something went worng",
      invalidateQuery: getCustomerQueryOptions().queryKey,
    },
  });
};

export const useUpdateCustomerAddressMutation = () => {
  return useMutation({
    mutationFn: async (data: CreateCustomerAddressParams) =>
      updateCustomerAddress({ data }),
    meta: {
      sucessMessage: "Address updated",
      errorMessage: "Something went worng",
      invalidateQuery: getCustomerQueryOptions().queryKey,
    },
  });
};

export const useDeleteCustomerAddressMutation = () => {
  return useMutation({
    mutationFn: async (data: { addressId: string }) =>
      deleteCustomerAddress({ data }),
    meta: {
      sucessMessage: "Address deleted",
      invalidateQuery: getCustomerQueryOptions().queryKey,
    },
    onSuccess: () => {
      router.back();
    },
  });
};

export const useCreateCustomerPaymentInstrumentMutation = () => {
  return useMutation({
    mutationFn: async (data: CreateCustomerPaymentInstrumentParams) =>
      createCustomerPaymentInstrument({ data }),
    meta: {
      sucessMessage: "Payment method created",
      invalidateQuery: getCustomerQueryOptions().queryKey,
    },
    onSuccess: () => {
      router.back();
    },
  });
};

export const useDeleteCustomerPaymentInstrumentMutation = () => {
  return useMutation({
    mutationFn: async (data: { paymentInstrumentId: string }) =>
      deleteCustomerPaymentInstrument({ data }),
    meta: {
      sucessMessage: "Payment method deleted",
      invalidateQuery: getCustomerQueryOptions().queryKey,
    },
    onSuccess: () => {
      router.back();
    },
  });
};

export const getCustomerPaymentInstrumentQueryOptions = (
  paymentInstrumentId: string,
) => {
  return queryOptions({
    queryKey: ["customers", "paymentInstruments", paymentInstrumentId],
    queryFn: async () =>
      getCustomerPaymentInstrument({ data: { paymentInstrumentId } }),
  });
};
