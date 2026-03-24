import {
    handleAuth,
    handleCallback,
    handleLogin,
    handleLogout,
} from '@auth0/nextjs-auth0';
import { deleteCookie, setCookie } from 'cookies-next';
import { decodeJwt } from 'jose';

import { PERMISSIONS_COOKIE_NAME } from '@deps/types/permissionsCookie';
import {
    buildNextApiLoggingContext,
    LoggingContext,
    logTrace,
    parseErrorInformation,
} from '@deps/utils/server-logging';
import { getRole } from '@deps/utils/theme';

export default handleAuth({
    async login(req, res) {
        const logCtx = await buildNextApiLoggingContext(req, res);
        const loggingContext = {
            ...logCtx,
            file: '[...auth0]',
            function: 'login',
        } as LoggingContext;

        // Most of the time carrierRole will be set based on the `connection` value from the query params
        // The below is more specific to vercel training environments.
        // We set it here, but this can be overridden by the connection query param below.
        const carrierRole = process.env.CARRIER_ROLE;
        if (carrierRole) {
            setCookie('role', carrierRole, {
                req,
                res,
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
                sameSite: 'lax',
            });

            logTrace('Set role cookie from env', {
                ...loggingContext,
                role: carrierRole,
            });
        }

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

        // If a connectionName is provided, use it to attempt a client-specific login
        if (connectionName) {
            logTrace('Silent login with connection', {
                ...loggingContext,
                connection: connectionName,
            });
            await handleLogin(req, res, {
                returnTo: '/',
                authorizationParams: {
                    scope: 'openid profile email offline_access',
                    connection: connectionName,
                    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
                },
            });
        } else {
            // No client connection specified → default Zinnia login flow
            logTrace('Standard login', loggingContext);

            await handleLogin(req, res, {
                returnTo: '/',
                authorizationParams: {
                    scope: 'openid profile email offline_access',
                    grant_type: 'password',
                    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
                },
            });
        }
    },
    // if there's a problem with the silent login flow, redirect to the landing page so a user can try to authenticate again
    async callback(req, res) {
        const logCtx = await buildNextApiLoggingContext(req, res);
        const loggingContext = {
            ...logCtx,
            file: '[...auth0]',
            function: 'callback',
        } as LoggingContext;
        logTrace('callback ', loggingContext);

        try {
            await handleCallback(req, res, {
                // We dont need idToken or the permissions object in the cookie.
                // Too reduce the size of the Auth0 Cookie, we can just remove these values.
                // See: https://github.com/auth0/nextjs-auth0/issues/289#issuecomment-778229748
                afterCallback(req, res, session) {
                    if (session?.accessToken) {
                        const claims = decodeJwt(session.accessToken);
                        if (
                            typeof claims.sourceConnection === 'string' &&
                            !!claims.sourceConnection
                        ) {
                            logTrace('afterCallback::setting role cookie', {
                                ...loggingContext,
                                sourceConnection: claims.sourceConnection,
                                role: getRole(claims.sourceConnection),
                            });
                            setCookie(
                                'role',
                                getRole(claims.sourceConnection),
                                {
                                    req,
                                    res,
                                    maxAge: 60 * 60 * 24 * 30, // 30 days
                                    path: '/',
                                    sameSite: 'lax',
                                }
                            );
                        }
                    }
                    const permissionsKey = `${process.env.NEXT_PUBLIC_SE2_BACKEND_URL}/permissions`;
                    Object.assign(session.user, {
                        [permissionsKey]: undefined,
                    });

                    session.idToken = undefined;

                    return session;
                },
            });
        } catch (e) {
            logTrace('Callback failed.  Redirecting to login', {
                ...loggingContext,
                ...parseErrorInformation(e),
            });
            res.redirect('/');
        }
    },

    async logout(req, res) {
        deleteCookie('role', { req, res });

        const baseUrl = process.env.AUTH0_BASE_URL;
        const returnTo = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

        await handleLogout(req, res, { returnTo });
    },
});
