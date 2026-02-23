import first from 'lodash/head';
import merge from 'lodash/merge';

import {
    isEmptyObject,
    stripNullishValues,
} from '@deps/helpers/objects.helpers';
import {
    CLIENT_CASE_MANAGER_API_ORIGIN,
    createClientCase,
    patchClientCase,
    searchClientCaseByEappId,
} from '@deps/queries/api/server/v1/client-cases';
import {
    getNewBusinessById,
    isNewBusinessErrorResponse,
    NEW_BUSINESS_API_ORIGIN,
} from '@deps/queries/api/server/v2/new-business';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import {
    IllustrationsClientCase,
    TransactionType,
} from '@deps/types/illustrations';
import { NewBusiness } from '@deps/types/new-business';
import {
    logError,
    LoggingContext,
    logInfo,
    logTrace,
} from '@deps/utils/server-logging';

import { buildClientCaseFromNewBusiness } from './build-client-case-from-new-business';
import { validateConversionPayload } from './conversions';

/**
 * Entry point for handling Sureify → Illustrations deep link flow.
 *
 * This function receives an eAppId from Sureify and ensures the correct
 * Client Case state exists in our system before routing the user.
 *
 * High-level business rules:
 *  - If the case already exists in our system → redirect to it
 *  - If no case exists → fetch application data from New Business API and create one
 *  - If the external data is incomplete → return props to pre-fill the form and collect missing fields
 *
 * Why this logic exists:
 *  - Prevent duplicate case creation for the same Sureify application
 *  - Smooth internal/external hand-off between Sureify and Illustrations
 *  - Ensure required fields exist before generating an illustration
 *
 * Error handling strategy:
 *  - All failures are logged with context for traceability
 *  - We return props with error messaging instead of throwing (SSR safe failure)
 *
 * Redirect scenarios:
 *  Case already exists → go straight to illustration
 *  Case successfully created → go to new illustration page
 *  Missing mandatory info (e.g. sex at birth) when not a conversion → return props to pre-populate form
 *  Error → return error props for UI fallback
 *
 * Security notes:
 *  - Requires valid access token
 *  - Uses server APIs only (never exposed to client)
 *
 * Observability:
 *  - LoggingContext propagated throughout
 *  - API origin tagged in typed errors for debug clarity
 */
export const createClientCaseFromSureify = async (
    eAppId: string,
    accessToken: string,
    loggingContext: LoggingContext,
    upsertIfExists: boolean
) => {
    const logPrefix = `ClientCases:New:Sureify`;
    const logCtx = {
        ...loggingContext,
        file: 'create-client-case-from-sureify',
        function: 'createClientCaseFromSureify',
    };

    logTrace(`${logPrefix} Started`, {
        ...logCtx,
        eAppId,
    });
    try {
        // Step 1: Search existing client cases if and eAppId is on the query string
        const clientCases = await searchClientCaseByEappId(
            eAppId,
            accessToken,
            logCtx
        );
        // In a real scenario it should only exist one client case with the eAppId assigned
        const defaultClientCaseId = first(clientCases)?.id;

        // Step 2: if a client case already exists, update if needed then redirect to the client case
        if (defaultClientCaseId) {
            logInfo(`${logPrefix} Found existing client case`, {
                ...logCtx,
                clientCaseId: defaultClientCaseId,
            });

            if (upsertIfExists) {
                const newBusinessResponseObject = await getNewBusinessById(
                    eAppId,
                    logCtx
                );

                if (isEmptyObject(newBusinessResponseObject)) {
                    // New Business was not found
                    throwTypedError(
                        'New Business not found',
                        NEW_BUSINESS_API_ORIGIN
                    );
                }
                if (isNewBusinessErrorResponse(newBusinessResponseObject)) {
                    // The API returned an error
                    throwTypedError(
                        newBusinessResponseObject.message,
                        NEW_BUSINESS_API_ORIGIN
                    );
                }

                const updatedClientCasePayload =
                    await buildClientCaseFromNewBusiness(
                        newBusinessResponseObject,
                        eAppId,
                        logCtx
                    );

                // Strip null/undefined values to avoid overwriting existing data
                const sanitizedPayload = stripNullishValues(
                    updatedClientCasePayload
                );

                const patchedCase = await patchClientCase(
                    {
                        ...sanitizedPayload,
                        id: defaultClientCaseId,
                    },
                    accessToken,
                    logCtx
                );

                if (!patchedCase) {
                    return throwTypedError(
                        'Client case was not updated',
                        CLIENT_CASE_MANAGER_API_ORIGIN
                    );
                }
            }

            return {
                redirect: {
                    destination: `/illustrations/client-cases/${defaultClientCaseId}/illustrate`,
                    permanent: false,
                },
            };
        }

        // Step 3: if a client case does not exist, create a new client case

        // 3a. Retrieve the new business response object from the API
        const newBusinessResponseObject = await getNewBusinessById(
            eAppId,
            logCtx
        );

        if (isEmptyObject(newBusinessResponseObject)) {
            // New Business was not found
            throwTypedError('New Business not found', NEW_BUSINESS_API_ORIGIN);
        }
        if (isNewBusinessErrorResponse(newBusinessResponseObject)) {
            // The API returned an error
            throwTypedError(
                newBusinessResponseObject.message,
                NEW_BUSINESS_API_ORIGIN
            );
        }
        logTrace(`${logPrefix} Got eApp from new business`, {
            ...logCtx,
            eApp: newBusinessResponseObject,
        });

        // 3b. Build the client case payload from the new business response object
        const newClientCasePayload = await buildClientCaseFromNewBusiness(
            newBusinessResponseObject,
            eAppId,
            logCtx
        );

        const isConversion =
            newClientCasePayload.transactionType === TransactionType.CONVERSION;

        logTrace(
            isConversion
                ? `${logPrefix} Conversion detected`
                : `${logPrefix} Non-Conversion detected`,
            logCtx
        );

        // 3c. Check additional required fields if it's a conversion
        if (isConversion) {
            validateConversionPayload(newClientCasePayload);
        }

        // 3d. Check if the sex at birth field is missing from the client case payload (if not a conversion)
        if (!newClientCasePayload.insuredDetails?.sexAtBirth) {
            // If it's missing, redirect to the new client case page and pre-populate the form with the available data
            logTrace(
                `${logPrefix} Detected missing sexAtBirth for non-coversion`,
                logCtx
            );
            return {
                props: {
                    clientCase: merge(
                        // Serialize Date fields
                        JSON.parse(JSON.stringify(newClientCasePayload)),
                        {
                            insuredDetails: {
                                sexAtBirth: 'MALE',
                            },
                        }
                    ),
                },
            };
        }

        // Step 4: Create a new client case using the payload and redirect to the illustration page
        const newCaseResponse = await createClientCase(
            newClientCasePayload,
            accessToken,
            logCtx
        );

        if (!newCaseResponse) {
            return throwTypedError(
                'Client case was not created',
                CLIENT_CASE_MANAGER_API_ORIGIN
            );
        }

        logInfo(`${logPrefix} Client case created from eApp`, {
            ...logCtx,
            clientCaseId: newCaseResponse.id,
        });

        // Step 5: Redirect to the new client case page
        const redirection = buildSuccessRedirection(
            newCaseResponse,
            newBusinessResponseObject
        );

        logTrace(`${logPrefix} Redirect user to new client case page`, {
            ...logCtx,
            redirection: redirection.redirect,
        });
        return redirection;
    } catch (error: any) {
        // Never throw from SSR — always return props to avoid server response crash
        logError(error.message, {
            ...logCtx,
            error: error,
        });

        return {
            props: {
                fetchingErrorMessage: error.message,
                fetchingErrorOrigin: error.origin ?? 'internal-error',
            },
        };
    }
};

export const buildSuccessRedirection = (
    newClientCase: Partial<IllustrationsClientCase>,
    newBusinessResponseObject: NewBusiness
) => {
    // Extract the ID and plan code from the response
    const { id } = newClientCase;
    const { planCode } = newBusinessResponseObject?.policy ?? {};

    // Construct the redirect URL based on the plan code
    const baseRedirectionUrl = `/illustrations/client-cases/${id}/illustrate`;
    const destination = planCode
        ? `${baseRedirectionUrl}?planCode=${planCode}`
        : baseRedirectionUrl;

    return {
        redirect: {
            destination,
            permanent: false,
        },
    };
};
