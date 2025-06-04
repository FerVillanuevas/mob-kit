import { ShopperLogin } from "commerce-sdk-clean";
import {
  loginAsGuest,
  loginRegisteredUserB2C,
  refreshAccessToken,
} from "~/integrations/salesforce/helpers";
import { SalesforceSessionManager } from "~/integrations/salesforce/session-manager";
import type { SalesforceConfig } from "~/integrations/salesforce/types/params";

export class SalesforceCommerceClient {
  private config: SalesforceConfig;
  private sessionManager: SalesforceSessionManager;
  private shopperLogin: ShopperLogin<any>;
  private authInProgress = false; // Add flag to prevent concurrent auth attempts

  constructor(config: SalesforceConfig) {
    this.config = config;
    this.sessionManager = new SalesforceSessionManager();
    this.shopperLogin = new ShopperLogin({
      parameters: {
        clientId: this.config.clientId,
        organizationId: this.config.organizationId,
        shortCode: this.config.shortCode,
        siteId: this.config.siteId,
      },
    });
  }

  async ensureAuthenticated(): Promise<void> {
    // Prevent concurrent authentication attempts
    if (this.authInProgress) {
      // Wait for ongoing auth to complete
      while (this.authInProgress) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    if (await this.sessionManager.isTokenValid()) {
      return;
    }

    this.authInProgress = true;

    try {
      console.log("Token not valid, attempting refresh or guest login");

      const tokens = await this.sessionManager.getTokens();
      if (tokens?.refreshToken) {
        try {
          console.log("Attempting token refresh");
          await this.refreshAccessToken();
          return;
        } catch (error) {
          console.log("Token refresh failed, clearing tokens:", error);
          await this.sessionManager.clearTokens();
        }
      }

      console.log("Logging in as guest");
      await this.authenticateAsGuest();
    } catch (error) {
      console.error("Authentication failed:", error);
      throw error;
    } finally {
      this.authInProgress = false;
    }
  }

  async authenticateAsGuest(): Promise<void> {
    const response = await loginAsGuest(
      this.shopperLogin,
      process.env.EXPO_PUBLIC_APP_URL || "https://example.com/callback"
    );

    await this.sessionManager.saveTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      customerId: response.customer_id,
      tokenExpiry: Date.now() + (response.expires_in - 300) * 1000,
      usid: response.usid,
    });
  }

  private async refreshAccessToken(): Promise<void> {
    const tokens = await this.sessionManager.getTokens();
    if (!tokens?.refreshToken) throw new Error("No refresh token available");

    const response = await refreshAccessToken(this.shopperLogin, {
      refreshToken: tokens.refreshToken,
    });

    await this.sessionManager.saveTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      tokenExpiry: Date.now() + (response.expires_in - 300) * 1000,
      customerId: response.customer_id,
      usid: response.usid,
    });
  }

  async authenticateCustomer(
    username: string,
    password: string
  ): Promise<void> {
    await this.ensureAuthenticated();
    const tokens = await this.sessionManager.getTokens();
    const usid = tokens?.usid;

    const response = await loginRegisteredUserB2C(
      this.shopperLogin,
      {
        username: username,
        password: password,
      },
      {
        redirectURI:
          process.env.EXPO_PUBLIC_APP_URL || "http://localhost:3000/callback",
        usid: usid,
      }
    );

    await this.sessionManager.saveTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      tokenExpiry: Date.now() + (response.expires_in - 300) * 1000,
      customerId: response.customer_id,
      usid: response.usid,
    });
  }

  async logout(): Promise<void> {
    const response = await loginAsGuest(
      this.shopperLogin,
      process.env.EXPO_PUBLIC_APP_URL || "http://localhost:3000/callback"
    );

    await this.sessionManager.saveTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      tokenExpiry: Date.now() + (response.expires_in - 300) * 1000,
      customerId: response.customer_id,
      usid: response.usid,
    });
  }

  async clearAllAuthentication(): Promise<void> {
    await this.sessionManager.clearTokens();
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.sessionManager.isTokenValid();
  }

  async getCustomerId(): Promise<string | undefined> {
    const tokens = await this.sessionManager.getTokens();
    return tokens?.customerId;
  }

  async getAuthToken(): Promise<string> {
    await this.ensureAuthenticated();
    const tokens = await this.sessionManager.getTokens();

    if (!tokens?.accessToken) {
      throw new Error("No access token available after authentication");
    }

    return tokens.accessToken;
  }
}
