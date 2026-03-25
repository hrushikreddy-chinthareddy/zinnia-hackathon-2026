import { getAccessToken } from '@auth0/nextjs-auth0';

import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { updateIdentificationsFromPolicyForPayee } from '@deps/queries/api-utils/policy-helper';
import { requestHandler } from '@deps/queries/api-utils/server';
import {
    logInfo,
    logWarn,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();

        const accessToken = (await getAccessToken(req, res)).accessToken;

        logInfo('payeeChangeTransaction::initial');

        const { operation, planCode, policyNumber, body } = req.body;

        const loggingContext = { ...logCtx, planCode, policyNumber };

        let targetUrl = '';

        switch (operation) {
            case 'validatePayee':
                targetUrl = `${apiServerBaseUrl}/bpm/v1/policies/${planCode}/${policyNumber}/parties/payee/validation`;
                break;
            case 'addPayeeChangeTransaction':
                targetUrl = `${apiServerBaseUrl}/bpm/v1/policies/${planCode}/${policyNumber}/parties/payee`;
                break;
            default:
                logWarn(`payeeChangeTransaction::Unknown operation`, {
                    operation,
                    ...loggingContext,
                });
                return res.status(400).json({ message: 'Unknown operation' });
        }

        logInfo(
            `payeeChangeTransaction::${policyNumber}::${operation}::entry`,
            {
                ...loggingContext,
                targetUrl,
                duration: performance.now() - now,
            }
        );

        try {
            const policy = await getPolicyDetailsSsr(
                policyNumber,
                planCode,
                accessToken,
                loggingContext,
                true
            );

            const updatedBody = updateIdentificationsFromPolicyForPayee(
                policy as Policy,
                body || {}
            );

            req.body = updatedBody || {};

            logInfo(
                `payeeChangeTransaction::${policyNumber}::${operation}::start`,
                {
                    ...loggingContext,
                    targetUrl,
                    duration: performance.now() - now,
                }
            );

            return await requestHandler(targetUrl, req, res, loggingContext);
        } catch (error) {
            logWarn(
                `payeeChangeTransaction::${policyNumber}::${operation}::failure`,
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
        file: 'api/nonfinancial/payeeChangeTransaction',
        function: 'routeHandler',
    }
);
