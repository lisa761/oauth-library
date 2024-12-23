# Server Demo App using React and Express
This React app uses the **OAuth client library** for OAuth authentication. The app allows users to log in using OAuth, retrieve their access tokens, refresh tokens, and fetch user information from the OAuth provider.

The OAuth client library abstracts the core logic of handling OAuth authentication flows, ensuring that the app focuses on the UI and user experience.

## Run the App
```bash
cd demo-server
```

**1. Run the Server**
```bash
cd server
npm install
npm start
```

**2. Run the Client**
```bash
cd client
npm install
npm run dev
```

<img width="1342" alt="Screenshot 2024-12-23 at 4 26 56 PM" src="https://github.com/user-attachments/assets/51ba1ffe-46b4-434e-b531-6fc477a5ae01" />

---

## Key Functions from oauth-lib

The app uses several functions from the OAuth client library (../../oauth-lib) to manage OAuth flow:

### 1. OAuthClient (Constructor)
This is the main class that holds the configuration for the OAuth client. It is instantiated with:

- `domain`: The OAuth provider's domain.
- `clientId`: The client ID from the OAuth provider.
- `redirectUri`: The URL where the OAuth provider will redirect after successful authentication.
- `clientSecret`: The client secret.

**Usage**
```typescript
const client = new oauthLib.OAuthClient(
  process.env.DOMAIN,
  process.env.CLIENT_ID,
  'http://localhost:4000/callback',
  process.env.CLIENT_SECRET,
);
```

### 2. startAuthFlow(client)
This function starts the OAuth authorization flow by generating the authorization URL. It appends the necessary query parameters (like response_type, client_id, redirect_uri, scope, and state) to the URL and returns the complete URL.

**Usage:**
```typescript
app.get('/login', (req, res) => {
  const authUrl = oauthLib.startAuthFlow(client);
  res.json({ authUrl });
});
```

### 3. handleCallback(client, callbackParams)
This function handles the OAuth callback by verifying the state parameter and exchanging the code for an access token and refresh token. If successful, it returns the token response from the OAuth provider.

**Usage:**
```typescript
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    const tokenResponse = await oauthLib.handleCallback(client, { code, state });
    req.session.accessToken = tokenResponse.access_token;
    req.session.refreshToken = tokenResponse.refresh_token;
    ...
  } catch (error) {
    ...
  }
});
```

### 4. getUserInfo(client, accessToken)
This function retrieves the user's information from the OAuth provider using the provided access_token.

**Usage:**
```typescript
app.get('/user', async (req, res) => {
  try {
    const userInfo = await oauthLib.getUserInfo(client, req.session.accessToken);
    ...
  } catch (error) {
    ...
  }
});
```

### 5. refreshToken(client, refreshToken)
This function is used to refresh the access token when it expires. It takes the refresh token and the OAuth client and returns the new access token and refresh token.

**Usage:**
```typescript
app.get('/refresh', async (req, res) => {
  const tokens = await oauthLib.refreshToken(client, req.session.refreshToken);
  req.session.refreshToken = tokens.refresh_token;
});
```

### 6. logout(client, returnToUrl)
This function generates the URL to log the user out from the OAuth provider. It redirects the user to the provider’s logout page, optionally returning the user to a specified URL after logging out.

**Usage:**
```typescript
app.get('/logout', (req, res) => {
  req.session.accessToken = null;
  req.session.refreshToken = null;
  const logoutUrl = oauthLib.logout(client, 'http://localhost:3000/');
  res.json({ logoutUrl });
});
```

---

## Security Considerations
When using OAuth in a server-side application, storing sensitive information like access tokens, refresh tokens, and other credentials requires careful attention to security to prevent unauthorized access or potential attacks. Below are some important considerations for securely storing values when using the OAuth library in a server-side environment:

## 1. Storing OAuth Tokens Securely
When dealing with OAuth, two primary types of tokens need to be handled securely:

- **Access Tokens**: These tokens are used to authenticate API requests on behalf of the user. They should have a short lifespan and be stored securely.
- **Refresh Tokens**: These tokens are used to obtain new access tokens once they expire. They are typically long-lived and should be handled with even more care since they can be used to request new access tokens.

### Use Secure Storage Mechanisms
For server-side applications, tokens should never be stored in places that are easily accessible or exposed to the client. Here are some secure storage recommendations:

- **Encrypted Database**: Store tokens in a secure database with encryption both at rest and in transit. The encryption should follow industry best practices (e.g., AES-256 for encryption, TLS 1.2 or higher for data in transit). Ensure that the encryption keys themselves are stored in a secure environment, such as a hardware security module (HSM) or a key management service (KMS).

- **Environment Variables**: For sensitive application-level secrets like the client_secret, these should never be hardcoded in your source code. Use environment variables to store sensitive data securely. Tools like Docker, Kubernetes, and other configuration management systems allow you to set environment variables securely.

### Session Management
For storing OAuth tokens during the session:

- **HTTP-only, Secure Cookies**: Store access tokens or session identifiers in HTTP-only cookies, which help prevent XSS attacks. The HttpOnly flag ensures that the token cannot be accessed through JavaScript, reducing the risk of client-side attacks. Additionally, use the Secure flag to ensure that the cookie is only sent over HTTPS connections. For example:

```typescript
res.cookie('access_token', token, { 
  httpOnly: true, 
  secure: true, // Ensures cookie is only sent over HTTPS
  sameSite: 'Strict', // Prevents CSRF attacks
  maxAge: 3600000 // Token expiration time
});
```
- **Session Stores**: In server-side applications, tokens should ideally be stored in a session store (e.g., Redis) along with any session-related data. Session stores should be securely configured with expiration times for the sessions to ensure that old tokens are not stored indefinitely.

## 2. Avoid Storing Sensitive Tokens in Client-Side Storage
While this may not directly apply to server-side applications, it's important to emphasize that sensitive data like access tokens and refresh tokens should never be stored in client-side storage such as localStorage, sessionStorage, or cookies (without proper security measures) when handling the OAuth flow on the frontend. Storing tokens in these places can expose them to potential Cross-Site Scripting (XSS) attacks.

