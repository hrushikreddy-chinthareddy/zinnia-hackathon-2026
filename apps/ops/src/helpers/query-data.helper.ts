import { getSession } from '@auth0/nextjs-auth0';
import { setCookie } from 'cookies-next';
import { IncomingMessage, ServerResponse } from 'http';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
// TODO: Look into this rule and why it exists https://nextjs.org/docs/messages/no-document-import-in-page
// eslint-disable-next-line @next/next/no-document-import-in-page
import { DocumentContext } from 'next/document';

import { UserPermission, UserProfile } from '@deps/models/user-profile';
import { listCarriersPage } from '@deps/queries/api/server/fga/listCarriers';
import { PRODUCTION_HOST_NAME } from '@deps/types/constants';
import { LoggingContext } from '@deps/utils/server-logging';

export const getInitialData = async (ctx: DocumentContext) => {
    const auth = await getSession(
        ctx.req as IncomingMessage | NextApiRequest,
        ctx.res as ServerResponse<IncomingMessage> | NextApiResponse<any>
    );
    const user = auth?.user as UserProfile;
    const company = getCompany(user);
    const isProd = ctx.req?.headers.host === PRODUCTION_HOST_NAME;

    if (!isProd && ctx.query.demouser) {
        setCookie('demouser', ctx.query.demouser, { res: ctx.res, req: ctx.req });
    }
    return { company };
};

export const getCompany = (user: UserProfile) => {
    const defaultTheme = 'zinnia';
    return user?.app_metadata?.company || defaultTheme;
};

export const getUserData = async (ctx: GetServerSidePropsContext) => {
    const auth = await getSession(
        ctx.req as IncomingMessage | NextApiRequest,
        ctx.res as ServerResponse<IncomingMessage> | NextApiResponse<any>
    );
    const user = auth?.user as UserProfile;

    return user;
};

export const doesUserHavePagePermissions = async (
    context: GetServerSidePropsContext,
    permission: UserPermission,
    loggingContext: LoggingContext,
    carrier: string | null = null
): Promise<boolean> => {
    const carriers = await listCarriersPage(context, permission, loggingContext);

    if (carriers.length > 0 && carrier === null) {
        return true;
    }
    if (carrier && carriers.includes(carrier)) {
        return true;
    }

    return false;
};
