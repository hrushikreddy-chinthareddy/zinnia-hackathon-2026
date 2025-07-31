import { getAccessToken } from '@auth0/nextjs-auth0';
import { BannerAlert, BannerVariant, Button } from '@zinnia/bloom/components';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ParsedUrlQuery } from 'querystring';
import { useEffect, useState } from 'react';

import { ClientCasePaginator } from '@deps/components/client-case/client-case-list/paginator/client-case-paginator';
import ClientCaseSearchBar from '@deps/components/client-case/client-case-list/search-bar/client-case-search-bar';
import { ClientCaseTable } from '@deps/components/client-case/client-case-list/table/client-case-table';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { IllustrationsClientCaseProvider } from '@deps/contexts/illustrations/IllustrationsClientCaseContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserProfile } from '@deps/models/user-profile';
import {
    createClientCaseFromNewBusiness,
    searchClientCaseByEappId,
} from '@deps/queries/api/server/v1/client-cases';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    LoggingContext,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import styles from './illustrations.module.css';

type additionalDataProps = {
    user: UserProfile;
};

enum ErrorOrigin {
    ClientCase = 'client-case-manager-api',
    NewBusiness = 'new-business-api',
    partyReference = 'party-reference-api',
    producers = 'producers-api',
    Internal = 'internal-error',
}

type IllustrationsPageProps = {
    featureFlagDecisions: FeatureFlags;
    additionalData: additionalDataProps;
    fetchingErrorMessage: string;
    fetchingErrorOrigin: ErrorOrigin;
};

const NEW_CLIENT_CASE_URL = '/illustrations/client-cases/new';
const INTERNAL_ERROR_LABEL = 'We were unable to create this client case.';
const EXTERNAL_ERROR_LABEL =
    'We were unable to create the required client case due to external issues';

//This should be  just a red    ict page or maybe a redirect with urk params read and user/permision validation
export default function Illustrations({
    featureFlagDecisions,
    additionalData,
    fetchingErrorMessage,
    fetchingErrorOrigin,
}: IllustrationsPageProps) {
    const searchParams = useSearchParams();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const [bannerText, setBannerText] = useState('');

    const bannerBodyText = (
        <Typography
            variant={TypographyVariant.BodySm}
            className={styles.bannerText}
        >
            {bannerText}
        </Typography>
    );

    useEffect(() => {
        switch (fetchingErrorOrigin) {
            case ErrorOrigin.NewBusiness:
            case ErrorOrigin.partyReference:
            case ErrorOrigin.producers:
                if (fetchingErrorMessage) {
                    setBannerText(
                        `${EXTERNAL_ERROR_LABEL} - ${fetchingErrorMessage}`
                    );
                } else {
                    setBannerText(EXTERNAL_ERROR_LABEL);
                }
                break;
            case ErrorOrigin.ClientCase:
            case ErrorOrigin.Internal:
                setBannerText(INTERNAL_ERROR_LABEL);
                break;

            default:
                break;
        }
    }, [fetchingErrorMessage, fetchingErrorOrigin]);

    return (
        <>
            <IllustrationsClientCaseProvider>
                {bannerText !== '' && (
                    <BannerAlert
                        bodyText={bannerBodyText}
                        variant={BannerVariant.Error}
                        canDismiss
                        onDismiss={() => setBannerText('')}
                        className={styles.bannerWrapper}
                    />
                )}

                <div className="flex items-center justify-between">
                    <Typography
                        variant={TypographyVariant.H1}
                        className="md:mb-5 mb-4"
                    >
                        {t('illustrations')}
                    </Typography>
                    <Link
                        href={{
                            pathname: NEW_CLIENT_CASE_URL,
                            query: Object.fromEntries(searchParams),
                        }}
                        passHref
                    >
                        <Button
                            mode="link"
                            data-testid="new-client-case-btn"
                            aria-label={t('ariaLabel.search') as string}
                            type="button"
                            size="small"
                        >
                            {t('clientCase.newClientCase')}
                        </Button>
                    </Link>
                </div>
                <div className="mb-8">
                    <ClientCaseSearchBar />
                </div>
                <div>
                    <div className="mb-8">
                        <ClientCaseTable />
                    </div>
                    <ClientCasePaginator />
                </div>
            </IllustrationsClientCaseProvider>
        </>
    );
}

const getAuthToken = async (
    context: GetServerSidePropsContext,
    loggingContext: LoggingContext
) => {
    try {
        const { accessToken = '' } = await getAccessToken(
            context.req,
            context.res
        );
        return accessToken;
    } catch (e) {
        logWarn('getServerSidePropsPolicyDetailsPage::Access token expired', {
            ...parseErrorInformation(e),
            ...loggingContext,
        });
        return serverSidePropsLogout();
    }
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );

            if (
                !featureFlagDecisions?.[FEATURE_FLAGS.ILLUSTRATIONS_EXPERIENCE]
            ) {
                return {
                    redirect: {
                        destination: '/cases',
                        permanent: false,
                    },
                };
            }
            const { locale = DEFAULT_LOCALE } = context;
            const additionalData: additionalDataProps = { user: user };
            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON],
                nextI18nextConfig,
                ALL_LOCALES
            );

            const { eappid } = context.query as ParsedUrlQuery;
            const _eAppId = typeof eappid === 'string' ? eappid : '';

            if (_eAppId) {
                // Step 1: Search existing client cases if and eAppId is on the query string
                const getAuthTokenResponse = await getAuthToken(
                    context,
                    loggingContext
                );
                if (typeof getAuthTokenResponse !== 'string') {
                    return getAuthTokenResponse;
                }

                try {
                    const clientCases = await searchClientCaseByEappId(
                        _eAppId,
                        getAuthTokenResponse,
                        loggingContext
                    );
                    // Step 2: if a client case already exists, redirect to the client case
                    if (
                        clientCases &&
                        clientCases.length > 0 &&
                        clientCases[0].id
                    ) {
                        return {
                            redirect: {
                                destination: `/illustrations/client-cases/${clientCases[0].id}/illustrate`,
                                permanent: false,
                            },
                        };
                    } else {
                        // Step 3: if no client case exists, pull data from the new business API, create a new client case with the data then redirect
                        const newCaseResponse =
                            await createClientCaseFromNewBusiness(
                                _eAppId,
                                getAuthTokenResponse,
                                loggingContext
                            );
                        if (newCaseResponse) {
                            const { id, planCode } = newCaseResponse;
                            const baseRedirectionUrl = `/illustrations/client-cases/${id}/illustrate`;
                            const destination =
                                planCode !== ''
                                    ? `${baseRedirectionUrl}?planCode=${planCode}`
                                    : baseRedirectionUrl;
                            return {
                                redirect: {
                                    destination,
                                    permanent: false,
                                },
                            };
                        }
                    }
                } catch (error: any) {
                    return {
                        props: {
                            locale,
                            ...translations,
                            featureFlagDecisions,
                            additionalData,
                            fetchingErrorMessage: error.message,
                            fetchingErrorOrigin:
                                error.origin ?? 'internal-error',
                        },
                    };
                }
            }
            return {
                props: {
                    locale,
                    ...translations,
                    featureFlagDecisions,
                    additionalData,
                },
            };
        },
    },
    {
        file: 'illustrations',
        function: 'getServerSideProps',
        page: 'illustrations',
    }
);
