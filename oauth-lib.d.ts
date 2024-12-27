export interface OAuthClient {
  domain: string;
  clientId: string;
  redirectUri: string;
}

export interface OAuthClientConstructor {
  new (domain: string, clientId: string, redirectUri: string): OAuthClient;
}

export declare const OAuthClient: OAuthClientConstructor;

export function startAuthFlow(client: OAuthClient): string;

export function handleCallback(
  client: OAuthClient,
  callbackParams: Record<string, any>
): Promise<{ access_token: string; refresh_token: string }>;

export function refreshToken(client: OAuthClient, refreshToken: string): Promise<TokenResponse>;

export function getUserInfo(client: OAuthClient, accessToken: string): Promise<UserInfo>;

export function logout(client: OAuthClient, returnToUrl: string): string;

export function findScopes(client: OAuthClient, accessToken: string): string;
