import { getAccessToken } from '@auth0/nextjs-auth0';
import { useMutation } from '@tanstack/react-query';
import { GetServerSidePropsContext } from 'next';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ComponentProps, useCallback, useEffect } from 'react';

import CreateClientCaseForm from '@deps/components/client-case/client-case-create/create-client-case-form';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { isEmptyObject } from '@deps/helpers/objects.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { DEFAULT_LOCALE, ALL_LOCALES } from '@deps/helpers/routing.helpers';
import { UserProfile } from '@deps/models/user-profile';
import {
    buildClientCaseFromNewBusiness,
    createClientCase,
    searchClientCaseByEappId,
} from '@deps/queries/api/server/v1/client-cases';
import {
    getNewBusinessById,
    NEW_BUSINESS_API_ORIGIN,
} from '@deps/queries/api/server/v2/new-business';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { postIllustrationsClientCase } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    logError,
    LoggingContext,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import { toLowerCaseSearchParams } from '@deps/utils/url';
import nextI18nextConfig from 'next-i18next.config';

import IllustrationsPage from './index';

type additionalDataProps = {
    user: UserProfile;
};

export default function NewClientCase(
    props: ComponentProps<typeof IllustrationsPage>
) {
    const router = useRouter();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const sideSheet = useSideSheetContext();
    const searchParams = useSearchParams();

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

    const { mutate } = useMutation({
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
        // Discart this when date input is replaced with the final verstion of the date picker.
        if (clientCaseData.insuredDetails) {
            clientCaseData.insuredDetails.dateOfBirth = new Date(
                clientCaseData.insuredDetails?.dateOfBirth ?? ''
            );
        }
        mutate(clientCaseData as unknown as IllustrationsClientCase);
    };

    useEffect(() => {
        sideSheet.events.on('close', closeSideSheet);

        return () => sideSheet.events.off('close', closeSideSheet);
    }, [closeSideSheet, sideSheet.events]);

    useEffect(() => {
        const params = toLowerCaseSearchParams(searchParams);

        if (params.has('eappid') && props.fetchingErrorOrigin) {
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
    }, [searchParams]);
    // We cannot add SideSheet as a dependency because updating the content also changes this reference

    return IllustrationsPage(props);
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

            // parse the desire queryParam to lowercase and return it
            const loweredCaseEAppIdQueryParam = Object.entries(
                context.query
            ).find(([key]) => key.toLowerCase() === 'eappid')?.[1];

            const _eAppId =
                typeof loweredCaseEAppIdQueryParam === 'string'
                    ? loweredCaseEAppIdQueryParam
                    : '';

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
                        // Step 3: if a client case does not exist, create a new client case

                        // 3a. Retrieve the new business response object from the API
                        const newBusinessResponseObject =
                            await getNewBusinessById(_eAppId, loggingContext);

                        // Check if the new business response object is empty
                        if (isEmptyObject(newBusinessResponseObject)) {
                            // If it's empty, throw an error indicating that the new business was not found
                            throwTypedError(
                                'New Business not found',
                                NEW_BUSINESS_API_ORIGIN
                            );
                        }
                        if (newBusinessResponseObject.message) {
                            // If the response object contains an error message, throw an error with that message
                            throwTypedError(
                                newBusinessResponseObject.message,
                                NEW_BUSINESS_API_ORIGIN
                            );
                        }

                        // 3b. Build the client case payload from the new business response object
                        const newClientCasePayload =
                            await buildClientCaseFromNewBusiness(
                                newBusinessResponseObject,
                                _eAppId,
                                loggingContext
                            );

                        // 3c. Check if the sex at birth field is missing from the client case payload
                        if (!newClientCasePayload.insuredDetails?.sexAtBirth) {
                            // If it's missing,r edirect to the new client case page and pre-populate the form with the available data
                            const { dateOfBirth } =
                                newClientCasePayload.insuredDetails ?? {};

                            return {
                                props: {
                                    locale,
                                    ...translations,
                                    featureFlagDecisions,
                                    clientCase: {
                                        ...newClientCasePayload,
                                        insuredDetails: {
                                            ...newClientCasePayload.insuredDetails,
                                            dateOfBirth: dateOfBirth
                                                ? dateOfBirth.toISOString()
                                                : null,
                                            sexAtBirth: 'MALE',
                                        },
                                    },
                                    additionalData,
                                },
                            };
                        }

                        // 3d.Create a new client case using the payload and redirect to the illustration page
                        const newCaseResponse = await createClientCase(
                            newClientCasePayload,
                            getAuthTokenResponse,
                            loggingContext
                        );
                        if (newCaseResponse) {
                            // Extract the ID and plan code from the response
                            const { id } = newCaseResponse;
                            const { planCode } = newBusinessResponseObject;

                            // Construct the redirect URL based on the plan code
                            const baseRedirectionUrl = `/illustrations/client-cases/${id}/illustrate`;
                            const destination =
                                planCode !== ''
                                    ? `${baseRedirectionUrl}?planCode=${planCode}`
                                    : baseRedirectionUrl;

                            // Redirect to the illustration page
                            return {
                                redirect: {
                                    destination,
                                    permanent: false,
                                },
                            };
                        }
                    }
                } catch (error: any) {
                    logError(error.message, {
                        ...loggingContext,
                        error: error,
                    });

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
