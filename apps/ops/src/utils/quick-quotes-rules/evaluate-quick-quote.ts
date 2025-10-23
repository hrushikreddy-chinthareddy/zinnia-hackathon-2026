import { QuickQuoteParams } from '@deps/types/quickQuote';

import type {
    ProductClassResult,
    ClassAlternatives,
    RulesModel,
    NotAvailabilityReasonField,
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
    private rejectReasonField: NotAvailabilityReasonField;

    constructor(private rules: RulesModel) {}

    getProductsAvailableFor(input: QuickQuoteParams): ProductClassResult[] {
        const code = input.state;
        if (code && this.NOT_COVERED_STATES.has(code)) {
            this.rejectReasonField = 'state';
            return [];
        }

        const result: ProductClassResult[] = [];

        for (const product of this.rules.products) {
            this.rejectReasonField = undefined;
            const eligibleClassByPosition = product.classes.map(
                (productClass) =>
                    this.getClassEligible(
                        productClass.alternatives,
                        input.insuredAge,
                        input.nicotineUser,
                        input.faceAmount
                    )
            );

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
                    notAvailabilityReasonField: this.rejectReasonField,
                });
            } else {
                result.push({
                    planCode: product.planCode,
                    termLength: product.termLength,
                    classCodes: [],
                    notAvailabilityReasonField: this.rejectReasonField,
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
            this.rejectReasonField = 'face';
        }

        // age has higher priority as an error.
        if (!isAgeInRange) {
            this.rejectReasonField = 'age';
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
}
