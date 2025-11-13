import { getAccessToken } from '@auth0/nextjs-auth0';
import { Policy } from '@xd/api-types/dist/generated-types/sor';

import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { updateIdentificationsFromPolicy } from '@deps/queries/api-utils/policy-helper';
import { requestHandler } from '@deps/queries/api-utils/server';
import {
    logInfo,
    logWarn,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();

        const accessToken = (await getAccessToken(req, res)).accessToken;

        logInfo('beneChangeTransaction::initial');

        const {
            operation,
            useNewApi = false,
            planCode,
            policyNumber,
            body,
        } = req.body;

        const loggingContext = { ...logCtx, planCode, policyNumber };

        let targetUrl = '';

        switch (operation) {
            case 'validateBene':
                targetUrl = useNewApi
                    ? `${apiServerBaseUrl}/bpm/v1/policies/${planCode}/${policyNumber}/PrimaryBeneficiary/validation`
                    : `${apiServerBaseUrl}/webnonfinancial/nonfinancial/v1/transactions/bene/validation`;
                break;
            case 'addBeneChangeTransaction':
                targetUrl = useNewApi
                    ? `${apiServerBaseUrl}/bpm/v1/policies/${planCode}/${policyNumber}/PrimaryBeneficiary`
                    : `${apiServerBaseUrl}/webnonfinancial/nonfinancial/v1/transactions`;
                break;
            default:
                logWarn(`beneChangeTransaction::Unknown operation`, {
                    operation,
                    ...loggingContext,
                });
                return res.status(400).json({ message: 'Unknown operation' });
        }

        logInfo(`beneChangeTransaction::${policyNumber}::${operation}::entry`, {
            ...loggingContext,
            targetUrl,
            duration: performance.now() - now,
        });

        try {
            const policy = await getPolicyDetailsSsr(
                policyNumber,
                planCode,
                accessToken,
                loggingContext,
                true
            );

            const updatedBody = updateIdentificationsFromPolicy(
                policy as Policy,
                body || {}
            );

            req.body = updatedBody || {};

            logInfo(
                `beneChangeTransaction::${policyNumber}::${operation}::start`,
                {
                    ...loggingContext,
                    targetUrl,
                    duration: performance.now() - now,
                }
            );

            return await requestHandler(targetUrl, req, res, loggingContext);
        } catch (error) {
            logWarn(
                `beneChangeTransaction::${policyNumber}::${operation}::failure`,
                {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                    duration: performance.now() - now,
                }
            );

            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    {
        file: 'api/nonfinancial/beneChangeTransaction',
        function: 'routeHandler',
    }
);
