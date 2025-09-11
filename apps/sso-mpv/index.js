import express from 'express';
import dotenv from 'dotenv';
import { auth } from 'express-openid-connect';
import { getConnectionConfig } from './utils.js';
// Handles trailing slash
const router = express.Router({ strict: false });

dotenv.config();

const app = express();
const port = 3000;

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.JWT_SECRET,
  baseURL: process.env.AUTH0_CALLBACK_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  authorizationParams: {
    response_type: 'code',
    audience: process.env.AUTH0_AUDIENCE,
  },
  session: {
    cookie: {
      domain: process.env.AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW,
      sameSite: 'Lax',
      path: '/',
    },
  },
  routes: {
    login: false,
  },
};

app.use(auth(config), router);

app.get('/', (req, res) => {
  const redirectTo = req.query.redirectTo;

  // TODO: need to figure out how to handle this because `isAuthenticated` depends
  // on connection....
  if (req.oidc.isAuthenticated()) {
    const connectionConfig = getConnectionConfig(req.query.connection);

    if (redirectTo) {
      res.redirect(
        302,
        `${req.protocol}://${connectionConfig.loginSuccessUrl}/${redirectTo}`
      );
    }

    res.redirect(302, `${req.protocol}://${connectionConfig.loginSuccessUrl}`);
  } else {
    const prefix = '/login';
    const queryParams = new URLSearchParams();

    if (req.query.connection) {
      queryParams.set('connection', req.query.connection);
    }

    if (redirectTo) {
      queryParams.set('redirectTo', redirectTo);
    }

    const loginRedirectUrl = `${prefix}?${queryParams.toString()}`;

    res.redirect(302, loginRedirectUrl);
  }
});

app.get('/login', (req, res) => {
  const connectionConfig = getConnectionConfig(req.query.connection);
  const redirectTo = req.query.redirectTo;
  res.oidc.login({
    returnTo: redirectTo
      ? `${req.protocol}://${connectionConfig.loginSuccessUrl}/${redirectTo}`
      : `${req.protocol}://${connectionConfig.loginSuccessUrl}`,
    authorizationParams: {
      connection: req.query.connection,
      scope: connectionConfig.scope,
    },
  });
});

app.get('/health', (_, res) => {
  res.status(200);
  res.send('ok');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
