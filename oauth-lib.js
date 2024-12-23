export class OAuthClient {
  constructor(domain, clientId, redirectUri, clientSecret) {
    this.domain = domain;
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.clientSecret = clientSecret;
  }
}

export function startAuthFlow(client) {
  const state = Math.random().toString(36).substring(2);
  const authUrl = new URL(`https://${client.domain}/authorize`);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', client.clientId);
  authUrl.searchParams.append('redirect_uri', client.redirectUri);
  authUrl.searchParams.append('scope', 'openid profile email offline_access');
  authUrl.searchParams.append('state', state);

  // Store the state for later verification
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state); // For browser apps
  } else {
    global.oauthState = state; // For server-side apps
  }

  return authUrl.toString();
}

export async function handleCallback(client, callbackParams) {
  const { state, code } = callbackParams;
  let storedState;

  if (typeof window !== 'undefined') {
    storedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state');
  } else {
    storedState = global.oauthState;
    global.oauthState = null;
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
