import { get } from 'lodash';

import { QuickQuoteParams } from '@deps/types/quickQuote';

import {
    PREMIUM_RIDER_ELIGIBILITY_LIST,
    RIDER_ELIGIBILITY_LIST,
} from './rules';

import type {
    ProductClassResult,
    RulesModel,
    RiderRule,
    IneligibilityReason,
    ClassEligibilityResult,
    getEligibleClassProps,
    RiderInputNormalized,
    RiderEligibilityResult,
    RiderAlternatives,
} from './types';

/**
 * QuickQuoteProducts
 *
 * Evaluates a set of product rules against a given QuickQuote input
 * and returns, for each product:
 *  - the min / max eligible class codes
 *  - the rider availability and rejection reason (if any)
 */
export class QuickQuoteProducts {
    /**
     * @param rules Full rules model containing class and rider rules for all products.
     */
    constructor(private rules: RulesModel) {}

    /**
     * Main entry point.
     *
     * Given the QuickQuoteParams, returns an array of `ProductClassResult`
     * for each product defined in the rules model.
     *
     * - If the state is not covered, all products are returned as unavailable.
     * - Otherwise, for each product:
     *    * compute which classes are eligible
     *    * derive min and max class codes (by index order)
     *    * evaluate riders and return rider availability per product
     */
    getProductsAvailableFor(input: QuickQuoteParams): ProductClassResult[] {
        const result: ProductClassResult[] = [];

        for (const product of this.rules.products) {
            // For each class in the product, check if it's eligible, it also returns an array with all non eligible classes
            const eligibleClassByPosition = product.classes.map(
                (productClass) =>
                    this.getEligibleClass({
                        className: productClass.className,
                        alternatives: productClass.alternatives,
                        age: input.insuredAge,
                        isNicotineUser: input.nicotineUser,
                        face: input.faceAmount,
                    })
            );

            // Evaluate each rider for this product
            const resultRiders = this.getEligibleRiders(input, product.riders);

            // Determine min / max eligible class indexes for the product
            const { minIdx, maxIdx } = this.getClassRangeIndex(
                eligibleClassByPosition
            );

            // If there is a min class available, there is a max too and both can be used
            if (minIdx !== -1) {
                // Use the first and last eligible indexes as min/max class.
                const minClass = product.classes[minIdx].classCode;
                const maxClass = product.classes[maxIdx].classCode;
                const nonEligibleReasonByClass =
                    this.getNonEligibleReasonByClass(eligibleClassByPosition);

                result.push({
                    planCode: product.planCode,
                    termLength: product.termLength,
                    classCodes: [minClass, maxClass],
                    notAvailabilityReasonField: nonEligibleReasonByClass,
                    riders: {
                        ...resultRiders,
                    },
                });
            } else {
                // If no eligible classes; propagate the rejection reason field
                const nonEligibleReasonByClass =
                    this.getNonEligibleReasonByClass(eligibleClassByPosition);

                result.push({
                    planCode: product.planCode,
                    termLength: product.termLength,
                    classCodes: [],
                    notAvailabilityReasonField: nonEligibleReasonByClass,
                    riders: {
                        ...resultRiders,
                    },
                });
            }
        }

        return result;
    }

    /**
     * Utility: checks if a numeric value is between min and max (inclusive).
     */
    private isWithin = (x: number, min: number, max: number) =>
        x >= min && x <= max;

    /**
     * Utility: checks if the nicotine flag from rules (`'Y' | 'N'`)
     * matches the boolean `isNicotineUser` from input.
     */
    private nicMatches = (
        nicotineOption: 'Y' | 'N',
        isNicotineUser?: boolean
    ) => nicotineOption === (isNicotineUser ? 'Y' : 'N');

    /**
     * Retrieve all non eligible reasons for each product class.
     */
    private getNonEligibleReasonByClass = (
        eligibleClasses: ClassEligibilityResult[]
    ) => {
        return eligibleClasses.filter(
            (elegibleClass) => !elegibleClass.eligible
        );
    };

    /**
     * Evaluates if a given class is eligible for the provided input.
     *
     * Conditions:
     *  - nicotine usage must match
     *  - age must be in range (ageMin, ageMax)
     *  - face amount must be in range (faceMin, faceMax)
     *
     * Also sets `rejectReasonFieldForClass` to:
     *  - 'face' if face is out of range
     *  - 'age' if age is out of range (takes precedence over face)
     */

    private getEligibleClass({
        className,
        alternatives,
        age,
        isNicotineUser,
        face,
    }: getEligibleClassProps): ClassEligibilityResult {
        const reasons: IneligibilityReason[] = [];

        const { nicotine, ageMin, ageMax, faceMin, faceMax } = alternatives;

        // If required fields are missing class is not eligible
        if (age == null || face == null) {
            return {
                className,
                eligible: false,
                reasons: [
                    {
                        field: 'age',
                        expected: [ageMin, ageMax],
                        actual: age ?? -1,
                    },
                ],
            };
        }

        const isAgeInRange = this.isWithin(age, ageMin, ageMax);
        const isFaceInRange = this.isWithin(face, faceMin, faceMax);
        const isNicotineUserMatch = this.nicMatches(nicotine, isNicotineUser);

        if (!isAgeInRange) {
            reasons.push({
                field: 'age',
                expected: [ageMin, ageMax],
                actual: age,
            });
        }

        if (!isFaceInRange) {
            reasons.push({
                field: 'face',
                expected: [faceMin, faceMax],
                actual: face,
            });
        }

        if (!isNicotineUserMatch) {
            reasons.push({
                field: 'nicotine',
                expected: nicotine,
                actual: !!isNicotineUser,
            });
        }

        return {
            className,
            eligible: reasons.length === 0,
            reasons,
        };
    }

    /**
     * Given an array of eligible classes indicating if each one is eligible by position,
     * returns the first (minIdx) and last (maxIdx) index that are true.
     *
     * If there are no eligible classes, both indexes are -1.
     */
    private getClassRangeIndex(
        eligibleClassByPosition: ClassEligibilityResult[]
    ) {
        let minIdx = -1,
            maxIdx = -1;

        for (let i = 0; i < eligibleClassByPosition.length; i++) {
            if (eligibleClassByPosition[i].eligible) {
                if (minIdx === -1) minIdx = i;
                maxIdx = i;
            }
        }

        return { minIdx, maxIdx };
    }

    private getRiderInputsNormalized(
        input: QuickQuoteParams,
        productRiderRules: RiderRule[]
    ): RiderInputNormalized[] {
        const regularRiders = RIDER_ELIGIBILITY_LIST.map(
            ({ riderName, riderCode, riderPath, riderNameCamelCase }) => {
                const riderInputValue = get(input, riderPath);
                const riderRequested = !!riderInputValue;
                const faceAmount =
                    typeof riderInputValue === 'number' ? riderInputValue : -1;
                const riderRule = productRiderRules.find(
                    (rider) => rider.riderCode === riderCode
                );

                return {
                    riderNameCamelCase,
                    riderName,
                    riderCode,
                    riderRequested,
                    faceAmount,
                    riderRuleAlternatives: riderRule?.alternatives,
                };
            }
        );

        const requestedPremiumRiders = input.premiumFreeRiders;
        const premiumFreeRiders = PREMIUM_RIDER_ELIGIBILITY_LIST.map(
            ({ riderName, riderCode, riderNameCamelCase }) => {
                const riderRequested = Object.keys(requestedPremiumRiders).find(
                    (riderKey) => riderKey === riderNameCamelCase
                );
                return {
                    riderNameCamelCase,
                    riderName,
                    riderCode,
                    riderRequested: !!riderRequested,
                    faceAmount: -1,
                    riderRuleAlternatives: {} as RiderAlternatives,
                };
            }
        );

        return [...regularRiders, ...premiumFreeRiders];
    }

    /**
     * Evaluate if a rider is eligibile.
     *
     * Core rider eligibility evaluation for riders with a face amount.
     *
     * Conditions:
     *  - if ageMin and faceMax are provided:
     *      - age must be in range (ageMin, ageMax)
     *  - if faceMin and faceMax are provided:
     *      - face must be in range (faceMin, faceMax)
     * Returns:
     *  - TBD
     */
    private isRiderEligible(
        input: QuickQuoteParams,
        riderInput: RiderInputNormalized
    ): RiderEligibilityResult {
        const {
            riderRequested,
            riderRuleAlternatives,
            riderName,
            riderCode,
            faceAmount: riderFaceAmount,
            riderNameCamelCase,
        } = riderInput;

        if (!riderRequested || !riderRuleAlternatives) {
            return {
                riderNameCamelCase,
                riderName,
                riderCode,
                evaluated: false,
                eligible: false,
                reasons: [],
            };
        }

        const nonEligibleReasons: IneligibilityReason[] = [];
        const { insuredAge, faceAmount: productFaceAmount } = input;
        const { ageMin, ageMax, faceMin, faceMax } = riderRuleAlternatives;
        let isAgeInRange = true;
        let isFaceInRange = true;

        if (ageMin && ageMax) {
            isAgeInRange = this.isWithin(insuredAge, ageMin, ageMax);
            if (!isAgeInRange) {
                nonEligibleReasons.push({
                    field: 'age',
                    expected: [ageMin, ageMax],
                    actual: insuredAge,
                });
            }
        }

        if (faceMin && faceMax) {
            isFaceInRange = this.isWithin(
                riderFaceAmount,
                faceMin,
                Math.min(faceMax, productFaceAmount)
            );
            if (!isFaceInRange) {
                nonEligibleReasons.push({
                    field: 'face',
                    expected: [faceMin, Math.min(faceMax, productFaceAmount)],
                    actual: riderFaceAmount,
                });
            }
        }

        return {
            riderNameCamelCase,
            riderName,
            riderCode,
            evaluated: true,
            eligible: isAgeInRange && isFaceInRange,
            reasons: nonEligibleReasons,
        };
    }

    private getEligibleRiders(
        input: QuickQuoteParams,
        productRiderRules: RiderRule[]
    ) {
        const normalizedRidersInput = this.getRiderInputsNormalized(
            input,
            productRiderRules
        );

        const eligibileRiders = normalizedRidersInput.map((riderInput) =>
            this.isRiderEligible(input, riderInput)
        );

        const groupRiders = eligibileRiders.reduce<
            Record<string, RiderEligibilityResult>
        >((acc, rider) => {
            acc[rider.riderNameCamelCase] = rider;
            return acc;
        }, {});

        return groupRiders;
    }
}
