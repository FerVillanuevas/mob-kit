import { observable } from "@legendapp/state";

export type SalesforceStore = {
  accessToken: string;
  customerId: string;
  refreshToken: string;
  tokenExpiry: number;
  usid: string;
};

export const salesforceStore$ = observable<SalesforceStore>({} as SalesforceStore);
