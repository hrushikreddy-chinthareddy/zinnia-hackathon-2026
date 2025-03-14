require('@dotenvx/dotenvx').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');
const { decodeJwt } = require('jose');
const app = express();

let accessToken = null;

const corsOptions = {
  origin: function (origin, callback) {
    const vercelAppRegex = /\.vercel\.app$/;
    const localhostRegex = /^http:\/\/localhost(:\d+)?$/;

    if (localhostRegex.test(origin) || vercelAppRegex.test(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
};
// Enable CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight requests for all routes
// app.use(express.json());
// Serve static files from the dist folder
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Proxy configuration
const target = process.env.API_URL;
const changeOrigin = true;
const proxyOptions = {
  target,
  changeOrigin,
  on: {
    proxyReq: (proxyReq, req, res) => {
      /* handle proxyReq */
      console.log('Proxy request made to:', req.url);
    },
    proxyRes: (proxyRes, req, res) => {
      /* handle proxyRes */
      console.log('Proxy response received from:', req.url);
    },
    error: (err, req, res) => {
      /* handle error */
    },
  },
  pathRewrite: { '^/proxy': '' },
};

const proxy = createProxyMiddleware(proxyOptions);

// Use the proxy for API calls
app.use('/proxy', proxy);

const getToken = async (email) => {
  // if (accessToken) {
  //   try {
  //     const payload = decodeJwt(accessToken);

  //     if (payload.exp * 1000 > Date.now()) {
  //       console.log('Token is still valid');
  //       return accessToken;
  //     }
  //   } catch (error) {
  //     console.error('Error verifying token:', error);
  //   }
  // }

  try {
    console.log('Fetching new token');
    const response = await fetch(`${process.env.LOGIN_API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: process.env.GRANT_TYPE,
        audience: process.env.AUDIENCE,
        email,
      }),
    });
    console.log('response', response);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    accessToken = data.access_token;

    return accessToken;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

app.get('/api/token', function (req, res) {
  const email = req.query.email;

  getToken(email)
    .then((token) => {
      res.json({ token });
    })
    .catch((error) => {
      console.error('Error fetching token:', error);
      res.status(500).json({ error: 'Error fetching token' });
    });
});

app.get('/api/health', function (_, res) {
  res.status(200).json({ status: 'ok' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Proxy server listening on port: ${port}`);
  console.log(`Serving static files from: ${distPath}`);
});