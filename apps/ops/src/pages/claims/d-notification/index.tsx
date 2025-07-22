import { getAccessToken } from '@auth0/nextjs-auth0';
import { Policy } from '@zinnia/api-types/types/sor';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import DeathClaimContainer from '@deps/containers/death-claim-container/death-claim-container';
import { DeathClaimProvider } from '@deps/contexts/DeathClaimContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { initialDeathClaimExistsSsr } from '@deps/queries/api/web-non-financial';
import {
    logWarn,
    logError,
    parseErrorInformation,
    logInfo,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface DeathClaimNotificationProps {
    policy: Policy;
}

const DeathClaimNotification = ({ policy }: DeathClaimNotificationProps) => {
    return (
        <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
            <DeathClaimProvider>
                <DeathClaimContainer policy={policy} />
            </DeathClaimProvider>
        </div>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);

            const { locale = DEFAULT_LOCALE, query, req, res } = context;
            const planCode = (query.planCode as string) || '';
            const policyNumber = (query.policyNumber as string) || '';
            const logCtx = {
                ...loggingContext,
                file: 'pages/claims/d-notification',
                function: 'getServerSideProps',
                inputs: { policyNumber, planCode },
            };
            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('d-notification::Access token expired', { ...logCtx });
                return serverSidePropsLogout();
            }

            try {
                const translations = await serverSideTranslations(
                    locale,
                    [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                    nextI18nextConfig,
                    ALL_LOCALES
                );

                const policy = await getPolicyDetailsSsr(
                    policyNumber,
                    planCode,
                    accessToken,
                    loggingContext,
                    true
                );
                if (!policy) {
                    logInfo('d-notification::Policy not found', { ...logCtx });
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                            permanent: false,
                        },
                    };
                }

                logInfo('d-notification::Policy found', { ...logCtx });

                const response = await initialDeathClaimExistsSsr(
                    policy?.policyNumber,
                    policy?.carrierId,
                    accessToken,
                    loggingContext
                );
                logInfo('d-notification::Checked claim existence', {
                    ...logCtx,
                    ...response,
                });

                if (response.isNewRequest === false) {
                    return {
                        redirect: {
                            destination: response?.zlCaseId
                                ? `/cases/${response?.zlCaseId}/progress`
                                : '/policies',
                            permanent: false,
                        },
                    };
                } else {
                    return {
                        props: {
                            ...translations,
                            policy,
                            user,
                        },
                    };
                }
            } catch (error) {
                logError('d-notification::getServerSideProps', {
                    ...parseErrorInformation(error),
                    ...logCtx,
                });
                return {
                    props: {},
                };
            }
        },
    },
    {
        file: 'claims/d-notification/index',
        function: 'getServerSideProps',
        page: 'd-notification',
    }
);

export default DeathClaimNotification;
