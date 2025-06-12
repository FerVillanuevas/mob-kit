import {
  AddItemToBasketParams,
  AddPaymentInstrumentToBasketParams,
  UpdateBillingAddressForBasketParams,
  UpdateShippingAddressForShipmentParams,
  UpdateShippingMethodForShipmentParams,
  UpdateShippingMethodParams,
} from "~/integrations/salesforce/types/params";
import { createCommerceFunction } from "~/integrations/salesforce/utils";

export const addItemToNewOrExistingBasket = createCommerceFunction(
  async (api, client, data: AddItemToBasketParams) => {
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

      await shopperBasket.updateShippingMethodForShipment({
        parameters: {
          basketId: basketId,
          shipmentId: "me",
        },
        body: {
          id: "001",
        },
      });

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
  },
);

export const mergeBasket = createCommerceFunction(async (api) => {
  const shopperBasket = await api.shopperBaskets();

  return await shopperBasket.mergeBasket({
    parameters: {
      createDestinationBasket: true,
    },
  });
});

export const updateCustomerForBasket = createCommerceFunction(
  async (api, _, data: { email: string; basketId: string }) => {
    const shopperBasket = await api.shopperBaskets();

    return await shopperBasket.updateCustomerForBasket({
      parameters: {
        basketId: data.basketId,
      },
      body: {
        email: data.email,
      },
    });
  },
);

export const deleteBasket = createCommerceFunction(
  async (api, _, data: { basketId: string }) => {
    const shopperBasket = await api.shopperBaskets();

    return await shopperBasket.deleteBasket({
      parameters: {
        basketId: data.basketId,
      },
    });
  },
);

export const getBasket = createCommerceFunction(async (api, client) => {
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
});

export const updateShippingMethod = createCommerceFunction(
  async (api, _, data: UpdateShippingMethodParams) => {
    const shopperBasket = await api.shopperBaskets();

    return await shopperBasket.updateShipmentForBasket({
      body: data.body,
      parameters: data.params,
    });
  },
);

export const updateShippingMethodForShipment = createCommerceFunction(
  async (api, _, data: UpdateShippingMethodForShipmentParams) => {
    const shopperBasket = await api.shopperBaskets();

    return await shopperBasket.updateShippingMethodForShipment({
      parameters: data.params,
      body: data.body,
    });
  },
);

export const updateShippingAddressForShipment = createCommerceFunction(
  async (api, _, data: UpdateShippingAddressForShipmentParams) => {
    const shopperBasket = await api.shopperBaskets();

    return await shopperBasket.updateShippingAddressForShipment({
      parameters: data.params,
      body: data.body,
    });
  },
);

export const updateBillingAddressForBasket = createCommerceFunction(
  async (api, _, data: UpdateBillingAddressForBasketParams) => {
    const shopperBasket = await api.shopperBaskets();

    return await shopperBasket.updateBillingAddressForBasket({
      parameters: data.params,
      body: data.body,
    });
  },
);

export const getShippingMethodsForShipment = createCommerceFunction(
  async (api, _, data: { basketId: string }) => {
    const shopperBasket = await api.shopperBaskets();

    return await shopperBasket.getShippingMethodsForShipment({
      parameters: {
        basketId: data.basketId,
        shipmentId: "me",
      },
    });
  },
);

export const addPaymentInstrumentToBasket = createCommerceFunction(
  async (api, client, data: AddPaymentInstrumentToBasketParams) => {
    const shopperBasket = await api.shopperBaskets();

    return await shopperBasket.addPaymentInstrumentToBasket({
      body: data.body,
      parameters: data.params,
    });
  },
);

export const updateItemInBasket = createCommerceFunction(
  async (
    api,
    _,
    data: { basketId: string; itemId: string; quantity: number },
  ) => {
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
  },
);
