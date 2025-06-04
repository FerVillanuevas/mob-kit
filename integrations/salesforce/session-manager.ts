import { SalesforceStore, salesforceStore$ } from "~/integrations/salesforce/store";
import type { SalesforceSessionData } from "~/integrations/salesforce/types/params";

export class SalesforceSessionManager {
  private saveInProgress = false;

  async getTokens(): Promise<SalesforceSessionData | null> {
    try {
      const tokens = salesforceStore$.get();
      return tokens && Object.keys(tokens).length > 0 ? tokens : null;
    } catch (error) {
      console.error("Error getting tokens:", error);
      return null;
    }
  }

  async saveTokens(tokenData: {
    accessToken: string;
    customerId: string;
    refreshToken: string;
    tokenExpiry: number;
    usid: string;
  }) {
    if (this.saveInProgress) {
      console.warn("Save already in progress, skipping");
      return;
    }

    this.saveInProgress = true;

    try {
      console.log(
        "Saving tokens - expires in:",
        Math.round((tokenData.tokenExpiry - Date.now()) / 1000 / 60),
        "minutes"
      );

      salesforceStore$.set(tokenData);
    } catch (error) {
      console.error("Error saving tokens:", error);
      throw error;
    } finally {
      this.saveInProgress = false;
    }
  }

  async clearTokens() {
    try {
      salesforceStore$.set({} as SalesforceStore);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  async isTokenValid(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();

      const isValid = !!(
        tokens?.accessToken &&
        tokens?.tokenExpiry &&
        Date.now() < tokens.tokenExpiry
      );

      console.log(
        "Token valid:",
        isValid,
        "expires in:",
        tokens?.tokenExpiry
          ? Math.round((tokens.tokenExpiry - Date.now()) / 1000 / 60) + " min"
          : "no expiry"
      );

      return isValid;
    } catch (error) {
      console.error("Error checking token validity:", error);
      return false;
    }
  }
}
