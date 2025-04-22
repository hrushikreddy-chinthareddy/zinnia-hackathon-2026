import { handleAuth, handleCallback, handleLogin } from '@auth0/nextjs-auth0';
import { deleteCookie } from 'cookies-next';

import { PERMISSIONS_COOKIE_NAME } from '@deps/types/permissionsCookie';
import { buildNextApiLoggingContext, LoggingContext, logTrace, parseErrorInformation } from '@deps/utils/server-logging';

export default handleAuth({
    async login(req, res) {
        const logCtx = await buildNextApiLoggingContext(req, res);
        const loggingContext = { ...logCtx, file: '[...auth0]', function: 'login' } as LoggingContext;
        // remove the "broken" cookie for now
        // setCookie(PERMISSIONS_COOKIE_NAME, DEFAULT_PERMISSIONS_COOKIE, {
        //     req,
        //     res,
        //     maxAge: 60 * 60 * 24,
        //     path: '/',
        //     secure: isHttpsEnvironment(),
        // });
        deleteCookie(PERMISSIONS_COOKIE_NAME, { req, res });

        let connectionName: string | null = null;
        // attempt to grab a connection from the query params
        // if it exists, remove it and use it to attempt a login
        try {
            const returnTo = decodeURIComponent(req?.query?.returnTo as string);
            const queryString = returnTo?.split('?')?.[1];
            const params = new URLSearchParams(queryString);
            connectionName = params.get('connection');
            if (connectionName) {
                let modifiedReturnTo = returnTo?.split('?')?.[0];
                params.delete('connection');
                if (params.toString()?.length) {
                    modifiedReturnTo += `?${params.toString()}`;
                }
                req.query.returnTo = modifiedReturnTo.toString();
            }
        } catch (e) {
            logTrace('login - no connection id', {
                ...loggingContext,
                ...parseErrorInformation(e),
                file: 'auth/[...auth0]',
                function: 'login',
            });
        }

        // If a connectionName is provided, use it to try to authenticate
        // A failed authentication will redirect to the login page without the connectionName via the callback method
        if (connectionName) {
            logTrace('Silent login', loggingContext);
            await handleLogin(req, res, {
                returnTo: '/',
                authorizationParams: {
                    scope: 'openid profile email offline_access',
                    connection: connectionName,
                    audience: process.env.NEXT_PUBLIC_SE2_BACKEND_URL,
                },
            });
        } else {
            // Standard login flow
            logTrace('Standard login', loggingContext);
            await handleLogin(req, res, {
                returnTo: '/',
                authorizationParams: {
                    scope: 'openid profile email offline_access',
                    grant_type: 'password',
                    audience: process.env.NEXT_PUBLIC_SE2_BACKEND_URL,
                },
            });
        }
    },
    // if there's a problem with the silent login flow, redirect to the landing page so a user can try to authenticate again
    async callback(req, res) {
        const logCtx = await buildNextApiLoggingContext(req, res);
        const loggingContext = { ...logCtx, file: '[...auth0]', function: 'callback' } as LoggingContext;
        logTrace('callback ', loggingContext);
        try {
            await handleCallback(req, res, {
                // We dont need idToken or the permissions object in the cookie.
                // Too reduce the size of the Auth0 Cookie, we can just remove these values.
                // See: https://github.com/auth0/nextjs-auth0/issues/289#issuecomment-778229748
                afterCallback(req, res, session) {
                    const permissionsKey = `${process.env.NEXT_PUBLIC_SE2_BACKEND_URL}/permissions`;
                    Object.assign(session.user, {
                        [permissionsKey]: undefined,
                    });

                    session.idToken = undefined;

                    return session;
                },
            });
        } catch (e) {
            logTrace('Callback failed.  Redirecting to login', { ...loggingContext, ...parseErrorInformation(e) });
            res.redirect('/');
        }
    },
});
