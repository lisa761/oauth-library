export class OAuthClient {
  constructor(domain, clientId, redirectUri, clientSecret) {
    this.domain = domain;
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.clientSecret = clientSecret;
  }

  base64URLEncode(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
  }

  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const verifier = this.base64URLEncode(array);
    return verifier;
  }

  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    
    return this.base64URLEncode(hash);
  }
}

export async function startAuthFlow(client) {
  const state = Math.random().toString(36).substring(2);
  const codeVerifier = client.generateCodeVerifier();
  const codeChallenge = await client.generateCodeChallenge(codeVerifier);

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_code_verifier', codeVerifier);
  } else {
    global.oauthState = state;
    global.oauthCodeVerifier = codeVerifier;
  }

  const authUrl = new URL(`https://${client.domain}/authorize`);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', client.clientId);
  authUrl.searchParams.append('redirect_uri', client.redirectUri);
  authUrl.searchParams.append('scope', 'openid profile email offline_access');
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');

  return authUrl.toString();
}

export async function handleCallback(client, callbackParams) {
  const { state, code } = callbackParams;
  let storedState, codeVerifier;

  if (typeof window !== 'undefined') {
    storedState = sessionStorage.getItem('oauth_state');
    codeVerifier = sessionStorage.getItem('oauth_code_verifier');
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_code_verifier');
  } else {
    storedState = global.oauthState;
    codeVerifier = global.oauthCodeVerifier;
    global.oauthState = null;
    global.oauthCodeVerifier = null;
  }

  if (!state || state !== storedState) {
    throw new Error('Invalid state parameter. Potential CSRF attack.');
  }

  if (!code) {
    throw new Error('Authorization code is missing.');
  }

  const tokenUrl = `https://${client.domain}/oauth/token`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: client.clientId,
      redirect_uri: client.redirectUri,
      code,
      code_verifier: codeVerifier,
      ...(client.clientSecret && { client_secret: client.clientSecret })
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange authorization code for tokens.');
  }

  return response.json();
}

export async function refreshToken(client, refreshToken) {
  const tokenUrl = `https://${client.domain}/oauth/token`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: client.clientId,
      refresh_token: refreshToken,
      ...(client.clientSecret && { client_secret: client.clientSecret })
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh the access token.');
  }

  return response.json();
}

export async function getUserInfo(client, accessToken) {
  const userInfoUrl = `https://${client.domain}/userinfo`;

  const response = await fetch(userInfoUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user information.');
  }

  return response.json();
}

export function logout(client, returnToUrl) {
  const logoutUrl = new URL(`https://${client.domain}/v2/logout`);
  logoutUrl.searchParams.append('client_id', client.clientId);
  if (returnToUrl) {
    logoutUrl.searchParams.append('returnTo', returnToUrl);
  }

  return logoutUrl
}
