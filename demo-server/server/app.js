require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const session = require("express-session");
const oauthLib = require('../../oauth-lib.js');
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

const client = new oauthLib.OAuthClient(
  process.env.DOMAIN,
  process.env.CLIENT_ID,
  'http://localhost:4000/callback',
  process.env.CLIENT_SECRET,
);

app.get('/login', (req, res) => {
  const authUrl = oauthLib.startAuthFlow(client);
  res.json({ authUrl });
});

app.get('/auth/check', (req, res) => {
  res.json({ loggedIn: req.session.accessToken != null });
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    const tokenResponse = await oauthLib.handleCallback(client, { code, state });
    req.session.accessToken = tokenResponse.access_token;
    req.session.refreshToken = tokenResponse.refresh_token;
    res.redirect('http://localhost:3000/');
  } catch (error) {
    console.error('Error during callback handling:', error);
    res.status(500).send('Failed to complete the OAuth flow.');
  }
});

app.get('/user', async (req, res) => {
  try {
    userInfo = await oauthLib.getUserInfo(client, req.session.accessToken);
    res.json({ userInfo })
  } catch (error) {
    console.error('Error during fetching users:', error);
  }
});

app.get('/refresh', async (req, res) => {
  const tokens = await oauthLib.refreshToken(client, req.session.refreshToken);
  req.session.refreshToken = tokens.refresh_token;
  res.json({})
});

app.get('/logout', (req, res) => {
  req.session.accessToken = null;
  req.session.refreshToken = null;
  const logoutUrl = oauthLib.logout(client, 'http://localhost:3000/');
  res.json({ logoutUrl });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Express app running on http://localhost:${PORT}`);
});
