import {
  Session,
  handleAuth,
  handleLogin,
  handleCallback,
  handleLogout,
} from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { cookies } from 'next/headers';

import {
  MAX_AGE_SESSION_COOKIE,
  REDIRECT_TO_SESSION_COOKIE_KEY,
} from '@/utils/serverClientUtils';

const afterCallback = (_: NextApiRequest, session: Session) => {
  const cookieStore = cookies();
  cookieStore.set(REDIRECT_TO_SESSION_COOKIE_KEY, 'true', {
    maxAge: MAX_AGE_SESSION_COOKIE,
  });
  return session;
};

const handler = handleAuth({
  // @ts-expect-error auth0 types and documentation are incorrect
  callback: handleCallback({ afterCallback }),
  logout: async (req: NextApiRequest, res: NextApiResponse) => {
    const cookieStore = cookies();
    cookieStore.delete(REDIRECT_TO_SESSION_COOKIE_KEY);
    return handleLogout(req, res);
  },
  async login(req: NextApiRequest, res: NextApiResponse) {
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
