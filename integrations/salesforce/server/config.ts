import { SalesforceAPI } from "~/integrations/salesforce/api";
import { SalesforceCommerceClient } from "~/integrations/salesforce/client";

export const salesforceConfig = {
  clientId: process.env.EXPO_PUBLIC_SFCC_CLIENT_ID!,
  organizationId: process.env.EXPO_PUBLIC_SFCC_ORG_ID!,
  shortCode: process.env.EXPO_PUBLIC_SFCC_SHORT_CODE!,
  siteId: process.env.EXPO_PUBLIC_SFCC_SITE_ID!,
};

export async function getSalesforceAPI() {
  const client = new SalesforceCommerceClient(salesforceConfig);
  return {
    api: new SalesforceAPI(client, salesforceConfig),
    client,
  };
}
