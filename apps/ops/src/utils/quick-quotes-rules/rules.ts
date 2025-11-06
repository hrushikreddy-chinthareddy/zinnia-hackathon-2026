import { RulesModel } from './types';

/**
 * RULES_MODEL
 *
 * Defines the complete business rule set used by the QuickQuote engine.
 * Each product specifies:
 *  - Available insurance classes and their eligibility criteria.
 *  - Riders (optional benefits) and their applicable ranges.
 *
 * The `QuickQuoteProducts` class consumes this model to determine
 * product and rider eligibility for a given QuickQuote input.
 */
export const RULES_MODEL: RulesModel = {
    /**
     * Hierarchical order of insurance classes. This is here fir reference and debug
     *
     * The engine uses this order to determine the lowest and highest
     * class available for a product (min and max class range).
     */
    classOrder: [
        'Gold (Nicotine)',
        'Gold Plus (Nicotine)',
        'Platinum (Non-Nicotine)',
        'Platinum Choice (Non-Nicotine)',
        'Platinum Plus (Non-Nicotine)',
        'Platinum Elite (Non-Nicotine)',
    ],
    /**
     * Complete list of products available.
     * Each product defines:
     *  - planCode: product/plan identifier for the carrier.
     *  - termLength: policy duration in years.
     *  - classes: all available classes and their eligibility rules.
     *  - riders: all optional riders and their applicability criteria.
     */
    products: [
        {
            productName: 'Term Life 10 Yr',
            planCode: 'TL0101',
            termLength: 10,
            /**
             * Each class entry defines:
             *  - className: human-readable label for debug.
             *  - classCode: class identifier for the carrier.
             *  - alternatives: criteria used for eligibility.
             *
             * Eligibility criteria:
             *  - nicotine: 'Y' (smoker) or 'N' (non-smoker).
             *  - ageMin / ageMax: allowed age range.
             *  - faceMin / faceMax: allowed face amount range.
             */
            classes: [
                {
                    className: 'Gold (Nicotine)',
                    classCode: 'STANDARDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 75,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Gold Plus (Nicotine)',
                    classCode: 'PREFERREDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 75,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum (Non-Nicotine)',
                    classCode: 'STANDARDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 75,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Choice (Non-Nicotine)',
                    classCode: 'STANDARDPLUSNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 75,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Plus (Non-Nicotine)',
                    classCode: 'PREFERREDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 75,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Elite (Non-Nicotine)',
                    classCode: 'ELITENONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 75,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
            ],
            /**
             * Riders associated with the product.
             * Each defines:
             *  - riderName: human-readable label for debug.
             *  - riderCode: rider identifier for the carrier.
             *  - alternatives: age and/or face amount limits for applicability.
             */
            riders: [
                {
                    riderName: 'Accidental Death Benefit Rider',
                    riderCode: 'Rider_ADR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 60,
                        faceMin: 10_000,
                        faceMax: 300_000,
                    },
                },
                {
                    riderName: "Children's Term Insurance Rider",
                    riderCode: 'Rider_CTR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 5_000,
                        faceMax: 25_000,
                    },
                },
                {
                    riderName:
                        'Accelerated Death Benefit Rider for Terminal Illness',
                    riderCode: 'Rider_ABRTRM',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 75,
                    },
                },
                {
                    riderName: 'Charitable Giving Rider',
                    riderCode: 'Rider_CGR',
                    alternatives: {
                        ageMin: 0,
                        ageMax: 75,
                    },
                },
                {
                    riderName: 'Waiver of Premium Rider',
                    riderCode: 'Rider_WPR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                    },
                },
            ],
        },
        {
            productName: 'Term Life 15 Yr',
            planCode: 'TL0101',
            termLength: 15,
            classes: [
                {
                    className: 'Gold (Nicotine)',
                    classCode: 'STANDARDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 70,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Gold Plus (Nicotine)',
                    classCode: 'PREFERREDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 70,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum (Non-Nicotine)',
                    classCode: 'STANDARDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 70,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Choice (Non-Nicotine)',
                    classCode: 'STANDARDPLUSNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 70,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Plus (Non-Nicotine)',
                    classCode: 'PREFERREDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 70,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Elite (Non-Nicotine)',
                    classCode: 'ELITENONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 70,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
            ],
            riders: [
                {
                    riderName: 'Accidental Death Benefit Rider',
                    riderCode: 'Rider_ADR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 60,
                        faceMin: 10_000,
                        faceMax: 300_000,
                    },
                },
                {
                    riderName: "Children's Term Insurance Rider",
                    riderCode: 'Rider_CTR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 5_000,
                        faceMax: 25_000,
                    },
                },
                {
                    riderName:
                        'Accelerated Death Benefit Rider for Terminal Illness',
                    riderCode: 'Rider_ABRTRM',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 70,
                    },
                },
                {
                    riderName: 'Charitable Giving Rider',
                    riderCode: 'Rider_CGR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 75,
                    },
                },
                {
                    riderName: 'Waiver of Premium Rider',
                    riderCode: 'Rider_WPR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                    },
                },
            ],
        },
        {
            productName: 'Term Life 20 Yr',
            planCode: 'TL0101',
            termLength: 20,
            classes: [
                {
                    className: 'Gold (Nicotine)',
                    classCode: 'STANDARDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 65,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Gold Plus (Nicotine)',
                    classCode: 'PREFERREDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 65,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum (Non-Nicotine)',
                    classCode: 'STANDARDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 65,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Choice (Non-Nicotine)',
                    classCode: 'STANDARDPLUSNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 65,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Plus (Non-Nicotine)',
                    classCode: 'PREFERREDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 65,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Elite (Non-Nicotine)',
                    classCode: 'ELITENONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 65,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
            ],
            riders: [
                {
                    riderName: 'Accidental Death Benefit Rider',
                    riderCode: 'Rider_ADR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 60,
                        faceMin: 10_000,
                        faceMax: 300_000,
                    },
                },
                {
                    riderName: "Children's Term Insurance Rider",
                    riderCode: 'Rider_CTR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 5_000,
                        faceMax: 25_000,
                    },
                },
                {
                    riderName:
                        'Accelerated Death Benefit Rider for Terminal Illness',
                    riderCode: 'Rider_ABRTRM',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 65,
                    },
                },
                {
                    riderName: 'Charitable Giving Rider',
                    riderCode: 'Rider_CGR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 65,
                    },
                },
                {
                    riderName: 'Waiver of Premium Rider',
                    riderCode: 'Rider_WPR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                    },
                },
            ],
        },
        {
            productName: 'Term Life 30 Yr',
            planCode: 'TL0101',
            termLength: 30,
            classes: [
                {
                    className: 'Gold (Nicotine)',
                    classCode: 'STANDARDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 50,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Gold Plus (Nicotine)',
                    classCode: 'PREFERREDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 50,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum (Non-Nicotine)',
                    classCode: 'STANDARDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 50,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Choice (Non-Nicotine)',
                    classCode: 'STANDARDPLUSNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 50,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Plus (Non-Nicotine)',
                    classCode: 'PREFERREDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 50,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Elite (Non-Nicotine)',
                    classCode: 'ELITENONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 50,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
            ],
            riders: [
                {
                    riderName: 'Accidental Death Benefit Rider',
                    riderCode: 'Rider_ADR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 50,
                        faceMin: 10_000,
                        faceMax: 300_000,
                    },
                },
                {
                    riderName: "Children's Term Insurance Rider",
                    riderCode: 'Rider_CTR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 5_000,
                        faceMax: 25_000,
                    },
                },
                {
                    riderName:
                        'Accelerated Death Benefit Rider for Terminal Illness',
                    riderCode: 'Rider_ABRTRM',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 50,
                    },
                },
                {
                    riderName: 'Charitable Giving Rider',
                    riderCode: 'Rider_CGR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 50,
                    },
                },
                {
                    riderName: 'Waiver of Premium Rider',
                    riderCode: 'Rider_WPR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 50,
                    },
                },
            ],
        },
        {
            productName: 'Return of Premium Term Life 20 Yr',
            planCode: 'TR0101',
            termLength: 20,
            classes: [
                {
                    className: 'Gold (Nicotine)',
                    classCode: 'STANDARDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 50,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Gold Plus (Nicotine)',
                    classCode: 'PREFERREDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 50,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum (Non-Nicotine)',
                    classCode: 'STANDARDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Choice (Non-Nicotine)',
                    classCode: 'STANDARDPLUSNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Plus (Non-Nicotine)',
                    classCode: 'PREFERREDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Elite (Non-Nicotine)',
                    classCode: 'ELITENONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
            ],
            riders: [
                {
                    riderName: 'Accidental Death Benefit Rider',
                    riderCode: 'Rider_ADR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 10_000,
                        faceMax: 300_000,
                    },
                },
                {
                    riderName: "Children's Term Insurance Rider",
                    riderCode: 'Rider_CTR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 5_000,
                        faceMax: 25_000,
                    },
                },
                {
                    riderName:
                        'Accelerated Death Benefit Rider for Terminal Illness',
                    riderCode: 'Rider_ABRTRM',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                    },
                },
                {
                    riderName: 'Charitable Giving Rider',
                    riderCode: 'Rider_CGR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                    },
                },
                {
                    riderName: 'Waiver of Premium Rider',
                    riderCode: 'Rider_WPR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                    },
                },
            ],
        },
        {
            productName: 'Return of Premium Term Life 30 Yr',
            planCode: 'TR0101',
            termLength: 30,
            classes: [
                {
                    className: 'Gold (Nicotine)',
                    classCode: 'STANDARDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 45,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Gold Plus (Nicotine)',
                    classCode: 'PREFERREDTOBACCO',
                    alternatives: {
                        nicotine: 'Y',
                        ageMin: 18,
                        ageMax: 45,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum (Non-Nicotine)',
                    classCode: 'STANDARDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 45,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Choice (Non-Nicotine)',
                    classCode: 'STANDARDPLUSNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 45,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Plus (Non-Nicotine)',
                    classCode: 'PREFERREDNONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 45,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
                {
                    className: 'Platinum Elite (Non-Nicotine)',
                    classCode: 'ELITENONTOBACCO',
                    alternatives: {
                        nicotine: 'N',
                        ageMin: 18,
                        ageMax: 45,
                        faceMin: 50_000,
                        faceMax: 10_000_000,
                    },
                },
            ],
            riders: [
                {
                    riderName: 'Accidental Death Benefit Rider',
                    riderCode: 'Rider_ADR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 45,
                        faceMin: 10_000,
                        faceMax: 300_000,
                    },
                },
                {
                    riderName: "Children's Term Insurance Rider",
                    riderCode: 'Rider_CTR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 55,
                        faceMin: 5_000,
                        faceMax: 25_000,
                    },
                },
                {
                    riderName:
                        'Accelerated Death Benefit Rider for Terminal Illness',
                    riderCode: 'Rider_ABRTRM',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 45,
                    },
                },
                {
                    riderName: 'Charitable Giving Rider',
                    riderCode: 'Rider_CGR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 45,
                    },
                },
                {
                    riderName: 'Waiver of Premium Rider',
                    riderCode: 'Rider_WPR',
                    alternatives: {
                        ageMin: 18,
                        ageMax: 45,
                    },
                },
            ],
        },
    ],
} as const;
