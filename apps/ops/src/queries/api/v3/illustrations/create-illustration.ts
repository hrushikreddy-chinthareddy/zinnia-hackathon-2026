import { AxiosResponse } from 'axios';
import { ValueOf } from 'type-fest';

import { USStates } from '@deps/constants/geography/us-states';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { ProductTypes } from '@deps/types/product';

import {
    Coverage,
    IllustrationParty,
    responseMessage,
    TermLifeScenario,
} from './types';

type CreateIllustrationQueryBodyValue = unknown;

const BASE_URL = `${baseAppUrl}/api/illustration/v3`;

interface CreateIllustrationResponseBodyBase {
    id: string;
    messages: responseMessage[];
}

interface CreateIllustrationFailedResponseBody
    extends CreateIllustrationResponseBodyBase {}

interface CreateNewTermLifeIllustrationSuccessResponseBody
    extends CreateIllustrationResponseBodyBase {
    assumed: TermLifeScenario;
    guaranteed: TermLifeScenario;
}

type CreateNewTermLifeIllustrationResponseBody =
    | CreateIllustrationFailedResponseBody
    | CreateNewTermLifeIllustrationSuccessResponseBody;

export const CALCULATION_TYPE_MAP = {
    QUICK_QUOTE: 'QUICK_QUOTE',
    SINGLE_ILLUSTRATION: 'SINGLE_ILLUSTRATION',
    AGGREGATE_ILLUSTRATION: 'AGGREGATE_ILLUSTRATION',
    COMPOSITE_ILLUSTRATION: 'COMPOSITE_ILLUSTRATION',
    POLICY_PAGE_PROJECTION: 'POLICY_PAGE_PROJECTION',
    INITIAL_QUOTE: 'INITIAL_QUOTE',
} as const;

export type CalculationType = ValueOf<typeof CALCULATION_TYPE_MAP>;
export type TermFixedCostPeriod = 10 | 15 | 20 | 25 | 30;

type CreateNewTermLineIllustrationOptions = {
    solveFor: 'PREMIUM' | 'FACE' | 'NO_SOLVE';
    fixedCostPeriod: TermFixedCostPeriod;
    paymentMode:
        | 'DAILY'
        | 'EVERYTWOWEEKS'
        | 'MONTHLY'
        | 'SEMIANNUAL'
        | 'QUARTERLY'
        | 'ANNUAL'
        | 'SINGLEPAYMENT';
    paymentMethod?:
        | 'DTCC'
        | 'CREDITCARD'
        | 'ACH'
        | 'CHECK'
        | 'EXCHANGE'
        | 'WIRE';
};

export type CreateNewTermLineIllustrationPayload = {
    calculationType: CalculationType;
    source?: string;
    illustrationRequestDate: string;
    jurisdiction: USStates;
    planCode: string;
    coverages: Coverage[];
    parties: IllustrationParty[];
    options: CreateNewTermLineIllustrationOptions;
};

export type CreateNewTermLifeIllustrationResponse = {
    productType: ProductTypes.TERM;
    planCode: string;
    inputs: CreateNewTermLineIllustrationPayload;
    response: CreateNewTermLifeIllustrationResponseBody;
};

export const createIllustration = async ({
    bodyData,
    path,
}: {
    bodyData: CreateIllustrationQueryBodyValue;
    path: string;
}) => {
    return await client.post<any, AxiosResponse<any>>(
        `${baseAppUrl}/${path}`,
        bodyData
    );
};

export const createNewTermLifeIllustration = async (
    payload: CreateNewTermLineIllustrationPayload
): Promise<CreateNewTermLifeIllustrationResponse> => {
    return client
        .post<
            CreateNewTermLineIllustrationPayload,
            AxiosResponse<CreateNewTermLifeIllustrationResponseBody>
        >(`${BASE_URL}/term-life/new-business`, payload)
        .then((res) => ({
            productType: ProductTypes.TERM,
            planCode: payload.planCode,
            inputs: payload,
            response: res.data,
        }));
};
