import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CardInfo from '@deps/components/card/card-info/card-info';
import IllustrationCaseSumary from '@deps/components/illustrations/components/case-details/case-summary/case-summary';
import IllustrationProductList from '@deps/components/illustrations/components/case-details/product-list/product-list';
import IllustrationDetails from '@deps/components/illustrations/components/details/illustration-details';
import { SelectedIllustrationProvider } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { TranslationFiles } from '@deps/config/translations';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserProfile } from '@deps/models/user-profile';
import { getClientCase } from '@deps/queries/tanstack/clientCaseQueries/clientCaseQueries';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { IllustrationsClientCase } from '@deps/types/illustrations';
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
type ClientCaseIllustrationsPageProps = {
    featureFlagDecisions: FeatureFlags;
    additionalData: AdditionalDataProps;
};

export default function ClientCaseIllustrations({
    featureFlagDecisions,
    additionalData,
}: ClientCaseIllustrationsPageProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const params = useParams<{ clientCaseId: string }>();
    const searchParams = useSearchParams();
    // const sideSheet = useSideSheetContext();
    const carrierProductId = searchParams.get('planCode') || '';

    const {
        data: clientCase,
        isLoading,
        isError,
        isFetching,
    } = useQuery({
        queryKey: ['clientCaseData', params.clientCaseId],
        queryFn: () => {
            const response = getClientCase(params.clientCaseId);
            return response;
        },
        select: (data) => data.data,
        enabled: true,
    });

    // const handleNewIllustration = (planCode: string) => {
    //     if (planCode && clientCase) {
    //         sideSheet.changeSideSheetContent(
    //             'Add Illustration',
    //             <EappContainer planCode={planCode} clientCase={clientCase} />
    //         );
    //         sideSheet.handleOpen(true, '50%');
    //     }
    // };

    return (
        <SelectedIllustrationProvider>
            <div className={clsx(styles.caseIllustrations)}>
                {((!clientCase && !isFetching) || isError) && (
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
                            <Skeleton loading={isLoading || isFetching}>
                                <IllustrationCaseSumary
                                    clientCase={
                                        clientCase as IllustrationsClientCase
                                    }
                                />
                            </Skeleton>
                            <hr className={clsx(styles.separator)} />
                            <IllustrationProductList
                                carrierProductId={carrierProductId}
                                clientCase={clientCase}
                                illustrations={clientCase?.illustrations}
                            />
                        </section>
                        <section className={clsx(styles.illustrationContainer)}>
                            <IllustrationDetails
                                clientCaseId={clientCase.id}
                                eAppId={clientCase.eAppId}
                            />
                        </section>
                    </>
                )}
            </div>
        </SelectedIllustrationProvider>
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
