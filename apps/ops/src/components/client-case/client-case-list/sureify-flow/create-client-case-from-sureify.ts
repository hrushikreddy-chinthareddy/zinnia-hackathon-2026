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

const LOG_PREFIX = 'ClientCases:New:Sureify';

interface SureifyFlowOptions {
    accessToken: string;
    loggingContext: LoggingContext;
    upsertIfExists: boolean;
}

interface SureifyFlowContext {
    eAppId: string;
    accessToken: string;
    logCtx: LoggingContext;
}

type SureifyFlowResult =
    | { redirect: { destination: string; permanent: boolean } }
    | { props: Record<string, unknown> };

/**
 * Entry point for handling Sureify → Illustrations deep link flow.
 *
 * This function receives an eAppId from Sureify and ensures the correct
 * Client Case state exists in our system before routing the user.
 *
 * High-level business rules:
 *  - If the case already exists in our system → redirect to it (optionally update first)
 *  - If no case exists → fetch application data from New Business API and create one
 *  - If the external data is incomplete → return props to pre-fill the form
 *
 * Error handling strategy:
 *  - All failures are logged with context for traceability
 *  - We return props with error messaging instead of throwing (SSR safe failure)
 */
export const createClientCaseFromSureify = async (
    eAppId: string,
    options: SureifyFlowOptions
): Promise<SureifyFlowResult> => {
    const { accessToken, loggingContext, upsertIfExists } = options;

    const logCtx: LoggingContext = {
        ...loggingContext,
        file: 'create-client-case-from-sureify',
        function: 'createClientCaseFromSureify',
    };

    const ctx: SureifyFlowContext = { eAppId, accessToken, logCtx };

    logTrace(`${LOG_PREFIX} Started`, { ...logCtx, eAppId });

    try {
        // Search for existing client case with this eAppId
        const clientCases = await searchClientCaseByEappId(
            eAppId,
            accessToken,
            logCtx
        );
        const existingClientCaseId = first(clientCases)?.id;

        if (existingClientCaseId) {
            return await handleExistingClientCase(
                existingClientCaseId,
                ctx,
                upsertIfExists
            );
        }

        return await handleNewClientCase(ctx);
    } catch (error: any) {
        // Never throw from SSR — always return props to avoid server response crash
        logError(error.message, { ...logCtx, error });

        return {
            props: {
                fetchingErrorMessage: error.message,
                fetchingErrorOrigin: error.origin ?? 'internal-error',
            },
        };
    }
};

/**
 * Updates an existing client case with fresh data from New Business API.
 */
const updateExistingClientCase = async (
    clientCaseId: string,
    ctx: SureifyFlowContext
): Promise<void> => {
    const { eAppId, accessToken, logCtx } = ctx;

    const newBusinessData = await fetchNewBusinessData(eAppId, logCtx);

    const updatedPayload = await buildClientCaseFromNewBusiness(
        newBusinessData,
        eAppId,
        logCtx
    );

    // Strip null/undefined values to avoid overwriting existing data
    const sanitizedPayload = stripNullishValues(updatedPayload);

    const patchedCase = await patchClientCase(
        { ...sanitizedPayload, id: clientCaseId },
        accessToken,
        logCtx
    );

    if (!patchedCase) {
        throwTypedError(
            'Client case was not updated',
            CLIENT_CASE_MANAGER_API_ORIGIN
        );
    }
};

/**
 * Handles the flow when a client case already exists for the eAppId.
 * Optionally updates it, then redirects to the illustration page.
 */
const handleExistingClientCase = async (
    clientCaseId: string,
    ctx: SureifyFlowContext,
    upsertIfExists: boolean
): Promise<SureifyFlowResult> => {
    const { logCtx } = ctx;

    logInfo(`${LOG_PREFIX} Found existing client case`, {
        ...logCtx,
        clientCaseId,
    });

    if (upsertIfExists) {
        await updateExistingClientCase(clientCaseId, ctx);
    }

    return {
        redirect: {
            destination: `/illustrations/client-cases/${clientCaseId}/illustrate`,
            permanent: false,
        },
    };
};

/**
 * Creates a new client case from New Business data.
 * Returns either a redirect to the new case or props to pre-populate the form.
 */
const handleNewClientCase = async (
    ctx: SureifyFlowContext
): Promise<SureifyFlowResult> => {
    const { eAppId, accessToken, logCtx } = ctx;

    const newBusinessData = await fetchNewBusinessData(eAppId, logCtx);

    logTrace(`${LOG_PREFIX} Got eApp from new business`, {
        ...logCtx,
        eApp: newBusinessData,
    });

    const newClientCasePayload = await buildClientCaseFromNewBusiness(
        newBusinessData,
        eAppId,
        logCtx
    );

    const isConversion =
        newClientCasePayload.transactionType === TransactionType.CONVERSION;

    logTrace(
        isConversion
            ? `${LOG_PREFIX} Conversion detected`
            : `${LOG_PREFIX} Non-Conversion detected`,
        logCtx
    );

    // Check additional required fields if it's a conversion
    if (isConversion) {
        validateConversionPayload(newClientCasePayload);
    }

    // If sexAtBirth is missing, return props to pre-populate the form
    if (!newClientCasePayload.insuredDetails?.sexAtBirth) {
        logTrace(
            `${LOG_PREFIX} Detected missing sexAtBirth for non-coversion`,
            logCtx
        );
        return {
            props: {
                clientCase: merge(
                    // Serialize Date fields
                    JSON.parse(JSON.stringify(newClientCasePayload)),
                    { insuredDetails: { sexAtBirth: 'MALE' } }
                ),
            },
        };
    }

    // Create the client case
    const newCaseResponse = await createClientCase(
        newClientCasePayload,
        accessToken,
        logCtx
    );

    if (!newCaseResponse) {
        throwTypedError(
            'Client case was not created',
            CLIENT_CASE_MANAGER_API_ORIGIN
        );
    }

    logInfo(`${LOG_PREFIX} Client case created from eApp`, {
        ...logCtx,
        clientCaseId: newCaseResponse.id,
    });

    const redirection = buildSuccessRedirection(
        newCaseResponse,
        newBusinessData
    );

    logTrace(`${LOG_PREFIX} Redirect user to new client case page`, {
        ...logCtx,
        redirection: redirection.redirect,
    });

    return redirection;
};

/**
 * Fetches and validates the New Business data for an eAppId.
 * Throws typed errors if the data is not found or invalid.
 */
const fetchNewBusinessData = async (
    eAppId: string,
    logCtx: LoggingContext
): Promise<NewBusiness> => {
    const newBusinessResponseObject = await getNewBusinessById(eAppId, logCtx);

    if (isEmptyObject(newBusinessResponseObject)) {
        throwTypedError('New Business not found', NEW_BUSINESS_API_ORIGIN);
    }
    if (isNewBusinessErrorResponse(newBusinessResponseObject)) {
        throwTypedError(
            newBusinessResponseObject.message,
            NEW_BUSINESS_API_ORIGIN
        );
    }

    return newBusinessResponseObject;
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
