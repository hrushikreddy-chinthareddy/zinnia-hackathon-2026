import { numberFormatify } from '@deps/helpers/numbers.helpers';

import { NumberOrRange } from './types';

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
