import { get } from 'lodash';

import { QuickQuoteParams } from '@deps/types/quickQuote';

import {
    PREMIUM_FREE_RIDER_ELIGIBILITY_LIST,
    RIDER_ELIGIBILITY_LIST,
} from './rules';
import {
    type ProductClassResult,
    type RulesModel,
    type RiderRule,
    type IneligibilityReason,
    type ClassEligibilityResult,
    type getEligibleClassProps,
    type RiderInputNormalized,
    type RiderEligibilityResult,
    type ProductClassResultRiders,
    type RiderCode,
    isRiderADR,
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
                const ineligibleReasonByClass = this.getIneligibleReasonByClass(
                    eligibleClassByPosition
                );

                result.push({
                    planCode: product.planCode,
                    termLength: product.termLength,
                    classCodes: [minClass, maxClass],
                    ineligibilityReasonField: ineligibleReasonByClass,
                    riders: {
                        ...resultRiders,
                    },
                });
            } else {
                // If no eligible classes; propagate the rejection reason field
                const ineligibleReasonByClass = this.getIneligibleReasonByClass(
                    eligibleClassByPosition
                );

                result.push({
                    planCode: product.planCode,
                    termLength: product.termLength,
                    classCodes: [],
                    ineligibilityReasonField: ineligibleReasonByClass,
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
    private getIneligibleReasonByClass = (
        eligibleClasses: ClassEligibilityResult[]
    ) => {
        return eligibleClasses.filter(
            (elegibleClass) => !elegibleClass.eligible
        );
    };

    /**
     * Evaluates the eligibility of a product class based on user input and class rule alternatives.
     *
     * This function validates all applicable eligibility dimensions for a class:
     * - Age range
     * - Face amount range
     * - Nicotine usage compatibility
     *
     * All failed validations are accumulated and returned as structured ineligibility reasons.
     * A class is considered eligible only if **all** eligibility checks pass.
     *
     * If required inputs are missing (age or face amount), the class is treated as not eligible
     * and a deterministic ineligibility reason is returned.
     *
     * @param params.className - Identifier of the class being evaluated
     * @param params.alternatives - Eligibility rules (age, face, nicotine) defined for the class
     * @param params.age - Insured age
     * @param params.isNicotineUser - Indicates whether the insured uses nicotine
     * @param params.face - Requested face amount
     *
     * @returns The eligibility result for the evaluated class, including all ineligibility reasons
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
                        reason: 'ageOutsideOfRange',
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
                reason: 'ageOutsideOfRange',
                expected: [ageMin, ageMax],
                actual: age,
            });
        }

        if (!isFaceInRange) {
            reasons.push({
                field: 'face',
                reason: 'faceAmountOutsideOfRange',
                expected: [faceMin, faceMax],
                actual: face,
            });
        }

        if (!isNicotineUserMatch) {
            reasons.push({
                field: 'nicotine',
                reason: 'nicotine',
                expected: nicotine,
                actual: isNicotineUser ? 'Y' : 'N',
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

    /**
     * Normalizes all rider-related user inputs into a single, deterministic structure
     * that can be evaluated by the rider eligibility engine.
     *
     * This function is responsible for:
     * - Mapping raw QuickQuoteParams into normalized rider inputs
     * - Supporting both "regular" riders (with face amount and rules)
     *   and "premium-free" riders (boolean-based, no face amount)
     * - Decoupling input shape from evaluation logic
     *
     * Key design decisions:
     * - Riders are always returned, even if not requested
     * - "Not requested" or "no rules" riders can be safely skipped by the evaluator
     * - Union types (boolean | number) are normalized upfront
     * - The output is deterministic and safe for downstream eligibility evaluation
     *
     * @param input - Raw QuickQuote parameters provided by the user
     * @param productRiderRules - Rider rules configured at the product level
     * @returns A normalized list of rider inputs ready for eligibility evaluation
     */
    private getRiderInputsNormalized(
        input: QuickQuoteParams,
        productRiderRules: RiderRule[]
    ): RiderInputNormalized[] {
        const regularRiders = RIDER_ELIGIBILITY_LIST.map(
            ({ riderName, riderCode, riderPath, riderNameCamelCase }) => {
                const riderInputValue = get(input, riderPath);
                const riderRequested = !!riderInputValue;
                // Normalize face amount:
                // - Only numeric values represent a valid face amount
                // - Non-numeric values default to -1 to avoid union types
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

        const premiumFreeRiders = PREMIUM_FREE_RIDER_ELIGIBILITY_LIST.map(
            ({ riderName, riderCode, riderNameCamelCase }) => {
                // Determine whether the premium-free rider was selected
                // by checking its presence in the premiumFreeRiders input
                const riderRequested = Object.keys(requestedPremiumRiders).find(
                    (riderKey) => riderKey === riderNameCamelCase
                );
                const riderRule = productRiderRules.find(
                    (rider) => rider.riderCode === riderCode
                );
                return {
                    riderNameCamelCase,
                    riderName,
                    riderCode,
                    riderRequested: !!riderRequested,
                    faceAmount: -1,
                    riderRuleAlternatives: riderRule?.alternatives,
                };
            }
        );

        return [...regularRiders, ...premiumFreeRiders];
    }

    /**
     * Evaluates the eligibility of a single rider based on normalized rider input
     * and the main QuickQuote parameters.
     *
     * This function:
     * - Applies rider-specific eligibility rules (age, face amount)
     * - Accumulates all ineligibility reasons (no short-circuiting)
     * - Explicitly distinguishes between "not evaluated" and "evaluated but ineligible"
     *
     * Important domain rules:
     * - A rider is NOT evaluated if:
     *   - It was not requested by the user
     *   - It has no rule alternatives configured
     * - A rider being "not evaluated" is NOT the same as being ineligible
     *
     * @param input - Raw QuickQuote parameters (used for cross-checks such as product face amount)
     * @param riderInput - Normalized rider input ready for eligibility evaluation
     * @returns The eligibility result for the rider
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
        } = riderInput;

        if (!riderRequested || !riderRuleAlternatives) {
            return {
                riderName,
                riderCode,
                evaluated: false,
                eligible: false,
                reasons: [],
            };
        }

        const nonEligibleReasons: IneligibilityReason[] = [];
        const { insuredAge, faceAmount: productFaceAmount } = input;
        const {
            ageMin,
            ageMax,
            faceMin,
            faceMax,
            policyFaceAmountMin,
            notAvailableInStateCodes,
            requiredRiderCodes,
        } = riderRuleAlternatives;
        let isAgeInRange = true;
        let isFaceInRange = true;
        let isADRAmountLessThanProduct = true;

        if (ageMin && ageMax) {
            isAgeInRange = this.isWithin(insuredAge, ageMin, ageMax);
            if (!isAgeInRange) {
                nonEligibleReasons.push({
                    field: 'age',
                    reason: 'ageOutsideOfRange',
                    expected: [ageMin, ageMax],
                    actual: insuredAge,
                });
            }
        }

        if (faceMin && faceMax) {
            isFaceInRange = this.isWithin(riderFaceAmount, faceMin, faceMax);
            if (!isFaceInRange) {
                nonEligibleReasons.push({
                    reason: 'faceAmountOutsideOfRange',
                    field: 'face',
                    expected: [faceMin, faceMax],
                    actual: riderFaceAmount,
                });
            }
        }

        if (isRiderADR(riderCode)) {
            isADRAmountLessThanProduct = riderFaceAmount <= productFaceAmount;
            if (!isADRAmountLessThanProduct) {
                nonEligibleReasons.push({
                    reason: 'riderIsGreaterThanPolicyFaceAmount',
                    field: 'adrMaxFace',
                    expected: [0, productFaceAmount],
                    actual: riderFaceAmount,
                });
            }
        }

        if (policyFaceAmountMin && input.faceAmount < policyFaceAmountMin) {
            nonEligibleReasons.push({
                field: 'face',
                reason: 'underMinimumPolicyFaceAmount',
                expected: policyFaceAmountMin,
                actual: input.faceAmount,
            });
        }

        if (
            notAvailableInStateCodes &&
            notAvailableInStateCodes.includes(input.state)
        ) {
            nonEligibleReasons.push({
                field: 'state',
                reason: 'stateNotEligible',
                actual: input.state,
            });
        }

        if (requiredRiderCodes) {
            for (const requiredRiderCode of requiredRiderCodes) {
                const rider = [
                    ...PREMIUM_FREE_RIDER_ELIGIBILITY_LIST,
                    ...RIDER_ELIGIBILITY_LIST,
                ].find((rider) => rider.riderCode === requiredRiderCode);

                if (!rider) {
                    throw new Error(
                        `Unknown rider "${requiredRiderCode}" not found in rider eligibility list`
                    );
                }

                const riderRequested =
                    input.riders[rider.riderNameCamelCase] === true ||
                    input.premiumFreeRiders[rider.riderNameCamelCase] === true;

                if (!riderRequested) {
                    nonEligibleReasons.push({
                        field: 'rider',
                        reason: 'requiredRiderNotSelected',
                        notSelectedRider: [requiredRiderCode],
                    });
                }
            }
        }

        return {
            riderName,
            riderCode,
            evaluated: true,
            eligible: nonEligibleReasons.length === 0,
            reasons: nonEligibleReasons,
        };
    }

    /**
     * Orchestrates the full rider eligibility evaluation pipeline.
     *
     * This function:
     * 1. Normalizes raw rider-related user inputs
     * 2. Evaluates eligibility for each supported rider
     * 3. Groups the results into an object keyed by rider identifier
     *
     * @param input - Raw QuickQuote parameters provided by the user
     * @param productRiderRules - Rider rules configured at the product level
     * @returns A map of rider eligibility results keyed by rider code identifier
     */
    private getEligibleRiders(
        input: QuickQuoteParams,
        productRiderRules: RiderRule[]
    ): ProductClassResultRiders {
        const normalizedRidersInput = this.getRiderInputsNormalized(
            input,
            productRiderRules
        );

        const eligibileRiders = normalizedRidersInput.map((riderInput) =>
            this.isRiderEligible(input, riderInput)
        );

        const groupRiders = eligibileRiders.reduce<
            Partial<Record<RiderCode, RiderEligibilityResult>>
        >((acc, rider) => {
            acc[rider.riderCode] = rider;
            return acc;
        }, {});

        return groupRiders as ProductClassResultRiders;
    }
}
