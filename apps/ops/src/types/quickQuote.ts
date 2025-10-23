import { Prettify } from '@deps/utils/types';

import { RIDER_NAMES } from './illustrations';

type QuickQuoteRidersWithoutFaceAmount = {
    [RIDER_NAMES.WAIVER_OF_PREMIUM]: boolean;
    [RIDER_NAMES.ACCELERATED_DEATH_BENEFIT_FOR_TERMINAL_ILLNESS]: boolean;
    [RIDER_NAMES.CHARITABLE_GIVING]: boolean;
};

type RidersWithFaceAmount = {
    [RIDER_NAMES.ACCIDENTAL_DEATH_BENEFIT]: boolean;
    [RIDER_NAMES.CHILDRENS_TERM]: boolean;
};

type RiderAmounts = {
    [K in keyof RidersWithFaceAmount as `${K}Amount`]: number | undefined;
};

export type QuickQuoteRiders = Prettify<
    QuickQuoteRidersWithoutFaceAmount & RidersWithFaceAmount & RiderAmounts
>;

export type QuickQuoteFormData = {
    age?: number;
    sexAtBirth: 'M' | 'F';
    nicotineUser: boolean;
    state?: string;
    faceAmount?: number;
    riders: QuickQuoteRiders;
};
