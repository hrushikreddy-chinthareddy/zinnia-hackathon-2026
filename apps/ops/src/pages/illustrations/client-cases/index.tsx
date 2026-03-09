import { useIsFetching } from '@tanstack/react-query';
import { BannerAlert, BannerVariant, Button } from '@zinnia/bloom/components';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Jsonify } from 'type-fest';

import { ClientCasePaginator } from '@deps/components/client-case/client-case-list/paginator/client-case-paginator';
import ClientCaseSearchBar from '@deps/components/client-case/client-case-list/search-bar/client-case-search-bar';
import { ClientCaseTable } from '@deps/components/client-case/client-case-list/table/client-case-table';
import { useIllustrationAnalytics } from '@deps/components/illustrations/helpers/hooks/use-illustration-analytics';
import { useAllAliasesWithSellingCode } from '@deps/components/illustrations/helpers/hooks/user-identity';
import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { PageHead } from '@deps/components/page-title';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { IllustrationsClientCaseProvider } from '@deps/contexts/illustrations/IllustrationsClientCaseContext';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { UserProfile } from '@deps/models/user-profile';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
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

interface IllustrationsPageProps extends SegmentTrackedPageProps {
    featureFlagDecisions: FeatureFlags;
    additionalData: additionalDataProps;
    clientCase?: Jsonify<IllustrationsClientCase>;
    hasError?: boolean;
}

const NEW_CLIENT_CASE_URL = '/illustrations/client-cases/new';
const NEW_QUICK_QUOTE_URL = '/illustrations/client-cases/quick-quote';

export default function Illustrations({
    hasError = false,
    additionalData,
}: IllustrationsPageProps) {
    const { featureFlags } = useOptimizely();
    const searchParams = useSearchParams();
    const isClientCaseFetching = useIsFetching({
        queryKey: ['clientCaseSearch'],
    });
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const {
        isAllowWriteClientCase,
        partyReferenceData,
        isAllowReadIllustrations,
    } = usePermissionsContext();
    const { sendNewClientCaseClicked } = useIllustrationAnalytics();
    const aliases = useAllAliasesWithSellingCode(partyReferenceData);
    useSegmentPageTracker(
        additionalData.user,
        SegmentPageName.IllustrationsClientCase
    );

    const isAgent = aliases?.length ?? 0 > 0;
    const illustrationsQuickQuoteEnabled =
        featureFlags[FEATURE_FLAGS.ILLUSTRATIONS_QUICK_QUOTE];

    const allowCreateCase = isAgent || isAllowWriteClientCase;
    const allowQuickQuote =
        (isAgent && isAllowReadIllustrations && isAllowWriteClientCase) ||
        isAllowReadIllustrations;

    const createClientCaseSearchParams = toLowerCaseSearchParams(searchParams);
    createClientCaseSearchParams.delete('eappid');
    const renderQuickQuote = () => {
        if (!illustrationsQuickQuoteEnabled) {
            return <></>;
        }
        return (
            <>
                {allowQuickQuote ? (
                    <Link
                        href={{
                            pathname: NEW_QUICK_QUOTE_URL,
                        }}
                        passHref
                        className="flex items-center gap-2"
                    >
                        <Button
                            mode="link"
                            data-testid="quick-quote-btn"
                            aria-label={t('ariaLabel.search') as string}
                            type="button"
                            size="small"
                        >
                            {t('clientCase.quickQuote')}
                        </Button>
                    </Link>
                ) : (
                    <TempNavInactive
                        tooltipBody={t('clientCase.quickQuotePermissions')}
                        navElementClassName="!bg-transparent"
                    >
                        <Button
                            disabled={!allowCreateCase}
                            mode="link"
                            data-testid="quick-quote-btn"
                            aria-label={t('ariaLabel.search') as string}
                            type="button"
                            size="small"
                        >
                            {t('clientCase.quickQuote')}
                        </Button>
                    </TempNavInactive>
                )}
            </>
        );
    };

    return (
        <>
            <PageHead titleKey="clientCases" />
            <IllustrationsClientCaseProvider>
                {!!hasError && (
                    <BannerAlert
                        bodyText={
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className={styles.bannerText}
                            >
                                {t('clientCase.errors.createClientCase')}
                            </Typography>
                        }
                        variant={BannerVariant.Error}
                        canDismiss
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
                    <div
                        className="flex gap-4 justify-center"
                        data-testid="quick-quote-cta"
                    >
                        {renderQuickQuote()}
                        {allowCreateCase ? (
                            <Link
                                href={{
                                    pathname: NEW_CLIENT_CASE_URL,
                                    query: createClientCaseSearchParams.toString(),
                                }}
                                passHref
                                onClick={sendNewClientCaseClicked}
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
                        ) : (
                            <TempNavInactive
                                tooltipBody={t(
                                    'clientCase.clientCasePermissions'
                                )}
                                navElementClassName="!bg-transparent"
                            >
                                <Button
                                    disabled={!allowCreateCase}
                                    mode="link"
                                    data-testid="new-client-case-btn"
                                    aria-label={t('ariaLabel.search') as string}
                                    type="button"
                                    size="small"
                                >
                                    {t('clientCase.newClientCase')}
                                </Button>
                            </TempNavInactive>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <ClientCaseSearchBar />
                </div>
                <div>
                    <div className="mb-8">
                        <ClientCaseTable />
                    </div>
                    {!isClientCaseFetching && <ClientCasePaginator />}
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
