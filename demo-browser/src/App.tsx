import { FC, useRef, useState, useEffect } from 'react'
import {
  OAuthClient,
  startAuthFlow,
  handleCallback,
  refreshToken,
  getUserInfo,
  logout,
  findScopes,
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
  const accessTokenValue = useRef<any>(null);
  const refreshTokenValue = useRef<any>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const processCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    try {
      const tokens = await handleCallback(client.current, { code, state });
      const userInfo = await getUserInfo(client.current, tokens.access_token);
      accessTokenValue.current = tokens.access_token;
      refreshTokenValue.current = tokens.refresh_token;

      setOutput(JSON.stringify(userInfo, null, 2));
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
      accessTokenValue.current = tokens.access_token;
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

  const handleFindScope = async () => {
    const scopeData = await findScopes(client.current, accessTokenValue.current);
    setOutput(output + '\nScope Data: ' + scopeData);
  }

  return (
    <>
      <h2>OAuth Browser Demo</h2>
      <button onClick={handleLogin} disabled={loggedIn}>Login</button>
      <button onClick={handleRefresh} disabled={!loggedIn}>Refresh Token</button>
      <button onClick={handleLogout} disabled={!loggedIn}>Logout</button>
      <button onClick={handleFindScope} disabled={!loggedIn}>Find Scope</button>
      <pre>{output}</pre>
    </>
  )
}

export default App
