import { ConditionalExcept, Simplify, ValueOf } from 'type-fest';
import { Infer, t } from 'typegate';

import { RiderName } from '@deps/types/illustrations';
import { Product, ProductTypes } from '@deps/types/product';

import { NoParamRider, PremiumFreeRider, RiderWithFaceAmount } from './config';

export type NumberRange = [number, number];
export type NumberOrRange = NumberRange | number;

const quickQuoteParamsBaseSchema = t.object(
    t.optionalProperty('productType', t.enum(ProductTypes)),
    t.property('insuredAge', t.number),
    t.property('sexAtBirth', t.union(t.literal('M'), t.literal('F'))),
    t.property('nicotineUser', t.boolean),
    t.property('state', t.string),
    t.property('faceAmount', t.number)
);

const quickQuoteParamsRidersSchema = t.object(
    t.property('riders', t.record(t.string, t.union(t.number, t.boolean))),
    t.property('premiumFreeRiders', t.record(t.string, t.union(t.boolean)))
);

/**
 * Schema for the QuickQuote inputs
 */
export const quickQuoteParamsSchema = t.intersection(
    quickQuoteParamsBaseSchema,
    quickQuoteParamsRidersSchema
);

/**
 * Type for the QuickQuote inputs
 */
export type QuickQuoteParams = Simplify<Infer<typeof quickQuoteParamsSchema>>;

export type SerializedQuickQuoteParams = Simplify<
    {
        [K in keyof ConditionalExcept<QuickQuoteParams, object>]: string;
    } & {
        [K in RiderWithFaceAmount as `riders.${K}`]+?: string;
    } & {
        [K in NoParamRider as `riders.${K}`]+?: 'true' | 'false';
    } & {
        [K in PremiumFreeRider as `premiumFreeRiders.${K}`]+?: 'true' | 'false';
    }
>;

type a = keyof QuickQuoteParams['riders'];

export const RIDER_FIELD_TYPES = {
    NO_PARAMS: 'NO_PARAMS',
    WITH_FACE_AMOUNT: 'WITH_FACE_AMOUNT',
} as const;

export type RiderFieldType = ValueOf<typeof RIDER_FIELD_TYPES>;

type RiderFieldBase = {
    type: RiderFieldType;
    enabled: boolean;
};

type RiderTypeSpecificFields = {
    NO_PARAMS: object;
    WITH_FACE_AMOUNT: {
        faceAmount: number | undefined;
    };
};

export type RiderFieldMap = {
    [K in keyof RiderTypeSpecificFields]: Simplify<
        RiderFieldBase & {
            type: K;
        } & RiderTypeSpecificFields[K]
    >;
};

export type RiderField = ValueOf<RiderFieldMap>;

type QuickQuoteRidersFormState = Record<
    RiderWithFaceAmount,
    RiderFieldMap['WITH_FACE_AMOUNT']
> &
    Record<NoParamRider, RiderFieldMap['NO_PARAMS']>;

type QuickQuotePremiumFreeRidersFormState = Record<PremiumFreeRider, boolean>;

/**
 * Quick Quote Form State
 */
export type QuickQuoteFormState = Simplify<
    Infer<typeof quickQuoteParamsBaseSchema> & {
        riders: QuickQuoteRidersFormState;
        premiumFreeRiders: QuickQuotePremiumFreeRidersFormState;
    }
>;

export interface QuickQuoteResultBase {
    productType: ProductTypes;
    product: Product;
}

export interface TermQuickQuoteResult extends QuickQuoteResultBase {
    productType: ProductTypes.TERM;
    data: TermQuickQuoteResultData;
}

export interface TermQuickQuoteResultData {
    totalPremiumRange: {
        termLength: number;
        range: NumberOrRange;
    }[];
    basePremiumRange: {
        termLength: number;
        range: NumberOrRange;
    }[];
    riders: Record<RiderName, NumberOrRange | boolean>;
}

export type QuickQuoteResult = TermQuickQuoteResult;

export const isTermResult = (
    result: QuickQuoteResult
): result is TermQuickQuoteResult => result.productType === ProductTypes.TERM;
