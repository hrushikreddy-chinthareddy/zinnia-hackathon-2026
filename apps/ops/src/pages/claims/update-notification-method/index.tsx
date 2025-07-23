import { getAccessToken } from '@auth0/nextjs-auth0';
import { Policy } from '@zinnia/api-types/types/sor';
import { Loader } from '@zinnia/bloom/components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import { NotificationsTransactionData } from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import { TranslationFiles } from '@deps/config/translations';
import UpdateNotificationMethodContainer from '@deps/containers/death-claim-container/update-notification-method/update-notification-method-container';
import { UpdateNotificationMethodProvider } from '@deps/contexts/UpdateNotificationMethodContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { DEFAULT_LOCALE, ALL_LOCALES } from '@deps/helpers/routing.helpers';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import {
    getPolicyDetailsSsr,
    searchPolicySSR,
} from '@deps/queries/api/policies';
import { getTransactionsByRecordId } from '@deps/queries/api/transactions';
import {
    logWarn,
    logError,
    parseErrorInformation,
    logInfo,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface UpdateNotificationMethodProps {
    recordId: string;
    policyNumber: string;
    carrier: string;
    policy: Policy;
}

const UpdateNotificationMethod = ({
    recordId,
    policyNumber,
    carrier,
    policy,
}: UpdateNotificationMethodProps) => {
    const [transactionData, setTransactionData] =
        useState<NotificationsTransactionData>(
            {} as NotificationsTransactionData
        );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async (recordId: string) => {
            setLoading(true);
            const transactionResponse = await getTransactionsByRecordId(
                recordId
            );
            if (transactionResponse) {
                setTransactionData(transactionResponse);
                setLoading(false);
            }
        };
        fetchTransactions(recordId);
    }, [recordId]);

    return (
        <>
            <UpdateNotificationMethodProvider>
                {loading ? (
                    <div className="flex justify-center items-center mt-24">
                        <Loader />
                    </div>
                ) : (
                    <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
                        <UpdateNotificationMethodContainer
                            transactionData={transactionData}
                            policy={policy}
                        />
                    </div>
                )}
            </UpdateNotificationMethodProvider>
        </>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);

            const { locale = DEFAULT_LOCALE, query, req, res } = context;
            const logCtx = {
                ...loggingContext,
                file: 'pages/claims/update-notification-method',
                function: 'getServerSideProps',
            };
            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('update-notification-method::Access token expired', {
                    ...logCtx,
                });
                return serverSidePropsLogout();
            }

            try {
                const translations = await serverSideTranslations(
                    locale,
                    [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                    nextI18nextConfig,
                    ALL_LOCALES
                );

                const response = await searchPolicySSR(
                    query.policyNumber as string,
                    [query.carrier as Carrier],
                    accessToken,
                    1,
                    0,
                    loggingContext
                );

                const planCode = response ? response[0]?.planCode : null;
                if (!planCode) {
                    logInfo(
                        'update-notification-method::id::Plan code not found',
                        loggingContext
                    );
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                            permanent: false,
                        },
                    };
                } else {
                    logInfo(
                        'update-notification-method:id::Plan code found',
                        loggingContext
                    );
                }

                const policy = await getPolicyDetailsSsr(
                    query.policyNumber as string,
                    planCode,
                    accessToken,
                    loggingContext,
                    true
                );

                if (!policy) {
                    return {
                        redirect: {
                            destination: '/404',
                            permanent: false,
                        },
                    };
                }

                return {
                    props: {
                        locale,
                        recordId: query.recordId,
                        policyNumber: query.policyNumber,
                        carrier: query.carrier,
                        policy,
                        ...translations,
                    },
                };
            } catch (error) {
                logError('update-notification-method::getServerSideProps', {
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
        file: 'claims/update-notification-method/index',
        function: 'getServerSideProps',
        page: 'update-notification-method',
    }
);

export default UpdateNotificationMethod;
