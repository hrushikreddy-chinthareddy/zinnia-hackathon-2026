// https://qa.api.zinnia.io/aggregation/v1/policies/{planCode}/{policyNumber}/paymentmethods

import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { aggregationApiBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { sanitizeBankDetails } from '@deps/utils/sanitizers';
import {
    logError,
    logTrace,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';
import { BankAccount } from '@zinnia/api-types/types/sor';

export type PaymentMethodError = {
    data: null;
    error: {
        status: number;
        name: string;
        message: string;
    };
};

export type PaymentMethodResponse =
    | {
          data: BankAccount[];
          error: null;
      }
    | PaymentMethodError;

export type IError = {
    status: number;
    name: string;
    message: string;
    data: {
        message: string;
    };
};
export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<PaymentMethodResponse>,
        loggingContext
    ) => {
        const now = performance.now();
        logTrace('paymentus::start', loggingContext);

        try {
            const accessToken = (await getAccessToken(req, res)).accessToken;

            const {
                planCode,
                policyNumber,
                partyId,
                timestamp: _t,
                postMessagePmDetailsOrigin: _p,
                pmCategory: _pm,
            } = req.body;

            const url = `${aggregationApiBaseUrl}/policies/${planCode}/${policyNumber}/paymentmethods?partyId=${partyId}`;

            const response = await serverApi.get<
                null,
                AxiosResponse<BankAccount[]>
            >(
                url,
                {
                    authorization: `Bearer ${accessToken}`,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                loggingContext
            );

            logTrace('paymentus::end', {
                ...loggingContext,
                duration: performance.now() - now,
            });

            const bankDetails = response.data;

            const sanitizedBankDetails = sanitizeBankDetails(bankDetails);

            if (!response.data || !sanitizedBankDetails) {
                throw new Error(
                    'No data returned trying to retrieve payment methods.'
                );
            }

            return res.json({
                data: sanitizedBankDetails,
                error: null,
            });
        } catch (error) {
            logError('paymentus::error', {
                ...parseErrorInformation(error),
                requestUrl: 'paymentus-package',
                duration: performance.now() - now,
                ...loggingContext,
            });

            return res.status((error as IError).status || 500).json({
                data: null,
                error: {
                    status: (error as IError).status || 500,
                    name:
                        (error as IError).data.message ||
                        'Internal Server Error',
                    message:
                        (error as IError).data.message ||
                        'Internal Server Error',
                },
            } as PaymentMethodError);
        }
    },
    {
        file: 'paymentus/index',
        function: 'routeHandler',
    }
);
