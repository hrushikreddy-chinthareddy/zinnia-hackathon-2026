import { getAccessToken } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getSelectedPolicyParty } from '@deps/helpers/party-info-helpers';
import { doesUserHavePagePermissions } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserPermission } from '@deps/models/user-profile';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { FgaRelation } from '@deps/types/fga';
import {
    logWarn,
    logError,
    parseErrorInformation,
    withPageAuthAndLogging,
    GetServerSidePropsWithLoggingContext,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

export const getServerSidePropsPolicyDetailsPage: GetServerSidePropsWithLoggingContext =
    async (context, loggingContext) => {
        const { locale = DEFAULT_LOCALE, params, req, res } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn(
                'getServerSidePropsPolicyDetailsPage::Access token expired',
                {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                }
            );
            return serverSidePropsLogout();
        }
        // Create a permissions object to pass to the page, strongly typed using the enum.
        const permissions = {
            [UserPermission.AllowReadPolicyAdmin]: false,
            [UserPermission.AllowEditPolicy]: false,
        };

        // We can use the enum to access the permissions object.
        permissions[UserPermission.AllowReadPolicyAdmin] =
            await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadPolicyAdmin,
                loggingContext
            );
        const isAdvisorsExcel = await checkTuplePage(
            context,
            FgaRelation.Party,
            AE_FGA_ROLE,
            loggingContext
        );

        // If they can't read Policy Admin there's no point in continuing. Redirect to 403 Forbidden.
        if (
            !isAdvisorsExcel &&
            !permissions[UserPermission.AllowReadPolicyAdmin]
        ) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        // We can use the enum to access the permissions object.
        permissions[UserPermission.AllowEditPolicy] =
            await doesUserHavePagePermissions(
                context,
                UserPermission.AllowEditPolicy,
                loggingContext
            );

        try {
            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );

            const policy = await getPolicyDetailsSsr(
                params?.id as string,
                params?.planCode as string,
                accessToken,
                loggingContext
            );

            if (!policy) {
                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }

            const selectedPolicyParty = getSelectedPolicyParty(
                policy,
                params?.personId
            );

            return {
                props: {
                    ...translations,
                    policy,
                    permissions,
                    ...(selectedPolicyParty && { selectedPolicyParty }),
                },
            };
        } catch (error) {
            logError('getServerSidePropsPolicyDetailsPage', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            return {
                props: {},
            };
        }
    };

export const getServerSideSubPageProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'getServerSideSubPageProps',
        function: 'getServerSideProps',
        page: 'getServerSideSubPageProps',
    }
);
