import { ShopperCustomersTypes } from "commerce-sdk-isomorphic";
import { ProductListTypes } from "~/integrations/salesforce/enums";
import {
  CreateCustomerAddressParams,
  CreateCustomerPaymentInstrumentParams,
  CustomerOrdersParams,
} from "~/integrations/salesforce/types/params";
import { createCommerceFunction } from "~/integrations/salesforce/utils";
import { RegisterFormData } from "~/lib/forms/customer";

export const authenticateCustomer = createCommerceFunction(
  async (_, client, data: { username: string; password: string }) => {
    await client.authenticateCustomer(data.username, data.password);
    return { success: true };
  },
);

export const registerCustomer = createCommerceFunction(
  async (api, client, data: RegisterFormData) => {
    const shopperCustomers = await api.shopperCustomers();

    await shopperCustomers.registerCustomer({
      parameters: {},
      body: {
        customer: {
          login: data.email,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        password: data.password,
      },
    });

    return await client.authenticateCustomer(data.email, data.password);
  },
);

export const logoutCustomer = createCommerceFunction(async (_, client) => {
  await client.authenticateAsGuest();
  return { success: true };
});

export const getCustomer = createCommerceFunction(async (api, client) => {
  const shopperCustomers = await api.shopperCustomers();
  const customerId = await client.getCustomerId();
  return await shopperCustomers.getCustomer({
    parameters: {
      customerId: customerId,
    },
  });
});

export const customerProductLists = createCommerceFunction(
  async (api, client) => {
    const shopperCustomers = await api.shopperCustomers();
    const customerId = await client.getCustomerId();
    return await shopperCustomers.getCustomerProductLists({
      parameters: {
        customerId: customerId,
      },
    });
  },
);

export const createProductList = createCommerceFunction(
  async (api, client, data: { type: ProductListTypes }) => {
    const shopperCustomers = await api.shopperCustomers();
    const customerId = await client.getCustomerId();

    return shopperCustomers.createCustomerProductList({
      body: {
        type: data.type,
      },
      parameters: {
        customerId: customerId,
      },
    });
  },
);

export const addItemToProductList = createCommerceFunction(
  async (api, client, data: { listId: string; productId: string }) => {
    const customerId = await client.getCustomerId();
    const shopperCustomers = await api.shopperCustomers();

    return await shopperCustomers.createCustomerProductListItem({
      parameters: {
        customerId: customerId,
        listId: data.listId,
      },
      body: {
        quantity: 1,
        productId: data.productId,
        public: false,
        priority: 1,
        type: "product",
      },
    });
  },
);

export const getCustomerOrders = createCommerceFunction(
  async (api, client, data: CustomerOrdersParams) => {
    const shopperCustomers = await api.shopperCustomers();
    const customerId = await client.getCustomerId();

    return (await shopperCustomers.getCustomerOrders({
      parameters: {
        customerId,
        ...data,
      },
    })) as ShopperCustomersTypes.CustomerOrderResult;
  },
);

export const createCustomerAddress = createCommerceFunction(
  async (api, client, data: CreateCustomerAddressParams) => {
    const shopperCustomers = await api.shopperCustomers();
    const customerId = await client.getCustomerId();
    if (!customerId) {
      throw new Error("Customer ID not available");
    }

    return await shopperCustomers.createCustomerAddress({
      parameters: {
        customerId,
      },
      body: data.body,
    });
  },
);

export const updateCustomerAddress = createCommerceFunction(
  async (api, client, data: CreateCustomerAddressParams) => {
    const shopperCustomers = await api.shopperCustomers();
    const customerId = await client.getCustomerId();

    return await shopperCustomers.updateCustomerAddress({
      parameters: {
        customerId: customerId,
        addressName: data.body.addressId,
      },
      body: data.body,
    });
  },
);

export const deleteCustomerAddress = createCommerceFunction(
  async (api, client, data: { addressId: string }) => {
    const shopperCustomers = await api.shopperCustomers();
    const customerId = await client.getCustomerId();

    return await shopperCustomers.removeCustomerAddress({
      parameters: {
        customerId: customerId,
        addressName: data.addressId,
      },
    });
  },
);

export const deleteItemFormProductList = createCommerceFunction(
  async (api, client, data: { listId: string; itemId: string }) => {
    const customerId = await client.getCustomerId();
    const shopperCustomers = await api.shopperCustomers();

    return await shopperCustomers.deleteCustomerProductListItem({
      parameters: {
        customerId: customerId,
        listId: data.listId,
        itemId: data.itemId,
      },
    });
  },
);

export const createCustomerPaymentInstrument = createCommerceFunction(
  async (api, client, data: CreateCustomerPaymentInstrumentParams) => {
    const shopperCustomers = await api.shopperCustomers();
    const customerId = await client.getCustomerId();

    return await shopperCustomers.createCustomerPaymentInstrument({
      parameters: {
        customerId: customerId,
      },
      body: data.body,
    });
  },
);

export const deleteCustomerPaymentInstrument = createCommerceFunction(
  async (api, client, data: { paymentInstrumentId: string }) => {
    const shopperCustomers = await api.shopperCustomers();
    const customerId = await client.getCustomerId();

    return await shopperCustomers.deleteCustomerPaymentInstrument({
      parameters: {
        customerId: customerId,
        paymentInstrumentId: data.paymentInstrumentId,
      },
    });
  },
);

export const getCustomerPaymentInstrument = createCommerceFunction(
  async (api, client, data: { paymentInstrumentId: string }) => {
    const shopperCustomers = await api.shopperCustomers();
    const customerId = await client.getCustomerId();

    return await shopperCustomers.getCustomerPaymentInstrument({
      parameters: {
        customerId: customerId,
        paymentInstrumentId: data.paymentInstrumentId,
      },
    });
  },
);
