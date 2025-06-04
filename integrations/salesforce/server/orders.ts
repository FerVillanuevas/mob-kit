import { getSalesforceAPI } from "~/integrations/salesforce/server/config";

export const createOrder = async ({ data }) => {
  const { api, client } = await getSalesforceAPI();
  const shopperOrders = await api.shopperOrders();

  return await shopperOrders.createOrder({
    parameters: data.params,
    body: data.body,
  });
};
export const getOrder = async ({ data }) => {
  const { api } = await getSalesforceAPI();
  const shopperOrders = await api.shopperOrders();

  return await shopperOrders.getOrder({
    parameters: {
      orderNo: data.orderNo,
    },
  });
};
