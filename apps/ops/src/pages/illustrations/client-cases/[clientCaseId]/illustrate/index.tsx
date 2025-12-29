import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import IllustrationCaseSumary from '@deps/components/illustrations/components/case-details/case-summary/case-summary';
import IllustrationProductList from '@deps/components/illustrations/components/case-details/product-list/product-list';
import IllustrationDetails from '@deps/components/illustrations/components/details/illustration-details';
import { buildHierarchyQueryOptions } from '@deps/components/illustrations/helpers/hooks/pom';
import { useClientCaseId } from '@deps/components/illustrations/helpers/hooks/use-client-case-id';
import { SelectedIllustrationProvider } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { UserProfile } from '@deps/models/user-profile';
import {
    getClientCase,
    getProductsByCarrier,
} from '@deps/queries/tanstack/clientCaseQueries/clientCaseQueries';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { ApiResponse } from '@deps/types/api-response';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { Product } from '@deps/types/product';
import { SegmentPageName } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import styles from './illustrations.module.css';

export type AdditionalDataProps = {
    user: UserProfile;
};

interface ClientCaseIllustrationsProps {
    additionalData: AdditionalDataProps;
}

export default function ClientCaseIllustrations({
    additionalData,
}: ClientCaseIllustrationsProps) {
    const clientCaseId = useClientCaseId();
    const searchParams = useSearchParams();
    const carrierProductId = searchParams.get('planCode') || '';
    useSegmentPageTracker(
        additionalData.user,
        SegmentPageName.IllustrationsDetails,
        { client_case_id: clientCaseId }
    );

    const {
        data: clientCase,
        isLoading: isLoadingClientCase,
        isError,
        isFetching: isFetchingClientCase,
    } = useQuery({
        queryKey: ['clientCaseData', clientCaseId],
        structuralSharing: false,
        queryFn: () => getClientCase(clientCaseId),
        select: useCallback(
            (data: ApiResponse<IllustrationsClientCase>) => data.data,
            []
        ),
    });

    const { data: clientCaseUserHierarchy } = useQuery(
        buildHierarchyQueryOptions({
            sellingCode: clientCase?.agentDetails?.sellingCode,
            // TODO: Use the correct carrier code for this client case
            carrierShortName: 'FNWL',
        })
    );

    const {
        data: products = [],
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
        isFetching: isFetchingProducts,
    } = useQuery({
        queryKey: [
            'productList',
            clientCaseUserHierarchy?.carrier.carrierShortName,
        ],
        queryFn: () => {
            return getProductsByCarrier(
                '',
                clientCaseUserHierarchy?.carrier.carrierShortName || '',
                ''
            );
        },
        select: useCallback(
            (data: ApiResponse<Product[]>) => data.data || [],
            []
        ),
        enabled: !!clientCaseUserHierarchy?.carrier.carrierShortName,
    });

    return (
        <>
            <PageHead titleKey="illustrate" />
            <SelectedIllustrationProvider
                clientCaseId={clientCaseId as string}
                clientCase={clientCase}
                products={products}
            >
                <div className={clsx(styles.caseIllustrations)}>
                    {((!clientCase && !isFetchingClientCase) || isError) && (
                        <div className="flex h-[500px] w-full items-center justify-center rounded border-2 border-dashed border-semantic-warning bg-white shadow-sm">
                            <CardInfo
                                icon={
                                    <ErrorIcon
                                        className="text-semantic-warning"
                                        height={50}
                                        width={50}
                                    />
                                }
                                title="Client Case not found"
                            />
                        </div>
                    )}
                    {clientCase && (
                        <>
                            <section className={clsx(styles.caseContainer)}>
                                <Skeleton
                                    loading={
                                        isLoadingClientCase ||
                                        isFetchingClientCase
                                    }
                                >
                                    <IllustrationCaseSumary
                                        clientCase={
                                            clientCase as IllustrationsClientCase
                                        }
                                    />
                                </Skeleton>
                                <hr className={clsx(styles.separator)} />
                                <>
                                    {(isLoadingProducts ||
                                        isFetchingProducts) && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                marginTop: '2rem',
                                            }}
                                        >
                                            <Loader />
                                        </div>
                                    )}
                                </>
                                {!isLoadingProducts &&
                                    !isFetchingProducts &&
                                    !isLoadingClientCase &&
                                    !isFetchingClientCase && (
                                        <IllustrationProductList
                                            carrierProductId={carrierProductId}
                                            clientCase={clientCase}
                                            illustrations={
                                                clientCase?.illustrations
                                            }
                                            products={products}
                                            isError={isErrorProducts}
                                        />
                                    )}
                            </section>
                            <section
                                className={clsx(styles.illustrationContainer)}
                            >
                                <IllustrationDetails
                                    clientCase={clientCase}
                                    eAppId={clientCase.eAppId}
                                />
                            </section>
                        </>
                    )}
                </div>
            </SelectedIllustrationProvider>
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
            const additionalData: AdditionalDataProps = { user: user };

            const transaltions = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON],
                nextI18nextConfig,
                ALL_LOCALES
            );
            return {
                props: {
                    locale,
                    ...transaltions,
                    featureFlagDecisions,
                    additionalData,
                },
            };
        },
    },
    {
        file: 'illustrations',
        function: 'getServerSideProps',
        page: 'client-cases/illustrations',
    }
);
