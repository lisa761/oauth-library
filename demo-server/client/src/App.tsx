import { useState, useEffect } from 'react'
import { isLoggedIn, login, refreshToken, getUserInfo, logout, findScopes } from "./api";
import './App.css'

function App() {
  const [output, setOutput] = useState<string>('');
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    isLoggedIn().then((res) => setLoggedIn(res))
  }, [])

  useEffect(() => {
    if (loggedIn) {
      getUserInfo().then(res => setOutput(JSON.stringify(res.userInfo, null, 2)));
    }
  }, [loggedIn]);

  const handleLogin = async () => {
    await login();
  }

  const handleRefresh = () => {
    refreshToken().then(() => setOutput(output + '\nRefreshed Token'));
  }

  const handleLogout = () => {
    logout().then(() => setLoggedIn(false));
  }

  const handleFindScope = async () => {
    const { scopes } = await findScopes();
    console.log(scopes)
    setOutput(output + '\nScope Data: ' + scopes);
  }

  return (
    <>
      <h2>OAuth Server Demo</h2>
      <button onClick={handleLogin} disabled={loggedIn}>Login</button>
      <button onClick={handleRefresh} disabled={!loggedIn}>Refresh Token</button>
      <button onClick={handleLogout} disabled={!loggedIn}>Logout</button>
      <button onClick={handleFindScope} disabled={!loggedIn}>Find Scope</button>
      <pre>{output}</pre>
    </>
  )
}

export default App
