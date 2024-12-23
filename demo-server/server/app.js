require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const oauthLib = require('../../oauth-lib.js');
const app = express();

app.use(cors({
  origin: process.env.ORIGIN_URL,
  credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    }
  })
);

const client = new oauthLib.OAuthClient(
  process.env.DOMAIN,
  process.env.CLIENT_ID,
  process.env.CALLBACK_URL,
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
    res.redirect(process.env.ORIGIN_URL);
  } catch (error) {
    console.error('Error during callback handling:', error);
    res.status(500).send('Failed to complete the OAuth flow.');
  }
});

app.get('/user', async (req, res) => {
  try {
    const userInfo = await oauthLib.getUserInfo(client, req.session.accessToken);
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
  req.session.destroy();
  const logoutUrl = oauthLib.logout(client, process.env.ORIGIN_URL);
  res.json({ logoutUrl });
});


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Express app running on http://localhost:${PORT}`);
});
