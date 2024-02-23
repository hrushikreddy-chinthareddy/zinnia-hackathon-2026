import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse) {
    // After login, redirect back to the welcome page and it will determine where the user should land based on the user's permissions.
    return await handleLogin(req, res, {
      returnTo: '/',
      authorizationParams: {
        scope: 'openid profile email offline_access',
        grant_type: 'authorization_code',
        audience: process.env.AUTH0_AUDIENCE,
      },
    });
  },
});

export { handler as GET, handler as POST };
