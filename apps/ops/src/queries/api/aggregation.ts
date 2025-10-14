import { BankDetailList } from '@zinnia/api-types/types/aggregation';
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
          data: BankDetailList;
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
}: GetPaymentMethodsProps): Promise<BankDetailList | Error> => {
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

interface GetPaymentFormsProps extends GetPaymentMethodsProps {
    carrier?: string;
    transactionName?: string;
}
export const getPaymentForms = async ({
    planCode,
    policyNumber,
    partyId,
    carrier,
    transactionName,
}: GetPaymentFormsProps): Promise<any | Error> => {
    const transaction = transactionName
        ? `${transactionName}`
        : 'SystematicProgramSetup';
    try {
        browserLogInfo(
            `aggregation::getPaymentForms:${transaction}/paymentforms`,
            {
                policyNumber,
                planCode,
                partyId,
                carrier,
                file: 'queries/api/aggregation.ts',
            }
        );
        const response = await client.get<
            any,
            AxiosResponse<GetPaymentMethodsResponse>
        >(
            `/api/bpm/v1/policies/${
                carrier ?? 'WELB'
            }/${planCode}/${transaction}/paymentforms`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.data) {
            throw new Error(
                'No data returned trying to retrieve payment methods.'
            );
        }
        return response.data;
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
