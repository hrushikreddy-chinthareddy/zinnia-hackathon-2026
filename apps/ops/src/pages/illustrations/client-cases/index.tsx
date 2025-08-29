import { BannerAlert, BannerVariant, Button } from '@zinnia/bloom/components';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import { findAllAliasesWithSellingCode } from '@deps/components/client-case/client-case-create/create-client-case-form';
import { ClientCasePaginator } from '@deps/components/client-case/client-case-list/paginator/client-case-paginator';
import ClientCaseSearchBar from '@deps/components/client-case/client-case-list/search-bar/client-case-search-bar';
import { ClientCaseTable } from '@deps/components/client-case/client-case-list/table/client-case-table';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { IllustrationsClientCaseProvider } from '@deps/contexts/illustrations/IllustrationsClientCaseContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserProfile } from '@deps/models/user-profile';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { toLowerCaseSearchParams } from '@deps/utils/url';
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
    clientCase?: IllustrationsClientCase;
};

const NEW_CLIENT_CASE_URL = '/illustrations/client-cases/new';
const INTERNAL_ERROR_LABEL = 'We were unable to create this client case.';
const EXTERNAL_ERROR_LABEL =
    'We were unable to create the required client case due to external issues';

//This should be  just a red    ict page or maybe a redirect with urk params read and user/permision validation
export default function Illustrations({
    fetchingErrorMessage,
    fetchingErrorOrigin,
}: IllustrationsPageProps) {
    const searchParams = useSearchParams();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const [bannerText, setBannerText] = useState('');
    const { partyReferenceData } = usePermissionsContext();
    const aliases = findAllAliasesWithSellingCode(partyReferenceData);
    const isAgent = aliases.length > 0;

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

    const createClientCaseSearchParams = toLowerCaseSearchParams(searchParams);
    createClientCaseSearchParams.delete('eappid');

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

                {isAgent && (
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
                                query: createClientCaseSearchParams.toString(),
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
                )}
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

            const normalizedQuery = Object.fromEntries(
                Object.entries(context.query).map(([key, value]) => [
                    key.toLocaleLowerCase(),
                    value,
                ])
            );

            const eAppId = normalizedQuery?.eappid;
            const hasSingleEappId = eAppId && typeof eAppId === 'string';

            if (hasSingleEappId) {
                return {
                    redirect: {
                        destination: `/illustrations/client-cases/new?eappid=${eAppId}`,
                        permanent: false,
                    },
                };
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
