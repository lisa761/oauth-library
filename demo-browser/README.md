# Browser Demo App using React
This React app uses the **OAuth client library** for OAuth authentication. The app allows users to log in using OAuth, retrieve their access tokens, refresh tokens, and fetch user information from the OAuth provider.

The OAuth client library abstracts the core logic of handling OAuth authentication flows, ensuring that the app focuses on the UI and user experience.

## Run the App
```bash
cd demo-browser
npm install
npm run dev
```

---

## Key Functions from oauth-lib

The app uses several functions from the OAuth client library (../../oauth-lib) to manage OAuth flow:

### 1. OAuthClient (Constructor)
This is the main class that holds the configuration for the OAuth client. It is instantiated with:

- `domain`: The OAuth provider's domain.
- `clientId`: The client ID from the OAuth provider.
- `redirectUri`: The URL where the OAuth provider will redirect after successful authentication.

**Usage**
```typescript
const client = useRef<any>(
  new OAuthClient(
    import.meta.env.VITE_DOMAIN,
    import.meta.env.VITE_CLIENT_ID,
    window.location.origin,
  )
);
```

### 2. startAuthFlow(client)
This function starts the OAuth authorization flow by generating the authorization URL. It appends the necessary query parameters (like response_type, client_id, redirect_uri, scope, and state) to the URL and returns the complete URL.

**Usage:**
```typescript
const handleLogin = () => {
  const authUrl = startAuthFlow(client.current);
  window.location.href = authUrl;
}
```

### 3. handleCallback(client, callbackParams)
This function handles the OAuth callback by verifying the state parameter and exchanging the code for an access token and refresh token. If successful, it returns the token response from the OAuth provider.

**Usage:**
```typescript
const tokens = await handleCallback(client.current, { code, state });
```

### 4. getUserInfo(client, accessToken)
This function retrieves the user's information from the OAuth provider using the provided access_token.

**Usage:**
```typescript
const userInfo = await getUserInfo(client.current, tokens.access_token);
```

### 5. refreshToken(client, refreshToken)
This function is used to refresh the access token when it expires. It takes the refresh token and the OAuth client and returns the new access token and refresh token.

**Usage:**
```typescript
const tokens = await refreshToken(client.current, refreshTokenValue.current);
```

### 6. logout(client, returnToUrl)
This function generates the URL to log the user out from the OAuth provider. It redirects the user to the provider’s logout page, optionally returning the user to a specified URL after logging out.

**Usage:**
```typescript
window.location.href = logout(client.current, window.location.origin);
```

---

## Security Considerations
When handling OAuth tokens in a browser app, it is important to follow best practices to ensure the security of the tokens. Below are some recommendations for securely storing and managing tokens:

**1. Avoid Storing Tokens in LocalStorage or SessionStorage**
Storing tokens in localStorage or sessionStorage is not recommended for security reasons, as these storage mechanisms are accessible by JavaScript running in the browser, and are vulnerable to cross-site scripting (XSS) attacks. If an attacker can inject malicious scripts into your application, they could potentially steal the tokens.

**2. Use In-Memory Storage**
The best approach for storing tokens in a browser application is to keep them in memory (using React state or in-memory variables). This means the tokens are cleared when the page is refreshed or the session ends. The tokens will not persist beyond the session, minimizing the risk of exposure.

In this app, the access and refresh tokens are stored in useRef (for persistence across renders) and the loggedIn state. This keeps the tokens in memory and they are cleared once the user logs out.

**3. Secure Token Transmission**
Always transmit tokens over HTTPS to prevent man-in-the-middle (MITM) attacks. This ensures that tokens are encrypted in transit, protecting them from interception by attackers.

**4. Use Short-Lived Access Tokens**
Whenever possible, use short-lived access tokens and refresh them using refresh tokens. This minimizes the window of opportunity for an attacker to misuse an access token if it gets compromised.

**5. Implement Token Expiry and Logout**
Ensure that tokens expire after a short period and automatically prompt the user to log out or refresh the token when it expires. In this app, the Refresh Token functionality is used to extend the session without requiring the user to log in again.


