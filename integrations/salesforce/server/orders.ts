import { getSalesforceAPI } from "~/integrations/salesforce/server/config";
import { CreateOrderParams } from "~/integrations/salesforce/types/params";

export const createOrder = async ({ data }: { data: CreateOrderParams }) => {
  const { api, client } = await getSalesforceAPI();
  const shopperOrders = await api.shopperOrders();

  return await shopperOrders.createOrder({
    parameters: data.params,
    //@ts-ignore
    body: data.body,
  });
};
export const getOrder = async ({ data }: { data: { orderNo: string } }) => {
  const { api } = await getSalesforceAPI();
  const shopperOrders = await api.shopperOrders();

  return await shopperOrders.getOrder({
    parameters: {
      orderNo: data.orderNo,
    },
  });
};
