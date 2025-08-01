import { filterNullAndUndefined } from './object.helpers';

const testObj = {
    amount: 1000,
    claimStatus: true,
    coverageId: 'yolo',
    effectiveDate: '2024-12-31',
    indicatorCode: 'yolo',
    maximumChronicIllnessBenefitPercentage: null,
    maximumCriticalIllnessBenefitPercentage: null,
    maximumPeriodicPaymentPeriod: undefined,
    yolo: {
        taylor: null,
        swift: null,
    },
    charge: {
        something: '42',
        else: undefined,
        testing: [],
        deep: {
            test: [],
        },
    },
    babel: [{ fish: undefined }, { beeblebrox: 42, flatExtra: [] }],
    test: [],
};

describe('.filterNullAndUndefined', () => {
    it('removes undefined or null values from object', () => {
        const result = filterNullAndUndefined(testObj);
        expect(result).toStrictEqual({
            amount: 1000,
            claimStatus: true,
            coverageId: 'yolo',
            effectiveDate: '2024-12-31',
            indicatorCode: 'yolo',
            charge: { something: '42' },
            babel: [{ beeblebrox: 42 }],
        });
    });

    it('returns a new object', () => {
        const test = { something: 'wicked' };
        const result = filterNullAndUndefined(test);
        expect(result).not.toBe(test);
    });
});
