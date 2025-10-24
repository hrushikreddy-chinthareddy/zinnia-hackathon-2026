import { QuickQuoteParams } from '@deps/types/quickQuote';

import type {
    ProductClassResult,
    ClassAlternatives,
    RulesModel,
    NotAvailabilityReasonField,
    RiderAlternatives,
    RiderRule,
} from './types';

export class QuickQuoteProducts {
    private NOT_COVERED_STATES = new Set([
        'AK',
        'FL',
        'HI',
        'LA',
        'NY',
        'WV',
        'DC',
    ]);
    private rejectReasonFieldForClass: NotAvailabilityReasonField;
    private rejectReasonFieldForRider: NotAvailabilityReasonField;

    constructor(private rules: RulesModel) {}

    getProductsAvailableFor(input: QuickQuoteParams): ProductClassResult[] {
        const code = input.state;
        if (code && this.NOT_COVERED_STATES.has(code)) {
            this.rejectReasonFieldForClass = 'state';
            return [];
        }

        const result: ProductClassResult[] = [];

        for (const product of this.rules.products) {
            this.rejectReasonFieldForClass = undefined;
            this.rejectReasonFieldForRider = undefined;

            const eligibleClassByPosition = product.classes.map(
                (productClass) =>
                    this.getClassEligible(
                        productClass.alternatives,
                        input.insuredAge,
                        input.nicotineUser,
                        input.faceAmount
                    )
            );

            const resultRiders = {
                accidentalDeathBenefit: this.isRiderEligible(
                    input.insuredAge,
                    input.riders.accidentalDeathBenefit,
                    product.riders.find(
                        (rider) => rider.riderCode === 'Rider_ADR'
                    )
                ),
                childrensTerm: this.isRiderEligible(
                    input.insuredAge,
                    input.riders.childrensTerm,
                    product.riders.find(
                        (rider) => rider.riderCode === 'Rider_CTR'
                    )
                ),
                waiverOfPremium: this.isRiderEligible(
                    input.insuredAge,
                    input.riders.waiverOfPremium,
                    product.riders.find(
                        (rider) => rider.riderCode === 'Rider_WPR'
                    )
                ),
                ...input.premiumFreeRiders,
            } as const;

            const { minIdx, maxIdx } = this.getClassRangeIndex(
                eligibleClassByPosition
            );

            if (minIdx !== -1) {
                const minClass = product.classes[minIdx].classCode;
                const maxClass = product.classes[maxIdx].classCode;
                result.push({
                    planCode: product.planCode,
                    termLength: product.termLength,
                    classCodes: [minClass, maxClass],
                    notAvailabilityReasonField: undefined,
                    riders: {
                        ...resultRiders,
                    },
                });
            } else {
                result.push({
                    planCode: product.planCode,
                    termLength: product.termLength,
                    classCodes: [],
                    notAvailabilityReasonField: this.rejectReasonFieldForClass,
                    riders: {
                        ...resultRiders,
                    },
                });
            }
        }

        return result;
    }

    private isWithin = (x: number, min: number, max: number) =>
        x >= min && x <= max;
    private nicMatches = (
        nicotineOption: 'Y' | 'N',
        isNicotineUser?: boolean
    ) => nicotineOption === (isNicotineUser ? 'Y' : 'N');

    private getClassEligible(
        alternatives: ClassAlternatives,
        age?: number,
        isNicotineUser?: boolean,
        face?: number
    ) {
        if (age == null || face == null) return false;

        const { nicotine, ageMin, ageMax, faceMin, faceMax } = alternatives;

        const isNicotineUserMatch = this.nicMatches(nicotine, isNicotineUser);
        const isAgeInRange = this.isWithin(age, ageMin, ageMax);
        const isFaceInRange = this.isWithin(face, faceMin, faceMax);

        if (!isFaceInRange) {
            this.rejectReasonFieldForClass = 'face';
        }

        // age has higher priority as an error.
        if (!isAgeInRange) {
            this.rejectReasonFieldForClass = 'age';
        }

        return isNicotineUserMatch && isAgeInRange && isFaceInRange;
    }

    private getClassRangeIndex(eligibleClassByPosition: boolean[]) {
        let minIdx = -1,
            maxIdx = -1;
        for (let i = 0; i < eligibleClassByPosition.length; i++) {
            if (eligibleClassByPosition[i]) {
                if (minIdx === -1) minIdx = i;
                maxIdx = i;
            }
        }
        return { minIdx, maxIdx };
    }

    private getRiderEligible(
        alternatives: RiderAlternatives,
        age: number,
        face: number
    ): true | NotAvailabilityReasonField {
        const { ageMin, ageMax, faceMin, faceMax } = alternatives;

        const isAgeInRange = this.isWithin(age, ageMin, ageMax);
        let isFaceInRange = true;

        if (faceMin && faceMax) {
            isFaceInRange = this.isWithin(face, faceMin, faceMax);

            if (!isFaceInRange) {
                return 'face';
            }
        }

        // age has higher priority as an error.
        if (!isAgeInRange) {
            return 'age';
        }

        return true; // this is always true baseds on the code above
    }

    isRiderEligible(
        age: number,
        rider: boolean | number,
        riderRules: RiderRule | undefined
    ) {
        if (riderRules && rider) {
            const { alternatives } = riderRules;
            return this.getRiderEligible(alternatives, age, rider as number);
        }
        return false;
    }
}
