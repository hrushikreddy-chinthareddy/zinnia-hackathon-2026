import { getAccessToken } from '@auth0/nextjs-auth0';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CardInfo from '@deps/components/card/card-info/card-info';
import NoNavLayout from '@deps/components/no-nav-layout';
import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { UserPermission } from '@deps/models/user-profile';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

const Custom403Page = () => {
    const { t } = useTranslation();

    return (
        <NoNavLayout displayTopNavBar>
            <div className="flex h-[500px] w-full items-center justify-center rounded border-2 border-dashed border-semantic-warning bg-white shadow-sm">
                <CardInfo
                    icon={<ErrorIcon className="text-semantic-warning" height={50} width={50} />}
                    title={t('site.accessDenied.title')}
                    subtitle={t('site.accessDenied.message')}
                />
            </div>
        </NoNavLayout>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const { locale = DEFAULT_LOCALE, res, req, query } = context;
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('pages/403:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }
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
            permissions[UserPermission.AllowReadPolicyAdmin] = await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadPolicyAdmin
            );

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return { props: { locale, ...translations, permissions } };
        },
    },
    { file: '403', function: 'getServerSideProps', page: '403' }
);

export default Custom403Page;
