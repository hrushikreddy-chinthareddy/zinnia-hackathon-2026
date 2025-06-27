import { AxiosResponse } from 'axios';

import {
    FundInformationByFundId,
    FundInformationByFundIdResponse,
    FundInformationByPlanCode,
    FundInformationByPlanCodeResponse,
} from '@deps/types/fund-information';
import { browserLogError } from '@deps/utils/browser-logging';

import { baseAppUrl } from '../api-config';
import { StatusCode } from '../api-utils/baseAPIClient';
import { client } from '../api-utils/client';

const baseUrl = baseAppUrl + '/api/funds/v1';

export const getFundInformationByFundId = async (
    carrierId?: string,
    fundId?: string
): Promise<FundInformationByFundIdResponse> => {
    if (!carrierId || !fundId) {
        browserLogError(
            'getFundInformationByFundId::missing carrierId or fundId',
            { carrierId, fundId }
        );

        return {
            data: {},
            message: 'missing carrierId or fundId',
            status: StatusCode.BadRequest,
        };
    }

    try {
        const response = await client.get<
            FundInformationByFundId,
            AxiosResponse
        >(`${baseUrl}/carriers/${carrierId}/funds/${fundId}`);

        return {
            data: response?.data,
            message: response?.statusText,
            status: response?.status,
        };
    } catch (error: any) {
        browserLogError(
            'getFundInformationByFundId::An error occurred while getting fund information by fundId',
            {
                carrierId,
                fundId,
                error: error,
            }
        );

        return {
            data: {},
            message: error,
            status: error?.response?.status,
        };
    }
};

export const getFundInformationByPlanCode = async (
    carrierId?: string,
    planCode?: string
): Promise<FundInformationByPlanCodeResponse> => {
    if (!carrierId || !planCode) {
        browserLogError(
            'getFundInformationByPlanCode::missing carrierId or planCode',
            { carrierId, planCode }
        );

        return {
            data: {},
            message: 'missing carrierId or plancode',
            status: StatusCode.BadRequest,
        };
    }

    try {
        const response = await client.get<
            FundInformationByPlanCode,
            AxiosResponse
        >(`${baseUrl}/carriers/${carrierId}/products/${planCode}`);

        return {
            data: response?.data,
            message: response?.statusText,
            status: response?.status,
        };
    } catch (error: any) {
        browserLogError(
            'getFundInformationByPlanCode::An error occurred while getting product funds',
            { carrierId, planCode, error }
        );

        return {
            data: {},
            message: error,
            status: error?.response?.status,
        };
    }
};
