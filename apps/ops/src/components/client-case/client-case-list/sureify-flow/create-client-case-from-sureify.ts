import first from 'lodash/head';
import merge from 'lodash/merge';

import { isEmptyObject } from '@deps/helpers/objects.helpers';
import {
    CLIENT_CASE_MANAGER_API_ORIGIN,
    createClientCase,
    searchClientCaseByEappId,
} from '@deps/queries/api/server/v1/client-cases';
import {
    getNewBusinessById,
    isNewBusinessResponse,
    NEW_BUSINESS_API_ORIGIN,
} from '@deps/queries/api/server/v2/new-business';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { logError, LoggingContext } from '@deps/utils/server-logging';

import { buildClientCaseFromNewBusiness } from './build-client-case-from-new-business';

export const createClientCaseFromSureify = async (
    eAppId: string,
    accessToken: string,
    loggingContext: LoggingContext
) => {
    try {
        // Step 1: Search existing client cases if and eAppId is on the query string
        const clientCases = await searchClientCaseByEappId(
            eAppId,
            accessToken,
            loggingContext
        );
        const defaultClientCaseId = first(clientCases)?.id;

        // Step 2: if a client case already exists, redirect to the client case
        if (defaultClientCaseId) {
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
            loggingContext
        );

        if (isEmptyObject(newBusinessResponseObject)) {
            // New Business was not found
            throwTypedError('New Business not found', NEW_BUSINESS_API_ORIGIN);
        }
        if (isNewBusinessResponse(newBusinessResponseObject)) {
            // The API returned an error
            throwTypedError(
                newBusinessResponseObject.message,
                NEW_BUSINESS_API_ORIGIN
            );
        }

        // 3b. Build the client case payload from the new business response object
        const newClientCasePayload = await buildClientCaseFromNewBusiness(
            newBusinessResponseObject,
            eAppId,
            loggingContext
        );

        // 3c. Check if the sex at birth field is missing from the client case payload
        if (!newClientCasePayload.insuredDetails?.sexAtBirth) {
            // If it's missing, redirect to the new client case page and pre-populate the form with the available data
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

        // 3d.Create a new client case using the payload and redirect to the illustration page
        const newCaseResponse = await createClientCase(
            newClientCasePayload,
            accessToken,
            loggingContext
        );

        if (!newCaseResponse) {
            return throwTypedError(
                'Client case was not created',
                CLIENT_CASE_MANAGER_API_ORIGIN
            );
        }

        // Extract the ID and plan code from the response
        const { id } = newCaseResponse;
        const { planCode } = newBusinessResponseObject?.policy ?? {};

        // Construct the redirect URL based on the plan code
        const baseRedirectionUrl = `/illustrations/client-cases/${id}/illustrate`;
        const destination = planCode
            ? `${baseRedirectionUrl}?planCode=${planCode}`
            : baseRedirectionUrl;

        // Redirect to the new client case page
        return {
            redirect: {
                destination,
                permanent: false,
            },
        };
    } catch (error: any) {
        logError(error.message, {
            ...loggingContext,
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
