import { customRandom, urlAlphabet } from "nanoid";
import seedrandom, { PRNG } from "seedrandom";

import type { ShopperLogin, ShopperLoginTypes } from "commerce-sdk-isomorphic";

import * as Crypto from "expo-crypto";

/**
 * Helper function to get the Salesforce API URL
 */
export const getURL = (shortCode: string) => {
  return `https://${shortCode}.api.commercecloud.salesforce.com`;
};

/* safe url */
export const urlSafe = (input: string) =>
  input.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

const nanoid = (): string => {
  const rng: PRNG = seedrandom(String(+new Date()), { entropy: true });
  return customRandom(urlAlphabet, 128, (size) =>
    new Uint8Array(size).map(() => 256 * rng())
  )();
};

export const createCodeVerifier = (): string => nanoid();

async function generateCodeChallange(codeVerifier: string) {
  const base64Digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    {
      encoding: Crypto.CryptoEncoding.BASE64,
    }
  );

  return base64Digest ? urlSafe(base64Digest) : "";
}

/* Login helper */
export async function loginAsGuest(
  shopperLogin: ShopperLogin<any>,
  redirect_uri: string
): Promise<ShopperLoginTypes.TokenResponse> {
  const codeVerifier = createCodeVerifier();
  let challenge = await generateCodeChallange(codeVerifier);

  shopperLogin.clientConfig.fetchOptions = {
    ...shopperLogin.clientConfig.fetchOptions,
    redirect: "manual",
  };

  const response = await shopperLogin.authorizeCustomer(
    {
      parameters: {
        client_id: shopperLogin.clientConfig.parameters.clientId,
        channel_id: shopperLogin.clientConfig.parameters.siteId,
        code_challenge: challenge,
        organizationId: shopperLogin.clientConfig.parameters.organizationId,
        redirect_uri: redirect_uri,
        response_type: "code",
        hint: "guest",
      },
    },
    true
  );

  const params = new URL(response.url);

  const body: ShopperLoginTypes.TokenRequest = {
    client_id: shopperLogin.clientConfig.parameters.clientId,
    channel_id: shopperLogin.clientConfig.parameters.siteId,
    code: params.searchParams.get("code")!,
    code_verifier: codeVerifier,
    grant_type: "authorization_code_pkce",
    redirect_uri: redirect_uri,
    usid: params.searchParams.get("usid")!,
  };

  const url = getURL(shopperLogin.clientConfig.parameters.shortCode);

  const formData = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    formData.append(key, value as string);
  });

  const tokenResponse = await fetch(
    `${url}/shopper/auth/v1/organizations/${shopperLogin.clientConfig.parameters.organizationId}/oauth2/token`,
    {
      method: "POST",
      body: formData.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const data = await tokenResponse.json();

  return data;
}

export async function loginRegisteredUserB2C(
  shopperLogin: ShopperLogin<any>,
  credentials: {
    username: string;
    password: string;
  },
  parameters: {
    redirectURI: string;
    usid?: string;
    dnt?: boolean;
  }
): Promise<ShopperLoginTypes.TokenResponse> {
  const codeVerifier = createCodeVerifier();
  const codeChallenge = await generateCodeChallange(codeVerifier);

  shopperLogin.clientConfig.fetchOptions = {
    ...shopperLogin.clientConfig.fetchOptions,
    redirect: "manual",
  };

  const authorization = `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;

  const searchParams = new URLSearchParams();

  searchParams.append("redirect_uri", parameters.redirectURI);
  searchParams.append(
    "client_id",
    shopperLogin.clientConfig.parameters.clientId
  );
  searchParams.append("code_challenge", codeChallenge);
  searchParams.append(
    "channel_id",
    shopperLogin.clientConfig.parameters.siteId
  );

  const url = getURL(shopperLogin.clientConfig.parameters.shortCode);

  const response = await fetch(
    `${url}/shopper/auth/v1/organizations/${shopperLogin.clientConfig.parameters.organizationId}/oauth2/login`,
    {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: searchParams.toString(),
      redirect: "manual",
    }
  );

  const params = new URL(response.url);

  const body: ShopperLoginTypes.TokenRequest = {
    client_id: shopperLogin.clientConfig.parameters.clientId,
    channel_id: shopperLogin.clientConfig.parameters.siteId,
    code: params.searchParams.get("code")!,
    code_verifier: codeVerifier,
    grant_type: "authorization_code_pkce",
    redirect_uri: parameters.redirectURI,
    usid: params.searchParams.get("usid")!,
  };

  const formData = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    formData.append(key, value as string);
  });

  const tokenResponse = await fetch(
    `${url}/shopper/auth/v1/organizations/${shopperLogin.clientConfig.parameters.organizationId}/oauth2/token`,
    {
      method: "POST",
      body: formData.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const data = await tokenResponse.json();

  return data;
}

export async function refreshAccessToken(
  slasClient: ShopperLogin<any>,
  parameters: {
    refreshToken: string;
    dnt?: boolean;
  }
): Promise<ShopperLoginTypes.TokenResponse> {
  const body = {
    grant_type: "refresh_token",
    refresh_token: parameters.refreshToken,
    client_id: slasClient.clientConfig.parameters.clientId,
    channel_id: slasClient.clientConfig.parameters.siteId,
    ...(parameters.dnt !== undefined && { dnt: parameters.dnt.toString() }),
  };

  const url = getURL(slasClient.clientConfig.parameters.shortCode);

  const formData = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    formData.append(key, value as string);
  });

  const tokenResponse = await fetch(
    `${url}/shopper/auth/v1/organizations/${slasClient.clientConfig.parameters.organizationId}/oauth2/token`,
    {
      method: "POST",
      body: formData.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const data = await tokenResponse.json();

  return data;
}

export async function logout(
  slasClient: ShopperLogin<any>,
  parameters: {
    accessToken: string;
    refreshToken: string;
  }
): Promise<ShopperLoginTypes.TokenResponse> {
  const data = await slasClient.logoutCustomer({
    headers: {
      Authorization: `Bearer ${parameters.accessToken}`,
    },
    parameters: {
      refresh_token: parameters.refreshToken,
      client_id: slasClient.clientConfig.parameters.clientId,
      channel_id: slasClient.clientConfig.parameters.siteId,
    },
  });

  return data;
}
