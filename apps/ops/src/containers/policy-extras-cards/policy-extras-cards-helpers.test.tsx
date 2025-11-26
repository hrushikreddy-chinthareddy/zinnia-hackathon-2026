import { filterNullAndUndefined } from '@deps/components/dynamic-form/helpers/object.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { Rider, Status } from '@deps/models/policy/sor-policy';
import { mockT as t } from '@deps/setupTests';
import { RiderType } from '@zinnia/api-types/types/sor';

import {
    cardFieldReducer,
    convertToString,
    formatBooleanToString,
    formatData,
    formatNumberToCurrency,
    formatPercentageToString,
    getTranslationValues,
} from './policy-extras-cards-helpers';

const baseRider = {
    amount: 1000,
    charge: {
        riderExerciseCharge: 10,
        riderExerciseChargeRate: 5,
    },
    claimStatus: true,
    coverageId: 'yolo',
    effectiveDate: '2024-12-31',
    indicatorCode: 'yolo',
    maximumChronicIllnessBenefitPercentage: undefined,
    maximumCriticalIllnessBenefitPercentage: undefined,
    maximumPeriodicPaymentPeriod: undefined,
    nextEvaluationDate: undefined,
    riderCode: 'Rider_XXXX',
    riderElected: undefined,
    riderMinimumPaymentAmount: undefined,
    riderName: 'Taylor',
    riderParticipant: [
        {
            insuredAgeAtIssue: 42,
            insuredId: 'tay',
        },
    ],
    riderPaymentDate: undefined,
    status: 'ACTIVE' as Status,
    terminalRiderPaymentAmount: undefined,
    terminationDate: undefined,
    tierOneCriticalRiderPaymentAmount: undefined,
    tierOneCriticalRiderPaymentDate: undefined,
    tierOneMaximumCriticalIllnessBenefitAmount: undefined,
    tierOneMaximumCriticalIllnessBenefitPercentage: undefined,
    tierTwoCriticalRiderPaymentAmount: undefined,
    tierTwoCriticalRiderPaymentDate: undefined,
    tierTwoMaximumCriticalIllnessBenefitAmount: undefined,
    tierTwoMaximumCriticalIllnessBenefitPercentage: undefined,
    timestamp: undefined,
    type: RiderType.RIDER,
} as Rider;

const testStrings: [string | boolean | number, string][] = [
    [true, 'true'],
    [100000, '100000'],
    ['1111/1', '1111/1'],
    [false, 'false'],
    [100.0, '100'],
];

const mockConfig = {
    currency: formatNumberToCurrency,
    number: convertToString,
    date: convertKebabedDateString,
    percentage: formatPercentageToString,
    boolean: formatBooleanToString,
};

const testConfig = [
    [
        'formatNumberToCurrency',
        {
            key: 'currency',
            value: 100,
            expected: '$100.00',
        },
    ],
    [
        'convertToString',
        {
            key: 'number',
            value: 100,
            expected: '100',
        },
    ],
    [
        'convertKebabedDateString',
        {
            key: 'date',
            value: '2024-12-25',
            expected: '12/25/2024',
        },
    ],
    [
        'formatPercentageToString',
        {
            key: 'percentage',
            value: 100,
            expected: '100%',
        },
    ],
    [
        'formatBooleanToString',
        {
            key: 'boolean',
            value: true,
            expected: 'general.true',
        },
    ],
];

jest.mock('next-i18next', () => ({
    i18n: {
        t: t,
    },
}));

describe('.cardFieldReducer', () => {
    it('returns a list of components based off of an obj', () => {
        const data = Object.entries(filterNullAndUndefined(baseRider));
        const result = data
            .map((item) =>
                cardFieldReducer(t, 'USD', <div>yolo</div>, 'riders')([], item)
            )
            .flat();

        expect(result).toStrictEqual([
            {
                key: 'riders-card-amount-field',
                label: 'riders.amount',
                testId: 'riders-card-amount',
                details: '$1,000.00',
            },
            {
                details: [
                    {
                        details: '$10.00',
                        key: 'riders-card-riderExerciseCharge-field',
                        label: 'riders.riderExerciseCharge',
                        testId: 'riders-card-riderExerciseCharge',
                    },
                    {
                        details: '5',
                        key: 'riders-card-riderExerciseChargeRate-field',
                        label: 'riders.riderExerciseChargeRate',
                        testId: 'riders-card-riderExerciseChargeRate',
                    },
                ],
                key: 'riders-card-parent-charge',
                label: 'riders.charge',
                testId: 'riders-card-parent-charge',
            },
            {
                key: 'riders-card-claimStatus-field',
                label: 'riders.claimStatus',
                testId: 'riders-card-claimStatus',
                details: 'general.true',
            },
            {
                key: 'riders-card-coverageId-field',
                label: 'riders.coverageId',
                testId: 'riders-card-coverageId',
                details: 'yolo',
            },
            {
                key: 'riders-card-effectiveDate-field',
                label: 'riders.effectiveDate',
                testId: 'riders-card-effectiveDate',
                details: '12/31/2024',
            },
            {
                key: 'riders-card-indicatorCode-field',
                label: 'riders.indicatorCode',
                testId: 'riders-card-indicatorCode',
                details: 'yolo',
            },
            {
                key: 'riders-card-riderCode-field',
                label: 'riders.riderCode',
                testId: 'riders-card-riderCode',
                details: 'Rider_XXXX',
            },
            {
                key: 'riders-card-riderName-field',
                label: 'riders.riderName',
                testId: 'riders-card-riderName',
                customContent: <div>yolo</div>,
                details: '',
            },
            {
                details: [
                    {
                        details: '42',
                        key: 'riders-card-insuredAgeAtIssue-field',
                        label: 'riders.insuredAgeAtIssue',
                        testId: 'riders-card-insuredAgeAtIssue',
                    },
                    {
                        details: 'tay',
                        key: 'riders-card-insuredId-field',
                        label: 'riders.insuredId',
                        testId: 'riders-card-insuredId',
                    },
                ],
                key: 'riders-card-parent-riderParticipant',
                label: 'riders.riderParticipant',
                testId: 'riders-card-parent-riderParticipant',
            },
            {
                key: 'riders-card-status-field',
                label: 'riders.status',
                testId: 'riders-card-status',
                details: 'policy.extras.riders.statusValues.ACTIVE',
            },
            {
                key: 'riders-card-type-field',
                label: 'riders.type',
                testId: 'riders-card-type',
                details: 'RIDER',
            },
        ]);
    });
});

describe('.formatBooleanToString', () => {
    it('converts FALSE to string', () => {
        const result = formatBooleanToString(false);
        expect(result).toBe('general.false');
    });

    it('converts TRUE to string', () => {
        const result = formatBooleanToString(true);
        expect(result).toBe('general.true');
    });
});

describe('.formatNumberToCurrency', () => {
    it('formats number to currency', () => {
        const result = formatNumberToCurrency(1000, 'USD');
        expect(result).toBe('$1,000.00');
    });
});

describe('.formatPercentageToString', () => {
    it('formats number to percentage', () => {
        const result = formatPercentageToString(100);
        expect(result).toBe('100%');
    });
});

describe('.getTranslationValues', () => {
    it('returns a translation path', () => {
        const result = getTranslationValues('test.taylor.swift')('yolo');
        expect(result).toBe('test.taylor.swift.yolo');
    });
});

describe('.convertToString', () => {
    test.each(testStrings)('formats %s value to string', (value, expected) => {
        expect(convertToString(value)).toBe(expected);
    });
});

describe('.formatData', () => {
    test.each(testConfig)(
        '%s formats value',
        // @ts-expect-error typing error expected for mockConfig
        (_config, { key, value, expected }) => {
            expect(formatData(key, value, mockConfig)).toBe(expected);
        }
    );
});
