import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { QuickQuoteResultsPage } from '@deps/components/client-case/quick-quote/results-page';
import { TranslationFiles } from '@deps/config/translations';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserProfile } from '@deps/models/user-profile';
import { quickQuoteParamsSchema } from '@deps/types/quickQuote';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

const ensureSingle = <T,>(value: T | T[] | undefined): T | undefined =>
    Array.isArray(value) ? value[0] : value;

const parseRiderQueryValue = (value: string | string[]) => {
    if (value === '') {
        return true;
    }
    // ParseFloat allows undefined as argument
    return parseFloat(ensureSingle(value)!);
};

const parseRiderQueryParam = (key: string, value: string | string[]) => {
    const newKey = key.replace(/^riders\./, '');

    return [newKey, parseRiderQueryValue(value)];
};

export type AdditionalDataProps = {
    user: UserProfile;
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const { query } = context;
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

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON],
                nextI18nextConfig,
                ALL_LOCALES
            );

            const paramsResult = quickQuoteParamsSchema.parse({
                ...query,
                insuredAge: parseInt(ensureSingle(query?.insuredAge)!),
                nicotineUser: ensureSingle(query?.nicotineUser) === 'true',
                faceAmount: parseFloat(ensureSingle(query?.faceAmount)!),
                riders: Object.fromEntries(
                    Object.entries(query)
                        .filter(
                            ([key, value]) =>
                                key.startsWith('riders.') && value != null
                        )
                        .map(([key, value]) =>
                            parseRiderQueryParam(key, value!)
                        )
                ),
                premiumFreeRiders: Object.fromEntries(
                    Object.entries(query)
                        .filter(
                            ([key, value]) =>
                                key.startsWith('premiumFreeRiders.') &&
                                value != null
                        )
                        .map(([key, value]) => [
                            key.replace(/^premiumFreeRiders\./, ''),
                            value === 'true',
                        ])
                ),
            });

            if (!paramsResult.success) {
                console.error(paramsResult.error);
                return {
                    notFound: true,
                };
            }

            const params = paramsResult.value;

            if (
                params.insuredAge <= 0 ||
                params.faceAmount <= 0 ||
                !Number.isFinite(params.faceAmount)
            ) {
                return { notFound: true };
            }

            Object.entries(params.riders)
                .filter(([, value]) => !Number.isFinite(value))
                .forEach(
                    ([rider]) =>
                        delete (params.riders as Record<string, unknown>)[rider]
                );

            return {
                props: {
                    ...translations,
                    featureFlagDecisions,
                    additionalData,
                    quickQuoteParams: params,
                },
            };
        },
    },
    {
        file: 'quick-quote/results',
        function: 'getServerSideProps',
        page: 'illustrations/quick-quote/results',
    }
);

export default QuickQuoteResultsPage;
