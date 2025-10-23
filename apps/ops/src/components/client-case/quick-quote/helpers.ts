import { numberFormatify } from '@deps/helpers/numbers.helpers';

import {
    NO_PARAM_RIDERS,
    PREMIUM_FREE_RIDERS,
    RIDERS_WITH_FACE_AMOUNT,
} from './config';
import {
    NumberOrRange,
    QuickQuoteFormState,
    QuickQuoteParams,
    SerializedQuickQuoteParams,
} from './types';

const withPeriodText = (formatted: string, period: string | undefined) => {
    if (!period) {
        return formatted;
    }

    return `${formatted}/${period}`;
};

export const buildRangeText = (
    value: NumberOrRange,
    period: string | undefined
) => {
    if (typeof value === 'number') {
        const formatted = numberFormatify(value);
        return withPeriodText(formatted, period);
    }

    const formatted = value.map((x) => numberFormatify(x));
    return withPeriodText(formatted.join(' — '), period);
};

export const serializeQuickQuoteParams = ({
    insuredAge,
    sexAtBirth,
    nicotineUser,
    state,
    faceAmount,
    riders,
    premiumFreeRiders,
}: QuickQuoteParams): SerializedQuickQuoteParams => {
    const ridersEntries = [
        ...RIDERS_WITH_FACE_AMOUNT.map(
            (riderName) =>
                [`riders.${riderName}`, riders[riderName]?.toString()] as const
        ),
        ...NO_PARAM_RIDERS.map(
            (riderName) =>
                [`riders.${riderName}`, riders[riderName]?.toString()] as const
        ),
        ...PREMIUM_FREE_RIDERS.map(
            (riderName) =>
                [
                    `premiumFreeRiders.${riderName}`,
                    premiumFreeRiders[riderName]?.toString(),
                ] as const
        ),
    ].filter(([, value]) => value && value !== 'false');

    return {
        sexAtBirth,
        state,
        insuredAge: insuredAge.toString(),
        nicotineUser: nicotineUser ? 'true' : 'false',
        faceAmount: faceAmount.toString(),
        ...Object.fromEntries(ridersEntries),
    };
};
