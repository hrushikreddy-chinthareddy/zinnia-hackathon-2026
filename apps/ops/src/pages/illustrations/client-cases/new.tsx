import { getAccessToken } from '@auth0/nextjs-auth0';
import { useMutation } from '@tanstack/react-query';
import merge from 'lodash/merge';
import { GetServerSidePropsContext } from 'next';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ComponentProps, useCallback, useEffect } from 'react';

import CreateClientCaseForm from '@deps/components/client-case/client-case-create/create-client-case-form';
import { createClientCaseFromSureify } from '@deps/components/client-case/client-case-list/sureify-flow/create-client-case-from-sureify';
import { canUserCreateClientCase } from '@deps/components/client-case/client-case-list/sureify-flow/validate-user-permission';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { UserProfile } from '@deps/models/user-profile';
import { postIllustrationsClientCase } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { SegmentPageName } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    LoggingContext,
    logInfo,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import { toLowerCaseSearchParams } from '@deps/utils/url';
import nextI18nextConfig from 'next-i18next.config';

import IllustrationsPage, { ErrorOrigin } from './index';

type additionalDataProps = {
    user: UserProfile;
};

export default function NewClientCase(
    props: ComponentProps<typeof IllustrationsPage>
) {
    const router = useRouter();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const sideSheet = useSideSheetContextLegacy();
    const searchParams = useSearchParams();
    useSegmentPageTracker(
        props.additionalData.user,
        SegmentPageName.IllustrationsNewClientCase
    );

    const closeSideSheet = useCallback(() => {
        const params = toLowerCaseSearchParams(searchParams);
        // If we don't remove the eappid, we'll be redirected here again
        // (and we will not be able to open the sideSheet again)
        params.delete('eappid');

        router.push({
            pathname: '/illustrations/client-cases/',
            query: params.toString(),
        });
    }, [router, searchParams]);

    const { mutateAsync } = useMutation({
        mutationKey: ['createClientCase'],
        mutationFn: (data: Partial<IllustrationsClientCase>) =>
            postIllustrationsClientCase(data),
        onSuccess: (data) => {
            if (data?.id) {
                return router.push(
                    `/illustrations/client-cases/${data?.id}/illustrate`
                );
            }
            console.log('ID not found after client case creation');
        },

        onMutate: () => {
            // add loading logic
        },
        onError: () => {
            // add error logic
        },
    });

    const onSubmitForm = (clientCaseData: Partial<IllustrationsClientCase>) => {
        return mutateAsync(
            clientCaseData as unknown as IllustrationsClientCase
        );
    };

    useEffect(() => {
        sideSheet.events.on('close', closeSideSheet);

        return () => sideSheet.events.off('close', closeSideSheet);
    }, [closeSideSheet, sideSheet.events]);

    useEffect(() => {
        const params = toLowerCaseSearchParams(searchParams);

        if (
            (params.has('eappid') && props.fetchingErrorOrigin) ||
            props.fetchingErrorOrigin === ErrorOrigin.Internal
        ) {
            return;
        }
        const createClientCaseForm = t(
            'clientCase.createClientCaseForm.clientCaseSideSheetTitle'
        );
        sideSheet.changeSideSheetContent(
            createClientCaseForm,
            <CreateClientCaseForm
                onCancel={closeSideSheet}
                onSubmit={onSubmitForm}
                isEdit={false}
                clientCase={props.clientCase}
            />
        );
        sideSheet.handleOpen(true, 500);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);
    // We cannot add SideSheet as a dependency because updating the content also changes this reference

    return IllustrationsPage(props);
}
const getAuthToken = async (
    context: GetServerSidePropsContext,
    loggingContext: LoggingContext
) => {
    try {
        const { accessToken } = await getAccessToken(context.req, context.res);
        return accessToken ?? null;
    } catch (e) {
        logWarn('getServerSidePropsPolicyDetailsPage::Access token expired', {
            ...parseErrorInformation(e),
            ...loggingContext,
        });
        return null;
    }
};

/**
 * Server-side entry point for the Sureify flow.
 *
 * This page requires:
 *  - User authentication (wrapped by `withPageAuthAndLogging`)
 *  - Access to the Illustrations feature (feature flag)
 *  - Permission to create client cases when an eAppId is present
 *
 * Behavior summary:
 *  - If Illustrations flag disabled → redirect to /cases
 *  - If user is not allowed to create cases → render client cases page with error message
 *  - If `eAppId` is provided → attempt to bootstrap a client case from Sureify
 *  - Otherwise → load translations + common props and render normally
 */
export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const logPrefix = 'ClientCases:New';
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

            /**
             * Normalize query params to lowercase keys
             * Important because Sureify uses `eAppId` → we map to `eappid`
             */
            const normalizedQuery = Object.fromEntries(
                Object.entries(context.query).map(([key, value]) => [
                    key.toLocaleLowerCase(),
                    value,
                ])
            );

            const eAppId = normalizedQuery?.eappid;
            const hasSingleEappId = eAppId && typeof eAppId === 'string';

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

            /**
             * If an eAppId is provided → attempt to import a Sureify application
             * Only applies in direct links from Sureify → not standard navigation
             */
            if (hasSingleEappId) {
                const accessToken = await getAuthToken(context, loggingContext);

                logInfo(`${logPrefix} Got eAppId`, {
                    ...loggingContext,
                    eAppId,
                });

                if (!accessToken) {
                    logWarn(`${logPrefix} Invalid token`, loggingContext);
                    return serverSidePropsLogout();
                }

                return merge(
                    { props: commonProps },
                    await createClientCaseFromSureify(
                        eAppId,
                        accessToken,
                        loggingContext
                    )
                );
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
