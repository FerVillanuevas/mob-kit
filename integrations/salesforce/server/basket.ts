import { getSalesforceAPI } from "~/integrations/salesforce/server/config";
import {
  AddItemToBasketParams,
  AddPaymentInstrumentToBasketParams,
  UpdateBillingAddressForBasketParams,
  UpdateShippingAddressForShipmentParams,
  UpdateShippingMethodForShipmentParams,
  UpdateShippingMethodParams,
} from "~/integrations/salesforce/types/params";

export const addItemToNewOrExistingBasket = async ({
  data,
}: {
  data: AddItemToBasketParams;
}) => {
  const { api, client } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();
  const shopperCustomers = await api.shopperCustomers();
  const customerId = await client.getCustomerId();

  if (!customerId) {
    throw new Error("Customer ID not available");
  }

  let basketId: string | undefined;

  try {
    const baskets = await shopperCustomers.getCustomerBaskets({
      parameters: {
        customerId,
      },
    });

    if (baskets.total > 0) {
      basketId = baskets.baskets?.[0].basketId;
    } else {
      const newBasket = await shopperBasket.createBasket({
        body: {},
      });

      basketId = newBasket.basketId;
    }

    if (!basketId) {
      throw new Error("Failed to get or create basket");
    }

    return await shopperBasket.addItemToBasket({
      parameters: {
        basketId,
      },
      body: data.body,
    });
  } catch (error) {
    console.error("Error in addItemToNewOrExistingBasket:", error);
    throw error;
  }
};

export const mergeBasket = async () => {
  const { api } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();

  return await shopperBasket.mergeBasket({
    parameters: {
      createDestinationBasket: true,
    },
  });
};

export const updateCustomerForBasket = async ({
  data,
}: {
  data: { email: string; basketId: string };
}) => {
  const { api } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();

  return await shopperBasket.updateCustomerForBasket({
    parameters: {
      basketId: data.basketId,
    },
    body: {
      email: data.email,
    },
  });
};

export const deleteBasket = async ({
  data,
}: {
  data: { basketId: string };
}) => {
  const { api } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();

  return await shopperBasket.deleteBasket({
    parameters: {
      basketId: data.basketId,
    },
  });
};

export const getBasket = async () => {
  const { api, client } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();
  const shopperCustomers = await api.shopperCustomers();
  const customerId = await client.getCustomerId();
  let basketId: string | undefined;

  const baskets = await shopperCustomers.getCustomerBaskets({
    parameters: {
      customerId,
    },
  });

  if (baskets.total > 0) {
    basketId = baskets.baskets?.[0].basketId;
  } else {
    const newBasket = await shopperBasket.createBasket({
      body: {},
    });

    basketId = newBasket.basketId;
  }

  if (!basketId) {
    throw new Error();
  }

  return await shopperBasket.getBasket({
    parameters: {
      basketId,
    },
  });
};

export const updateShippingMethod = async ({
  data,
}: {
  data: UpdateShippingMethodParams;
}) => {
  const { api } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();

  return await shopperBasket.updateShipmentForBasket({
    body: data.body,
    parameters: data.params,
  });
};

export const updateShippingMethodForShipment = async ({
  data,
}: {
  data: UpdateShippingMethodForShipmentParams;
}) => {
  const { api } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();

  return await shopperBasket.updateShippingMethodForShipment({
    parameters: data.params,
    body: data.body,
  });
};

export const updateShippingAddressForShipment = async ({
  data,
}: {
  data: UpdateShippingAddressForShipmentParams;
}) => {
  const { api } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();

  return await shopperBasket.updateShippingAddressForShipment({
    parameters: data.params,
    body: data.body,
  });
};

export const updateBillingAddressForBasket = async ({
  data,
}: {
  data: UpdateBillingAddressForBasketParams;
}) => {
  const { api } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();

  return await shopperBasket.updateBillingAddressForBasket({
    parameters: data.params,
    body: data.body,
  });
};

export const getShippingMethodsForShipment = async ({ data }: any) => {
  const { api } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();

  return await shopperBasket.getShippingMethodsForShipment({
    parameters: {
      basketId: data.basketId,
      shipmentId: "me",
    },
  });
};

export const addPaymentInstrumentToBasket = async ({
  data,
}: {
  data: AddPaymentInstrumentToBasketParams;
}) => {
  const { api } = await getSalesforceAPI();
  const shopperBasket = await api.shopperBaskets();

  return await shopperBasket.addPaymentInstrumentToBasket({
    body: data.body,
    parameters: data.params,
  });
};

export const updateItemInBasket = async ({
  data,
}: {
  data: {
    basketId: string;
    itemId: string;
    quantity: number;
  };
}) => {
  const { api } = await getSalesforceAPI();

  const shopperBaskets = await api.shopperBaskets();

  return await shopperBaskets.updateItemInBasket({
    parameters: {
      basketId: data.basketId,
      itemId: data.itemId,
    },
    body: {
      quantity: data.quantity,
    },
  });
};
