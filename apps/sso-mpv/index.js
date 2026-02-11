import express from 'express';
import dotenv from 'dotenv';
import { auth } from 'express-openid-connect';
import { getConnectionConfig } from './utils.js';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logging/logger.js';
import {
  initOptimizely,
  isFeatureEnabled,
  FEATURE_FLAGS,
} from './optimizely.js';

// Handles trailing slash
const router = express.Router({ strict: false });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlFiles = {
  root: path.join(__dirname, 'html'),
};

dotenv.config();

initOptimizely();

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

app.get('/', async (req, res) => {
  const redirectTo = req.query.redirectTo;
  try {
    const useDirectRedirect = await isFeatureEnabled(
      FEATURE_FLAGS.SSO_DIRECT_REDIRECT,
    );

    if (useDirectRedirect) {
      const connectionConfig = getConnectionConfig(req.query.connection);

      if (!connectionConfig) {
        throw new Error(
          `RouteError: '/', Unknown connection config when attempting to redirect through sso: ${req.query.connection}`,
        );
      }

      const protocol = connectionConfig.loginSuccessUrl.includes('local')
        ? 'http'
        : 'https';
      const baseUrl = `${protocol}://${connectionConfig.loginSuccessUrl}`;

      if (redirectTo) {
        return res.redirect(302, `${baseUrl}/${redirectTo}`);
      }

      return res.redirect(302, baseUrl);
    }

    // Existing auth flow (feature flag off)
    if (req.oidc.isAuthenticated()) {
      const connectionConfig = getConnectionConfig(req.query.connection);

      if (!connectionConfig) {
        throw new Error(
          `RouteError: '/', Unknown connection config when attempting to login through sso: ${req.query.connection}`,
        );
      }

      if (redirectTo) {
        return res.redirect(
          302,
          `${req.protocol}://${connectionConfig.loginSuccessUrl}/${redirectTo}`,
        );
      }

      return res.redirect(
        302,
        `${req.protocol}://${connectionConfig.loginSuccessUrl}`,
      );
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

      return res.redirect(302, loginRedirectUrl);
    }
  } catch (error) {
    logger.error(error.message);
    res.sendFile('error.html', htmlFiles);
  }
});

app.get('/login', (req, res) => {
  try {
    const connectionConfig = getConnectionConfig(req.query.connection);
    const redirectTo = req.query.redirectTo;

    if (!connectionConfig) {
      throw new Error(
        `Route Error: '/login', Unknown connection config when attempting to login through sso: ${req.query.connection}`,
      );
    }

    res.oidc.login({
      returnTo: redirectTo
        ? `${req.protocol}://${connectionConfig.loginSuccessUrl}/${redirectTo}`
        : `${req.protocol}://${connectionConfig.loginSuccessUrl}`,
      authorizationParams: {
        connection: req.query.connection,
        scope: connectionConfig.scope,
      },
    });
  } catch (error) {
    logger.error(error.message);
    res.sendFile('error.html', htmlFiles);
  }
});

app.get('/health', (_, res) => {
  res.status(200);
  res.send('ok');
});

// Global error handling middleware
app.use((err, res) => {
  logger.error(err.message);
  res.status(500).sendFile('error.html', htmlFiles);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
