import { ConditionalExcept, Simplify, TupleToUnion, ValueOf } from 'type-fest';
import { Infer, t } from 'typegate';

import { USStates } from '@deps/constants/geography/us-states';
import { RIDER_NAMES, RiderName } from '@deps/types/illustrations';
import { Product, ProductTypes } from '@deps/types/product';
import {
    IneligibilityReason,
    nonEligibleReasonByClass,
} from '@deps/utils/quick-quotes-rules/types';

export type NumberRange = [number, number];
export type NumberOrRange = NumberRange | number;

/**
 *
 * Riders that require a face amount value for calculation
 */
export const RIDERS_WITH_FACE_AMOUNT = [
    RIDER_NAMES.ACCIDENTAL_DEATH_BENEFIT,
    RIDER_NAMES.CHILDRENS_TERM,
] as const satisfies RiderName[];

/**
 *
 * Normal riders (non-free) with no parameters
 */
export const NO_PARAM_RIDERS = [
    RIDER_NAMES.WAIVER_OF_PREMIUM,
] as const satisfies RiderName[];

/**
 *
 * Riders for the premium-free section (no parameters)
 */
export const PREMIUM_FREE_RIDERS = [
    RIDER_NAMES.ACCELERATED_DEATH_BENEFIT_FOR_TERMINAL_ILLNESS,
    RIDER_NAMES.CHARITABLE_GIVING,
] as const satisfies RiderName[];

export type RiderWithFaceAmount = TupleToUnion<typeof RIDERS_WITH_FACE_AMOUNT>;
export type NoParamRider = TupleToUnion<typeof NO_PARAM_RIDERS>;
export type PremiumFreeRider = TupleToUnion<typeof PREMIUM_FREE_RIDERS>;

/**
 *
 * Mapping for resolving rider names to calc-engine rider codes
 */
export const RIDER_CODE_MAP = {
    [RIDER_NAMES.ACCIDENTAL_DEATH_BENEFIT]: 'Rider_ADR',
    [RIDER_NAMES.CHILDRENS_TERM]: 'Rider_CTR',
    [RIDER_NAMES.WAIVER_OF_PREMIUM]: 'Rider_WPR',
    [RIDER_NAMES.ACCELERATED_DEATH_BENEFIT_FOR_TERMINAL_ILLNESS]:
        'Rider_ABRTRM',
    [RIDER_NAMES.CHARITABLE_GIVING]: 'Rider_CGR',
} as const satisfies Record<
    PremiumFreeRider | RiderWithFaceAmount | NoParamRider,
    string
>;

const quickQuoteParamsBaseSchema = t.object(
    t.optionalProperty('productType', t.enum(ProductTypes)),
    t.property('insuredAge', t.number),
    t.property('sexAtBirth', t.union(t.literal('M'), t.literal('F'))),
    t.property('nicotineUser', t.boolean),
    t.property('state', t.enum(USStates)),
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

interface QuickQuoteNotAvailableBaseItem {
    range: undefined;
    notAvailabilityReasonField?: nonEligibleReasonByClass[] | undefined;
}

export interface QuickQuoteResultBase {
    productType: ProductTypes;
    planCode: string;
    product: Product;
}

export interface TermQuickQuoteResult extends QuickQuoteResultBase {
    productType: ProductTypes.TERM;
    data: TermQuickQuoteResultData;
}

interface TermQuickQuoteBaseDataItem {
    termLength: number;
}

interface TermQuickQuoteAvailableDataItem extends TermQuickQuoteBaseDataItem {
    range: NumberOrRange;
}

interface TermQuickQuoteNotAvailableItem
    extends TermQuickQuoteBaseDataItem,
        QuickQuoteNotAvailableBaseItem {}

export type TermQuickQuoteRiderNotAvailableItem = {
    termLengths: number[];
    reasons?: IneligibilityReason[] | undefined;
};

type TermQuickQuoteDataItem =
    | TermQuickQuoteAvailableDataItem
    | TermQuickQuoteNotAvailableItem;

export type TermQuickQuoteRiderDataItem = {
    range?: NumberOrRange | boolean;
    notAvailabilityReasonField?: TermQuickQuoteRiderNotAvailableItem[];
};

export interface TermQuickQuoteResultData {
    totalPremiumRange: TermQuickQuoteDataItem[];
    basePremiumRange: TermQuickQuoteDataItem[];
    riders: Partial<Record<RiderName, TermQuickQuoteRiderDataItem>>;
}

export type QuickQuoteResult = TermQuickQuoteResult;

export const isTermResult = (
    result: QuickQuoteResult
): result is TermQuickQuoteResult => result.productType === ProductTypes.TERM;

export type PlainTermQuickQuoteRiderNotAvailableItem = {
    termLength: number;
    reason: IneligibilityReason;
};
