import { FC, useRef, useState, useEffect } from 'react'
import {
  OAuthClient,
  startAuthFlow,
  handleCallback,
  refreshToken,
  getUserInfo,
  logout,
} from '../../oauth-lib';
import './App.css'

const App: FC = () => {
  const client = useRef<any>(
    new OAuthClient(
      import.meta.env.VITE_DOMAIN,
      import.meta.env.VITE_CLIENT_ID,
      window.location.origin,
    )
  );
  const [output, setOutput] = useState<string>('');
  const refreshTokenValue = useRef<any>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const processCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    try {
      const tokens = await handleCallback(client.current, { code, state });
      const userInfo = await getUserInfo(client.current, tokens.access_token);

      setOutput(JSON.stringify(userInfo, null, 2))
      refreshTokenValue.current = tokens.refresh_token;
      setLoggedIn(true);
      window.history.replaceState({}, document.title, client.current.redirectUri)
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    }
  }

  useEffect(() => {
    // Automatically handle login if redirected back with a code
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code') && urlParams.get('state')) {
      processCallback();
    }
  }, []);

  const handleLogin = async () => {
    const authUrl = await startAuthFlow(client.current);
    window.location.href = authUrl;
  }

  const handleRefresh = async () => {
    try {
      const tokens = await refreshToken(client.current, refreshTokenValue.current);
      refreshTokenValue.current = tokens.refresh_token;
      setOutput(output + '\nRefreshed Token');
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    }
  }

  const handleLogout = () => {
    refreshTokenValue.current = null;
    setLoggedIn(false);
    window.location.href = logout(client.current, window.location.origin);
    setOutput('');
  }

  return (
    <>
      <h2>OAuth Browser Demo</h2>
      <button id="login-btn" onClick={handleLogin} disabled={loggedIn}>Login</button>
      <button id="refresh-btn" onClick={handleRefresh} disabled={!loggedIn}>Refresh Token</button>
      <button id="logout-btn" onClick={handleLogout} disabled={!loggedIn}>Logout</button>
      <pre id="output">{output}</pre>
    </>
  )
}

export default App
