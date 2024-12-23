# OAuth Library
This repository contains an OAuth client library and a React demo app that demonstrates how to integrate OAuth authentication using the authorization code flow. The OAuth client handles the authorization, token exchange, and refresh processes, while the React app allows users to login, refresh tokens, and logout.

## Table of Contents
1. [OAuth Client Library](#oauth-client-library)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Demo](#demo)
5. [Security Considerations](#security-considerations)

---

## OAuth Client Library

The `OAuthClient` class helps handle OAuth flows, including:
- **Authorization flow**: Initiates the OAuth flow and generates an authorization URL.
- **Token exchange**: Exchanges the authorization code for an access token.
- **Token refresh**: Refreshes the access token using a refresh token.
- **User info retrieval**: Fetches user information using the access token.
- **Logout**: Logs the user out by redirecting to the OAuth provider's logout URL.

### Methods:

- **`startAuthFlow(client) => returns authUrl`**: Initiates the OAuth authorization flow by generating an authorization URL with the necessary parameters (client ID, scope, redirect URI, state).

- **`handleCallback(client, callbackParams) => returns access token`**: Handles the OAuth callback by verifying the state and exchanging the authorization code for tokens.
- **`refreshToken(client, refreshToken) => returns new token`**: Refreshes the access token using the provided refresh token.
- **`getUserInfo(client, accessToken) => returns user info json`**: Retrieves user information using the access token.
- **`logout(client, returnToUrl)`**: Logs the user out by redirecting to the OAuth provider's logout URL.

---

## Installation
To set up the project, follow these steps:

### 1. Clone the repository:
```bash
git clone https://github.com/lisa761/oauth-library.git
cd oauth-library
```

### 2. Install dependencies:
```bash
npm install
```

---

## Configuration
You need to configure the OAuth client with your provider’s credentials. Set the following environment variables in the .env file or using your build system:

### Browser Apps
We will be using Vite as an example React App.
- `VITE_DOMAIN`: The OAuth provider’s domain.
- `VITE_CLIENT_ID`: The client ID for your application.

### Server Apps
- `DOMAIN`: The OAuth provider’s domain (e.g., example.com).
- `CLIENT_ID`: The client ID for your application.
- `CLIENT_SECRET`: The client secret.

For example:
```bash
DOMAIN=example.com
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
```

---

## Demo
The demo apps provide a simple UI:
- Initiate the OAuth login flow.
- Handle the OAuth callback, exchange the authorization code for tokens, and fetch user info.
- Refresh the access token using the refresh token.
- Logout from the OAuth provider.

### 1. Components:
- **Login Button**: Starts the OAuth login flow by redirecting the user to the authorization URL.
- **Refresh Token Button**: Refreshes the access token using the refresh token.
- **Logout Button**: Logs the user out and redirects to the OAuth provider’s logout URL.
- **Output Display**: Shows the fetched user info or any errors encountered during the process.

### 2. Running the Demo
#### Browser App
```bash
cd demo-browser
npm install
npm run dev
```

#### Server App
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

## Security Considerations
- **State Parameter**: The state parameter is used to prevent CSRF attacks. Always validate the state received in the OAuth callback to ensure it matches the one you initially sent.
- **Token Storage**: Store sensitive tokens (such as access and refresh tokens) securely. Avoid storing them in places vulnerable to XSS attacks, like localStorage. Instead, consider using secure cookies or session storage.
- **HTTPS**: Ensure that all communication with your OAuth provider and token endpoints is done over HTTPS to protect sensitive data from being intercepted.
