import { Simplify } from 'type-fest';

import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { ProductType, ProductTypes } from '@deps/types/product';

import {
    IllustrationInputsBase,
    IndexUniversalLifeScenario,
    responseMessage,
    TermLifeScenario,
} from './types';

type GetIllustrationResponseBody<T, TI = IllustrationInputsBase> = {
    inputs: TI;
    response: {
        id: string;
        assumed: T;
        messages: responseMessage[];
    };
};

type GetNewTermLifeIllustrationResponseBody =
    GetIllustrationResponseBody<TermLifeScenario>;
type GetIndexedUniversalLifeIllustrationResponseBody =
    GetIllustrationResponseBody<IndexUniversalLifeScenario>;

type IllustrationTypeMap = {
    TERM: GetNewTermLifeIllustrationResponseBody;
    INDEX_UNIVERSAL_LIFE: GetIndexedUniversalLifeIllustrationResponseBody;
};

export type Illustration = {
    [K in keyof IllustrationTypeMap]: Simplify<
        {
            productType: K;
        } & IllustrationTypeMap[K]
    >;
}[keyof IllustrationTypeMap];

type GetIllustrationResponseBodyUnion =
    | GetNewTermLifeIllustrationResponseBody
    | GetIndexedUniversalLifeIllustrationResponseBody;

export function isIULIllustrationResponseBody(
    data: GetIllustrationResponseBodyUnion
): data is GetIndexedUniversalLifeIllustrationResponseBody {
    return data.inputs.planCode === 'UL0101';
}

export function isTLIllustrationResponseBody(
    data: GetIllustrationResponseBodyUnion
): data is GetNewTermLifeIllustrationResponseBody {
    return data.inputs.planCode === 'TL0101';
}

const BASE_URL = `${baseAppUrl}/api/illustration/v3`;

export const getNewTermLifeIllustration = async (illustrationId: string) => {
    return client
        .get<GetNewTermLifeIllustrationResponseBody>(
            `${BASE_URL}/term-life/new-business/${illustrationId}`
        )
        .then((res) => {
            return {
                ...res.data,
                productType: ProductTypes.TERM as const satisfies ProductType,
            };
        });
};

export const getNewIndexedUniversalLifeIllustration = async (
    illustrationId: string
) => {
    return client
        .get<GetIndexedUniversalLifeIllustrationResponseBody>(
            `${BASE_URL}/indexed-universal-life/new-business/${illustrationId}`
        )
        .then((res) => {
            return {
                ...res.data,
                productType:
                    ProductTypes.INDEX_UNIVERSAL_LIFE as const satisfies ProductType,
            };
        });
};

export const getIllustrationAsyncCalculationStatus = async (
    illustrationId: string
) => {
    return client
        .get<any>(
            `${BASE_URL}/illustration-request/${illustrationId}?format=FORMATTED_ILLUSTRATION_PDF`
        )
        .then((res) => {
            return res;
        });
};
