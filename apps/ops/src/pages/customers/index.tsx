import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useCustomersFiltering } from '@deps/hooks/customers/useCustomersFiltering';
import { useCustomersQuery } from '@deps/queries/tanstack/customers/customers-queries';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import { logInfo, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

export default function CustomersPage() {
    const { limit, offset, sortBy, sortOrder, filters } =
        useCustomersFiltering();

    const _ = useCustomersQuery({
        limit,
        offset,
        sortBy,
        sortOrder,
        filters,
    });

    return <div>Customers</div>;
}

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, _loggingContext) => {
            const { locale = DEFAULT_LOCALE } = context;

            const user = await getUserData(context);

            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    _loggingContext
                );

            if (!featureFlagDecisions[FEATURE_FLAGS.MARKET_CONNECT_ENABLED]) {
                logInfo(
                    'customersPage::Feature flag not enabled',
                    _loggingContext
                );
                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }
            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return {
                props: {
                    ...translations,
                    user,
                },
            };
        },
    },
    {
        file: 'customers/index',
        function: 'getServerSideProps',
        page: 'customers/index',
    }
);
