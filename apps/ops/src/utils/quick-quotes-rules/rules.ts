import { RulesModel } from './types';

export const RULES_MODEL: RulesModel = {
    classOrder: [
        'Gold (Nicotine)',
        'Gold Plus (Nicotine)',
        'Platinum (Non-Nicotine)',
        'Platinum Choice (Non-Nicotine)',
        'Platinum Plus (Non-Nicotine)',
        'Platinum Elite (Non-Nicotine)',
    ],
    products: [
        {
            productName: 'Term Life 10 Yr',
            planCode: 'TL0101',
            termLength: 10,
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
                    classCode: 'PREFERREDTOBACCO',
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
                    classCode: 'PREFERREDTOBACCO',
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
                    classCode: 'PREFERREDTOBACCO',
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
                    classCode: 'PREFERREDTOBACCO',
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
        },
        {
            productName: 'Return of Premium Term Life 20 Yr', // Excek shows Life 20 Yr, prodcut aPI returns 10 and 30  as term length for ROP
            planCode: 'TR0101',
            termLength: 10,
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
                    classCode: 'PREFERREDTOBACCO',
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
                    classCode: 'PREFERREDTOBACCO',
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
        },
    ],
} as const;
