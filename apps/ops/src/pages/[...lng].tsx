import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { UserPermission } from '@deps/models/user-profile';
import Error from '@deps/pages/404s';
import { logWarn, parseErrorInformation, logInfo } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

// THIS IS THE 404 page. This allows us to include translations and server-side funtionality
// to a page that is usually statically generated.
const CatchAllPage = () => {
    return <Error />;
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async context => {
        const { locale = DEFAULT_LOCALE, req, res } = context;
        try {
            (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('pages/[...lng]:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'pages/[...lng]',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const fullPath = context.req.url;
        logInfo('Accessed non-existent page', { originalPath: fullPath });
        // Create a permissions object to pass to the page, strongly typed using the enum.
        const permissions = {
            [UserPermission.AllowReadCaseManagement]: false,
            [UserPermission.AllowReadPolicyAdmin]: false,
        };

        // We can use the enum to access the permissions object.
        permissions[UserPermission.AllowReadCaseManagement] = await doesUserHavePagePermissions(
            context,
            UserPermission.AllowReadCaseManagement
        );
        permissions[UserPermission.AllowReadPolicyAdmin] = await doesUserHavePagePermissions(context, UserPermission.AllowReadPolicyAdmin);

        const translations = await serverSideTranslations(
            locale,
            [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
            nextI18nextConfig,
            ALL_LOCALES
        );

        return { props: { locale, ...translations, permissions } };
    },
});

export default CatchAllPage;
