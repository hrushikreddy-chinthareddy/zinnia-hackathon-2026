import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ComponentProps, useCallback, useEffect } from 'react';

import { canUserCreateClientCase } from '@deps/components/client-case/client-case-list/sureify-flow/validate-user-permission';
import { serializeQuickQuoteParams } from '@deps/components/client-case/quick-quote/helpers';
import { QuickQuoteForm } from '@deps/components/client-case/quick-quote/quick-quote-form';
import { TranslationFiles } from '@deps/config/translations';
/**
 * @deprecated Use standard Sidesheet from Bloom component library
 */
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserProfile } from '@deps/models/user-profile';
import { QuickQuoteParams } from '@deps/types/quickQuote';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import IllustrationsPage from '../index';

type additionalDataProps = {
    user: UserProfile;
};

export default function NewQuickQuote(
    props: ComponentProps<typeof IllustrationsPage>
) {
    const router = useRouter();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const sideSheet = useSideSheetContextLegacy();

    const closeSideSheet = useCallback(() => {
        router.push({
            pathname: '/illustrations/client-cases/',
        });
    }, [router]);

    const onSubmitForm = async (quickQuoteParams: QuickQuoteParams) => {
        await router.push({
            pathname: '/illustrations/client-cases/quick-quote/results',
            query: serializeQuickQuoteParams(quickQuoteParams),
        });
    };

    useEffect(() => {
        sideSheet.events.on('close', closeSideSheet);

        return () => sideSheet.events.off('close', closeSideSheet);
    }, [closeSideSheet, sideSheet.events]);

    useEffect(() => {
        const formTitle = t('clientCase.quickQuoteForm.title');
        sideSheet.changeSideSheetContent(
            formTitle,
            <QuickQuoteForm onCancel={closeSideSheet} onSubmit={onSubmitForm} />
        );
        sideSheet.handleOpen(true, 500);
    }, []);
    return IllustrationsPage(props);
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

            const IllustrationsFeatureActive =
                featureFlagDecisions?.[FEATURE_FLAGS.ILLUSTRATIONS_EXPERIENCE];

            if (!IllustrationsFeatureActive) {
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

            const commonProps = {
                locale,
                ...translations,
                featureFlagDecisions,
                additionalData,
            };

            if (!(await canUserCreateClientCase(context, loggingContext))) {
                return {
                    props: {
                        ...commonProps,
                        fetchingErrorMessage:
                            'User does not have the right permissions to create a client case',
                        fetchingErrorOrigin: 'internal-error',
                    },
                };
            }
            return {
                props: commonProps,
            };
        },
    },
    {
        file: 'illustrations',
        function: 'getServerSideProps',
        page: 'illustrations',
    }
);
