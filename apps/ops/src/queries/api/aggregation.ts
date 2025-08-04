import { BankAccount } from '@xd/api-types/dist/generated-types/sor';
import { AxiosResponse } from 'axios';

import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { client } from '../api-utils/client';

type GetPaymentMethodsRequest = {
    planCode: string;
    policyNumber: string;
    partyId: string;
};

type GetPaymentMethodsProps = Omit<
    GetPaymentMethodsRequest,
    'timestamp' | 'postMessagePmDetailsOrigin'
>;

type GetPaymentMethodsResponse =
    | {
          data: BankAccount[];
          error: null;
      }
    | {
          data: null;
          error: {
              status: number;
              name: string;
              message: string;
          };
      };
export const getPaymentMethods = async ({
    planCode,
    policyNumber,
    partyId,
}: GetPaymentMethodsProps): Promise<BankAccount[] | Error> => {
    try {
        browserLogInfo('aggregation::getPaymentMethods', {
            policyNumber,
            planCode,
            partyId,
            file: 'queries/api/aggregation.ts',
        });
        const response = await client.post<
            GetPaymentMethodsRequest,
            AxiosResponse<GetPaymentMethodsResponse>
        >(
            `/api/aggregation/paymentmethods`,
            {
                planCode,
                policyNumber,
                partyId,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.data.data) {
            throw new Error(
                'No data returned trying to retrieve payment methods.'
            );
        }
        return response.data.data;
    } catch (e) {
        browserLogError('aggregation::getPaymentMethods', {
            ...parseErrorInformation(e),
            policyNumber,
            planCode,
            file: 'queries/api/aggregation.ts',
        });

        return new Error(
            `Error fetching payment methods for ${planCode} ${policyNumber}`
        );
    }
};
