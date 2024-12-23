require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const oauthLib = require('../../oauth-lib.js');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const client = new oauthLib.OAuthClient(
  process.env.DOMAIN,
  process.env.CLIENT_ID,
  'http://localhost:3000/callback',
  process.env.CLIENT_SECRET,
);

let accessToken = null;
let refreshToken = null;
let userInfo = null;

app.get('/', (req, res) => {
  if (userInfo) {
    res.send(`
      <h2>Welcome, ${userInfo.name}!</h2>
      <pre>${JSON.stringify(userInfo, null, 2)}</pre>
      <pre>${refreshToken}</pre>
      <a href="/refresh">Refresh</a>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h2>OAuth Demo</h2>
      <a href="/login">Login</a>
    `);
  }
});

app.get('/login', (req, res) => {
  const authUrl = oauthLib.startAuthFlow(client);
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    const tokenResponse = await oauthLib.handleCallback(client, { code, state });
    accessToken = tokenResponse.access_token;
    refreshToken = tokenResponse.refresh_token;
    userInfo = await oauthLib.getUserInfo(client, accessToken);
    res.redirect('/');
  } catch (error) {
    console.error('Error during callback handling:', error);
    res.status(500).send('Failed to complete the OAuth flow.');
  }
});

app.get('/refresh', async (req, res) => {
  const tokens = await oauthLib.refreshToken(client, refreshToken);
  refreshToken = tokens.refresh_token;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  accessToken = null;
  refreshToken = null;
  userInfo = null;
  const logoutUrl = oauthLib.logout(client, 'http://localhost:3000/');
  res.redirect(logoutUrl);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express app running on http://localhost:${PORT}`);
});
