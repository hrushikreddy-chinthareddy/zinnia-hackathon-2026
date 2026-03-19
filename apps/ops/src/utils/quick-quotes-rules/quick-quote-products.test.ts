import { USStates } from '@deps/constants/geography/us-states';
import type { QuickQuoteParams } from '@deps/types/quickQuote';

import { QuickQuoteProducts } from './evaluate-quick-quote';
import { RULES_MODEL } from './rules';
import { IneligibleReasonByClass, RiderEligibilityResult } from './types';

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

const determineIneligibilityClassReason = (
    ineligibilityReasons: IneligibleReasonByClass[],
    reasonField: string
) => {
    return ineligibilityReasons.find((reasonObj) =>
        reasonObj.reasons.find((reason) => reason.field === reasonField)
    );
};

const determineIneligibilityRiderReason = (
    rider: RiderEligibilityResult,
    reasonField: string
) => {
    return rider.reasons.find((reason) => reason.field === reasonField);
};

describe('QuickQuoteProducts', () => {
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
    });

    it('sets ineligibilityReasonField to "age" when age is out of range for all classes', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        const params = createParams({
            insuredAge: 80,
            faceAmount: 200_000,
        });

        const result = engine.getProductsAvailableFor(params);

        for (const productResult of result) {
            expect(productResult.classCodes).toEqual([]);
            const inilegibilityReason = determineIneligibilityClassReason(
                productResult.ineligibilityReasonField,
                'age'
            );
            expect(inilegibilityReason).toBeDefined();
        }
    });

    it('sets some of ineligibilityReasonField to "face" when face amount is out of range but age is valid', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        const params = createParams({
            insuredAge: 35,
            faceAmount: 25_000,
        });

        const result = engine.getProductsAvailableFor(params);

        for (const productResult of result) {
            expect(productResult.classCodes).toEqual([]);
            const faceIneligibilityReason = determineIneligibilityClassReason(
                productResult.ineligibilityReasonField,
                'face'
            );
            const ageIneligibilityReason = determineIneligibilityClassReason(
                productResult.ineligibilityReasonField,
                'age'
            );
            expect(faceIneligibilityReason).toBeDefined();
            expect(ageIneligibilityReason).toBeUndefined();
        }
    });

    it('marks Accidental Death rider rejected reason as "age" when age is out of rider range but product is still eligible', () => {
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
        expect(tl10?.classCodes.length).toBeGreaterThan(0);
        const isRiderEligible = tl10?.riders.Rider_ADR.eligible;
        const ageIneligibilityReason = determineIneligibilityRiderReason(
            tl10!.riders.Rider_ADR!,
            'age'
        );
        expect(isRiderEligible).toBe(false);
        expect(ageIneligibilityReason).toBeDefined();

        // todo determine age reason for rider
    });

    it('marks Accidental Death rider rejected reason as "adrMaxFace" when rider face amount is greater than product one', () => {
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
        const faceIneligibilityReason = determineIneligibilityRiderReason(
            tl10!.riders.Rider_ADR!,
            'adrMaxFace'
        );
        const isRiderEligible = tl10?.riders.Rider_ADR.eligible;
        expect(isRiderEligible).toBe(false);
        expect(faceIneligibilityReason).toBeDefined();
    });

    it('returns not eligible for a rider that is not selected', () => {
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
        expect(!tl10).toBeDefined();

        expect(tl10!.riders.Rider_ADR.eligible).toBe(false);
        expect(tl10!.riders.Rider_CTR.eligible).toBe(false);
        expect(tl10!.riders.Rider_WPR.eligible).toBe(false);
    });

    it('propagates premiumFreeRiders from input into result.riders', () => {
        const engine = new QuickQuoteProducts(RULES_MODEL);
        const params = createParams({
            premiumFreeRiders: {
                acceleratedDeathBenefitForTerminalIllness: true,
            },
        });

        const result = engine.getProductsAvailableFor(params);
        const tl10 = result.find(
            (p) => p.planCode === 'TL0101' && p.termLength === 10
        );
        expect(tl10).toBeDefined();
        expect(tl10!.riders.Rider_ABRTRM.eligible).toBe(true);
    });
});
