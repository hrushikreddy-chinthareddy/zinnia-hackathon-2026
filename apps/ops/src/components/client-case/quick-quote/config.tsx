import { RiderName, RIDER_NAMES } from '@deps/types/illustrations';

import type { TupleToUnion } from 'type-fest';

export const PREMIUM_FREE_RIDERS = [
    RIDER_NAMES.ACCELERATED_DEATH_BENEFIT_FOR_TERMINAL_ILLNESS,
    RIDER_NAMES.CHARITABLE_GIVING,
] as const satisfies RiderName[];

export const RIDERS_WITH_FACE_AMOUNT = [
    RIDER_NAMES.ACCIDENTAL_DEATH_BENEFIT,
    RIDER_NAMES.CHILDRENS_TERM,
] as const satisfies RiderName[];

export const NO_PARAM_RIDERS = [
    RIDER_NAMES.WAIVER_OF_PREMIUM,
] as const satisfies RiderName[];

export type PremiumFreeRider = TupleToUnion<typeof PREMIUM_FREE_RIDERS>;
export type RiderWithFaceAmount = TupleToUnion<typeof RIDERS_WITH_FACE_AMOUNT>;
export type NoParamRider = TupleToUnion<typeof NO_PARAM_RIDERS>;
