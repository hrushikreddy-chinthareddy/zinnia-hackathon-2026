import { USStates } from '@deps/constants/geography/us-states';
import type { QuickQuoteParams } from '@deps/types/quickQuote';

import { QuickQuoteProducts } from './evaluate-quick-quote';
import { RULES_MODEL } from './rules';

const createParams = (
    overrides: Partial<QuickQuoteParams> = {}
): QuickQuoteParams =>
    ({
        state: 'CA',
        insuredAge: 35,
        nicotineUser: false,
        faceAmount: 100_000,
        riders: {
            accidentalDeathBenefit: 50_000,
            childrensTerm: 10_000,
            waiverOfPremium: true,
        },
        premiumFreeRiders: {},
        ...overrides,
    } as QuickQuoteParams);

describe('QuickQuoteProducts', () => {
    it('returns all products as unavailable when state is not covered', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        // @ts-expect-error: this a invalidate state to trigger the error
        const params = createParams({ state: 'NY' });

        const result = engine.getProductsAvailableFor(params);

        expect(result).toHaveLength(RULES_MODEL.products.length);

        for (const productResult of result) {
            expect(productResult.classCodes).toEqual([]);
            expect(productResult.notAvailabilityReasonField).toBe('state');
        }
    });

    it('returns min and max non-nicotine classes for an eligible non-smoker', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        const params = createParams({
            state: USStates.CALIFORNIA,
            insuredAge: 35,
            nicotineUser: false,
            faceAmount: 200_000,
        });

        const result = engine.getProductsAvailableFor(params);

        // Find Term Life 20 Yr result
        const tl20 = result.find(
            (p) => p.planCode === 'TL0101' && p.termLength === 20
        );
        expect(tl20).toBeDefined();

        expect(tl20!.classCodes).toEqual([
            'STANDARDNONTOBACCO',
            'ELITENONTOBACCO',
        ]);
        expect(tl20!.notAvailabilityReasonField).toBeUndefined();
    });

    it('sets notAvailabilityReasonField to "age" when age is out of range for all classes', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        const params = createParams({
            insuredAge: 80,
            faceAmount: 200_000,
        });

        const result = engine.getProductsAvailableFor(params);

        for (const productResult of result) {
            expect(productResult.classCodes).toEqual([]);
            expect(productResult.notAvailabilityReasonField).toBe('age');
        }
    });

    it('sets notAvailabilityReasonField to "face" when face amount is out of range but age is valid', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        const params = createParams({
            insuredAge: 35,
            faceAmount: 25_000,
        });

        const result = engine.getProductsAvailableFor(params);

        for (const productResult of result) {
            expect(productResult.classCodes).toEqual([]);
            expect(productResult.notAvailabilityReasonField).toBe('face');
        }
    });

    it('marks Accidental Death rider as "age" when age is out of rider range but product is still eligible', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        const params = createParams({
            insuredAge: 65,
            nicotineUser: false,
            faceAmount: 200_000,
            riders: {
                accidentalDeathBenefit: 50_000,
                childrensTerm: 10_000,
                waiverOfPremium: true,
            },
        });

        const result = engine.getProductsAvailableFor(params);

        // Term Life 10 Yr
        const tl10 = result.find(
            (p) => p.planCode === 'TL0101' && p.termLength === 10
        );
        expect(tl10).toBeDefined();

        expect(tl10!.riders.accidentalDeathBenefit).toBe('age');
    });

    it('marks Accidental Death rider as "face" when rider face amount is greater than product one', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        const params = createParams({
            insuredAge: 65,
            nicotineUser: false,
            faceAmount: 50_000,
            riders: {
                accidentalDeathBenefit: 60_000,
                childrensTerm: 10_000,
                waiverOfPremium: true,
            },
        });

        const result = engine.getProductsAvailableFor(params);

        // Term Life 10 Yr
        const tl10 = result.find(
            (p) => p.planCode === 'TL0101' && p.termLength === 10
        );
        expect(tl10).toBeDefined();

        expect(tl10!.riders.accidentalDeathBenefit).toBe('face');
    });

    it('returns false for a rider that is not selected', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        const params = createParams({
            insuredAge: 35,
            riders: {
                accidentalDeathBenefit: 0,
                childrensTerm: 0,
                waiverOfPremium: false,
            },
        });

        const result = engine.getProductsAvailableFor(params);
        const tl10 = result.find(
            (p) => p.planCode === 'TL0101' && p.termLength === 10
        );
        expect(tl10).toBeDefined();

        expect(tl10!.riders.accidentalDeathBenefit).toBe(false);
        expect(tl10!.riders.childrensTerm).toBe(false);
        expect(tl10!.riders.waiverOfPremium).toBe(false);
    });

    it('propagates premiumFreeRiders from input into result.riders', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        const params = createParams({
            premiumFreeRiders: {
                acceleratedDeathBenefit: true,
            } as any,
        });

        const result = engine.getProductsAvailableFor(params);
        const tl10 = result.find(
            (p) => p.planCode === 'TL0101' && p.termLength === 10
        );
        expect(tl10).toBeDefined();

        expect((tl10!.riders as any).acceleratedDeathBenefit).toBe(true);
    });
});
