import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

import {
    extractResponseFields,
    generateInitialPremiumRequest,
    generateIssueDate,
    getPolicyFilePath,
    updatePolicyXmlContent,
} from '@deps/queries/api/test-harness/utils';
import { policyApiBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { isProd } from '@deps/utils/environment.helpers';
import { pollEndpoint } from '@deps/utils/poll';
import {
    logCompliance,
    logError,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';
import {
    IssuanceRequestBody,
    IssuanceType,
    PolicyState,
} from '@deps/utils/test-harness/types';

//TODO: Split the handle initial premium and lifecycle methods into their own route handlers that can be called independently.

export interface IssuanceRequest extends NextApiRequest {
    body: IssuanceRequestBody;
}

interface SuccessResponse {
    data: any; // Customize this based on the actual data structure you expect
    error: null;
}

interface ErrorResponse {
    data: null;
    error: {
        message: string;
        data: {
            correlationId?: string;
            planCode: string;
            policyNumber: string;
        };
        status: number;
    };
}

type TestHarnessApiResponse = SuccessResponse | ErrorResponse;

//This needs to stay in the API directory because it uses the fs library
const getPolicyXmlContent = (type: IssuanceType): string => {
    const xmlFilePath = getPolicyFilePath(type);
    const xmlPath = path.join(
        process.cwd(),
        'src',
        'queries',
        'api',
        'test-harness',
        xmlFilePath
    );
    return fs.readFileSync(xmlPath, 'utf-8');
};

/**
 *
 * This is the main function that handles the policy logic and file reading. The actual endpoint is hit below in
 * the `withAuthAndLogging` block
 */
const handlePolicyIssuance = async (
    req: IssuanceRequest,
    res: NextApiResponse,
    loggingContext: any
) => {
    const { type, policyState, policyNumber } = req.body;

    if (!type) {
        return res.status(400).json({ error: 'Type is required.' });
    }
    const token = (await getAccessToken(req, res)).accessToken;
    const issueDate = generateIssueDate(policyState);
    const xmlContent = getPolicyXmlContent(type);
    const updatedXmlContent = updatePolicyXmlContent(
        xmlContent,
        req,
        policyNumber,
        issueDate
    );
    const responseFields = extractResponseFields(updatedXmlContent);

    console.log(`Updated XML content with policy number: ${updatedXmlContent}`);

    const url = `${process.env.NEXT_PUBLIC_SE2_BACKEND_URL}/policy/v1/issuance`;
    const headers = { 'Content-type': 'application/xml' };

    try {
        //TODO: We need to get the types for this API request
        const { data } = await serverApi.post<any, any>(
            url,
            updatedXmlContent,
            { headers, authorization: `Bearer ${token}` },
            loggingContext
        );

        logCompliance(
            'Test Harness Policy Creation successful.',
            loggingContext
        );
        return {
            ...data,
            policyNumber: responseFields.policyNumberField,
            planCode: responseFields.productCodeField,
            lineOfBusiness: responseFields.lineOfBusinessField,
        };
    } catch (error) {
        logError('test-harness/create-policy:: error', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        throw error;
    }
};

const handleInitialPremium = async (
    planCode: string,
    policyNumber: string,
    lineOfBusiness: string,
    policyState: PolicyState, // or pass in effective date
    req: IssuanceRequest,
    res: NextApiResponse,
    loggingContext: any
): Promise<TestHarnessApiResponse> => {
    const initialPremiumRequest = generateInitialPremiumRequest(
        policyNumber,
        lineOfBusiness,
        policyState
    );

    const url = `${process.env.NEXT_PUBLIC_SE2_BACKEND_URL}/policy/v1/policies/${planCode}/${policyNumber}/initialpremium`;
    const token = (await getAccessToken(req, res)).accessToken;

    try {
        const { data } = await serverApi.post<any, any>(
            url,
            initialPremiumRequest,
            { authorization: `Bearer ${token}` },
            loggingContext
        );
        logCompliance(
            'test-harness/handleInitialPremium:: success.',
            loggingContext
        );
        return {
            data: {
                ...data,
            },
            error: null,
        };
    } catch (error) {
        logError('test-harness/handleInitialPremium:: error', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return {
            data: null,
            error: {
                message: 'Initial premium failed to succeed',
                data: {
                    correlationId: initialPremiumRequest.correlationId,
                    planCode,
                    policyNumber,
                },
                status:
                    error instanceof AxiosError
                        ? error.response?.status || 500
                        : 500,
            },
        };
    }
};

/**
 * Lifecycles the policy based on the policyState that is used.
 * It will take the issue date and add a few days to lifecycle
 */
const handleLifeCycle = async (
    planCode: string,
    policyNumber: string,
    policyState: PolicyState,
    req: IssuanceRequest,
    res: NextApiResponse,
    loggingContext: any
): Promise<TestHarnessApiResponse> => {
    try {
        // Do not lifecycle pending issue
        if (policyState === PolicyState.PENDING_ISSUED) {
            return {
                data: null,
                error: null,
            };
        }
        const lifeCycleDate = dayjs()
            .startOf('day')
            .subtract(1, 'day')
            .toISOString();
        const url = `${process.env.NEXT_PUBLIC_SE2_BACKEND_URL}/policy/v1/lifecycle/${planCode}/${policyNumber}/${lifeCycleDate}`;
        const token = (await getAccessToken(req, res)).accessToken;

        const { data } = await serverApi.post<any, any>(
            url,
            {},
            { authorization: `Bearer ${token}` },
            loggingContext
        );

        logCompliance(
            'test-harness/handleLifeCycle:: success.',
            loggingContext
        );
        return {
            data: {
                ...data,
            },
            error: null,
        };
    } catch (error) {
        logError('test-harness/handleLifeCycle:: error', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return {
            data: null,
            error: {
                message: 'Life cycle failed to succeed',
                data: {
                    planCode,
                    policyNumber,
                },
                status:
                    error instanceof AxiosError
                        ? error.response?.status || 500
                        : 500,
            },
        };
    }
};

export default withAuthAndLogging(
    async (req: IssuanceRequest, res: NextApiResponse, loggingContext) => {
        if (req.method !== 'POST' || isProd()) {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

        const accessToken = (await getAccessToken(req, res)).accessToken;

        const { type, policyState } = req.body;

        try {
            const issuanceResponse = await handlePolicyIssuance(
                req,
                res,
                loggingContext
            );
            let initialPremiumResponse, lifecycleResponse;
            const { planCode, policyNumber } = issuanceResponse;

            //Poll every 6 seconds up to 10 times
            const poll: { message: string; data: any } = (await pollEndpoint(
                `${policyApiBaseUrl}/${planCode}/${policyNumber}?viewDetails=true`,
                6,
                10,
                accessToken || '',
                loggingContext
            )) as { message: string; data: any };

            if (type !== IssuanceType.UL && type !== IssuanceType.IUL) {
                if (poll.message === 'SUCCESS') {
                    console.log(
                        '....Waiting to handle initial premium cycle....'
                    );
                    initialPremiumResponse = await handleInitialPremium(
                        planCode,
                        policyNumber,
                        issuanceResponse.lineOfBusiness,
                        policyState,
                        req,
                        res,
                        loggingContext
                    );
                } else {
                    initialPremiumResponse = {
                        data: null,
                        error: {
                            message: 'Initial premium failed to succeed',
                            data: {
                                planCode,
                                policyNumber,
                            },
                            status: 500,
                        },
                    };
                }
            }

            if (policyState !== PolicyState.PENDING_ISSUED) {
                if (poll.message === 'SUCCESS') {
                    console.log('....Waiting to handle life cycle cycle....');
                    lifecycleResponse = await handleLifeCycle(
                        issuanceResponse.planCode,
                        issuanceResponse.policyNumber,
                        policyState,
                        req,
                        res,
                        loggingContext
                    );
                } else {
                    lifecycleResponse = {
                        data: null,
                        error: {
                            message: 'Life cycle failed to succeed',
                            data: {
                                planCode,
                                policyNumber,
                            },
                            status: 500,
                        },
                    };
                }
            }

            res.status(200).json({
                data: {
                    planCode: issuanceResponse.planCode,
                    policyNumber: issuanceResponse.policyNumber,
                    initialPremiumFailed: initialPremiumResponse?.error
                        ? true
                        : false,
                    lifecycleFailed: lifecycleResponse?.error ? true : false,
                },
            });
        } catch (error) {
            logError('test-harness/create-policy:: error', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(500).json({
                message: 'Error issuing policy',
            });
        }
    },
    { file: 'test-harness/create-policy', function: 'routeHandler' }
);
