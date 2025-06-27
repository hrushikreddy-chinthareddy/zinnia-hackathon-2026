import { Claims } from '@auth0/nextjs-auth0';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';

import pino from '@deps/utils/pino-server';

import {
    MOCK_COOKIE_KEY,
    MOCK_ERROR_COOKIE_KEY,
} from './queries/api-utils/serverClientUtils';
import { isMockAllowed } from './utils/environment.helpers';

import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * or ending with:
         * - .svg
         */
        {
            source: '/((?!_next/(?:static|image)|favicon.ico).*(?<!.(?:svg|ttf|css))$)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};

const applyMockCookies = (req: NextRequest, res: NextResponse<unknown>) => {
    if (!isMockAllowed()) {
        return;
    }

    const mockParam = req.nextUrl.searchParams.get(MOCK_COOKIE_KEY);
    const mockErrorParam = req.nextUrl.searchParams.get(MOCK_ERROR_COOKIE_KEY);

    if (mockParam) {
        if (mockParam === 'off') {
            res.cookies.delete(MOCK_COOKIE_KEY);
        } else {
            res.cookies.set(MOCK_COOKIE_KEY, mockParam);
        }
    }

    if (mockErrorParam) {
        if (mockErrorParam === 'off') {
            res.cookies.delete(MOCK_ERROR_COOKIE_KEY);
        } else {
            res.cookies.set(MOCK_ERROR_COOKIE_KEY, mockErrorParam);
        }
    }
};

export default async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    let user = {} as Claims;
    try {
        const session = await getSession(request, response);
        user = session?.user ?? {};
    } catch (e) {
        pino.warn(
            {
                error: e,
                file: 'middleware',
                function: 'middleware',
            },
            'middleware::error getting session information'
        );
    }

    pino.trace(
        {
            file: 'middleware',
            function: 'middleware',
            url: request?.url,
            method: request?.method,
            partyId: user?.partyId,
            sessionId: user?.sid,
            userId: user?.sub,
            userName: user?.name,
        },
        'middleware::request received'
    );

    applyMockCookies(request, response);

    return response;
}
