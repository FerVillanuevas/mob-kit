import { getSalesforceAPI } from "~/integrations/salesforce/server/config";

export const getPage = async ({ data }) => {
  const { api } = await getSalesforceAPI();
  const shopperExperience = await api.shopperExperience();

  return await shopperExperience.getPage({
    parameters: data,
  });
};
