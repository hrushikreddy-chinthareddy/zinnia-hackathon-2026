import { get } from 'lodash';

import { QuickQuoteParams } from '@deps/types/quickQuote';

import { RIDER_ELIGIBILITY_LIST } from './rules';

import type {
    ProductClassResult,
    RulesModel,
    NotAvailabilityReasonField,
    RiderAlternatives,
    RiderRule,
    IneligibilityReason,
    EligibilityResult,
    getEligibleClassProps,
    RiderInputNormalized,
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
            const resultRiders = {
                accidentalDeathBenefit: this.isRiderEligible(
                    input,
                    input.riders.accidentalDeathBenefit,
                    product.riders.find(
                        (rider) => rider.riderCode === 'Rider_ADR'
                    )
                ),
                childrensTerm: this.isRiderEligible(
                    input,
                    input.riders.childrensTerm,
                    product.riders.find(
                        (rider) => rider.riderCode === 'Rider_CTR'
                    )
                ),
                waiverOfPremium: this.isRiderEligible(
                    input,
                    input.riders.waiverOfPremium,
                    product.riders.find(
                        (rider) => rider.riderCode === 'Rider_WPR'
                    )
                ),
                // Premium-free riders has no rules to evaluate
                ...input.premiumFreeRiders,
            } as const;

            // TODO: replace resultRiders object with this new way to evaluate normalized riders input.
            const resultRidersNew = this.manageRiders(input, product.riders);

            // Determine min / max eligible class indexes for the product
            const { minIdx, maxIdx } = this.getClassRangeIndex(
                eligibleClassByPosition
            );

            // If there is a min class available, there is a max too and bot can be used
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
        eligibleClasses: EligibilityResult[]
    ) => {
        return eligibleClasses.filter(({ className, reasons }) => {
            if (reasons.length > 0) {
                return { className, reasons };
            }
        });
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
    }: getEligibleClassProps): EligibilityResult {
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
    private getClassRangeIndex(eligibleClassByPosition: EligibilityResult[]) {
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
     * Core rider eligibility evaluation for riders with a face amount.
     *
     * Conditions:
     *  - age must be in range (ageMin, ageMax)
     *  - if faceMin and faceMax are provided:
     *      * face must be in range (faceMin, faceMax)
     *
     * Returns:
     *  - true if the rider is eligible
     *  - 'age' if age is out of range
     *  - 'face' if face is out of range
     */
    private getRiderEligible(
        alternatives: RiderAlternatives,
        {
            insuredAge,
            faceAmount: productFaceAmount,
        }: { insuredAge: number; faceAmount: number },
        face: number
    ): true | NotAvailabilityReasonField {
        const { ageMin, ageMax, faceMin, faceMax } = alternatives;

        const isAgeInRange = this.isWithin(insuredAge, ageMin, ageMax);
        let isFaceInRange = true;

        // Only validate face range if both min and max are defined
        if (faceMin && faceMax) {
            isFaceInRange = this.isWithin(
                face,
                faceMin,
                Math.min(faceMax, productFaceAmount)
            );

            if (!isFaceInRange) {
                return 'face';
            }
        }

        // Age has higher priority as an error than face.
        if (!isAgeInRange) {
            return 'age';
        }

        return true; // this is always true based on the code above
    }

    /**
     * Evaluate if a rider is eligibile.
     *
     * Validates if the rider is selected and has rules to be evaluated.
     * Returns:
     *  - false if there are no rules for the rider or the rider is not selected
     *  - the result of `getRiderEligible` if rules and selection are present
     */
    private isRiderEligible(
        productParams: { insuredAge: number; faceAmount: number },
        rider: boolean | number,
        riderRules: RiderRule | undefined
    ) {
        if (riderRules && rider) {
            const { alternatives } = riderRules;
            // `rider` here is expected to be a numeric face amount when used
            return this.getRiderEligible(
                alternatives,
                productParams,
                rider as number
            );
        }

        // Rider either not selected or no rules for this product
        return false;
    }

    private getRiderInputsNormalized(
        input: QuickQuoteParams,
        productRiderRules: RiderRule[]
    ): RiderInputNormalized[] {
        return RIDER_ELIGIBILITY_LIST.map(
            ({ riderName, riderCode, riderPath }) => {
                const riderInputValue = get(input, riderPath);
                const riderRequested = !!riderInputValue;
                const faceAmount =
                    typeof riderInputValue === 'number' ? riderInputValue : -1;
                const riderRule = productRiderRules.find(
                    (rider) => rider.riderCode === riderCode
                );

                return {
                    riderName,
                    riderCode,
                    riderRequested,
                    faceAmount,
                    riderRuleAlternatives: riderRule?.alternatives,
                };
            }
        );
    }

    private manageRiders(
        input: QuickQuoteParams,
        productRiderRules: RiderRule[]
    ) {
        const normalizedRiderInputs = this.getRiderInputsNormalized(
            input,
            productRiderRules
        );
        console.log(
            '🚀 ~ evaluate-quick-quote.ts:376 ~ QuickQuoteProducts ~ manageRiders ~ normalizedRiderInputs:',
            normalizedRiderInputs
        );
    }
}
