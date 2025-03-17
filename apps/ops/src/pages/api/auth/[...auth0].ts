import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { deleteCookie } from 'cookies-next';

import { PERMISSIONS_COOKIE_NAME } from '@deps/types/permissionsCookie';

export default handleAuth({
    async login(req, res) {
        // setCookie(PERMISSIONS_COOKIE_NAME, DEFAULT_PERMISSIONS_COOKIE, {
        //     req,
        //     res,
        //     maxAge: 60 * 60 * 24,
        //     path: '/',
        //     secure: isHttpsEnvironment(),
        // });
        deleteCookie(PERMISSIONS_COOKIE_NAME, { req, res });
        // After login, redirect back to the welcome page and it will determine where the user should land based on the user's permissions.
        await handleLogin(req, res, {
            returnTo: '/',
            authorizationParams: {
                scope: 'openid profile email offline_access',
                grant_type: 'password',
                audience: process.env.NEXT_PUBLIC_SE2_BACKEND_URL,
            },
        });
    },
});
