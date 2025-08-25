import { QuestionnaireBlueprint } from '@zinnia/form-engine-sdk';

export const farmersTermBlueprintTL0101 = {
    sectionBlueprints: [
        {
            id: '9fd6392a-a71d-41a1-bd6d-215c09de44ab',
            sectionGroupKey: 'contract',
            partName: 'custom-b2bdbe28-f776-4cd6-b873-4193475e137e',
            title: {
                en: 'Insured',
            },
            modules: ['insuranceApplication'],
            isCustom: true,
            subsections: [
                {
                    id: 'd0ef9652-d120-4d7f-8e99-b86c9522e41e',
                    partName: 'custom-a6c28eb6-a481-4813-934b-674950c93af1',
                    text: {},
                    title: {},
                    isCustom: true,
                    fieldGroups: [
                        {
                            id: 'a66ca6bc-2ea4-4b0c-9816-2481fa8029c4',
                            partName:
                                'custom-96000823-7ada-4474-949d-c60f31b9909e',
                            text: {},
                            title: {
                                en: 'Personal Details',
                            },
                            isCustom: true,
                            fields: [
                                {
                                    fieldType: 'custom',
                                    customName: 'Tags',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    answerNodeId: 'insured-full-name-tag',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: 'af14ff42-5af7-4c68-97a9-25fb0235238f',
                                    partName:
                                        'custom-c839d414-0126-466b-9f9f-af3e591b1715',
                                    validateAs: 'custom',
                                    customProperties: {
                                        tagNodeIds: [
                                            'insured-first-name',
                                            'insured-last-name',
                                        ],
                                    },
                                },
                                {
                                    fieldType: 'custom',
                                    customName: 'Tags',
                                    text: {
                                        en: 'Age: ',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    answerNodeId: 'insured-age-tag',
                                    outputPath: 'insuredAgeTag',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '594d0c5d-0d13-4d61-a11c-81c0fdc848b6',
                                    partName:
                                        'custom-795fd778-ee97-4e0b-b58d-d7ce2bc0b1e4',
                                    validateAs: 'custom',
                                    customProperties: {
                                        tagNodeIds: ['insured-age-tag'],
                                    },
                                },
                                {
                                    fieldType: 'custom',
                                    customName: 'Tags',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    answerNodeId: 'insured-sex-tag',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '7ae202f9-d12f-47c0-ae30-19a7d6c27707',
                                    partName:
                                        'custom-5e8d3264-9503-41d9-8dc4-87b28d2852cf',
                                    validateAs: 'custom',
                                    customProperties: {
                                        tagNodeIds: ['sex'],
                                    },
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Issue Age',
                                        fr: '',
                                    },
                                    answerNodeId: 'insured-issue-age',
                                    outputPath: 'insured.issueAge',
                                    valid: [
                                        {
                                            id: 'f41a1156-7d54-45db-a707-d1ce6f7f9227',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 0,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 75,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'This property requires a value which is an INTEGER and is >=0 and is <=75 and must be entered.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    renderOn: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 3,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '258e9ad2-b65f-4a82-886e-743cdf7dd585',
                                    partName:
                                        'custom-4a7beb6f-5685-40e7-bac8-b66457e6ba27',
                                    validateAs: 'integer',
                                },
                                {
                                    fieldType: 'radio',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    answerNodeId: 'nicotine-user',
                                    renderOn: [],
                                    platforms: ['consumer'],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '802770fc-7630-4b7e-8a33-c620c5161a32',
                                    partName:
                                        'custom-e2eb644a-8ee8-4b2d-9c92-46eb380224a0',
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: 'nicotine',
                                            text: {
                                                en: 'Nicotine',
                                            },
                                            isCustom: true,
                                        },
                                        {
                                            value: 'non-Nicotine',
                                            text: {
                                                en: 'Non-Nicotine',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 18,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'greaterThanOrEqual',
                                            },
                                        ],
                                    },
                                    disabled: true,
                                },
                                {
                                    fieldType: 'input',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Insured First Name',
                                        fr: '',
                                    },
                                    answerNodeId: 'insured-first-name',
                                    outputPath: 'insured.firstName',
                                    renderOn: [],
                                    platforms: ['consumer'],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '21ae1648-1015-4eb3-b266-154ff1b3d3db',
                                    partName:
                                        'custom-c80908bb-7926-4e84-ac41-e795a54530c5',
                                    validateAs: 'string',
                                    disabled: true,
                                },
                                {
                                    fieldType: 'input',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Insured Middle Name',
                                        fr: '',
                                    },
                                    answerNodeId: 'insured-middle-name',
                                    outputPath: 'insured.middleName',
                                    renderOn: [],
                                    platforms: ['consumer'],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '0239aee6-1079-4ae0-b392-369fb2ba4442',
                                    partName:
                                        'custom-7915ec43-73a9-47b3-abca-8f7a3619222c',
                                    validateAs: 'string',
                                    disabled: true,
                                },
                                {
                                    fieldType: 'input',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Insured Last Name',
                                        fr: '',
                                    },
                                    answerNodeId: 'insured-last-name',
                                    outputPath: 'insured.lastName',
                                    renderOn: [],
                                    platforms: ['consumer'],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: 'cdac003e-ee4b-42f5-9174-a06ccbdeef62',
                                    partName:
                                        'custom-7c7583c9-7561-4e7b-bcf3-2d1a1981ff9e',
                                    validateAs: 'string',
                                    disabled: true,
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'State of Issue',
                                        fr: '',
                                    },
                                    answerNodeId: 'state-of-issue',
                                    outputPath: 'jurisdiction',
                                    renderOn: [],
                                    platforms: ['consumer'],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: 'b18cf5ed-a5a1-46f1-89f6-5e61711a12d6',
                                    partName:
                                        'custom-61be58a0-d044-4107-9e3a-10699d4ad6eb',
                                    disabled: true,
                                    selectOptions: [
                                        {
                                            text: {
                                                en: 'Alabama',
                                                fr: 'Alabama',
                                            },
                                            value: 'AL',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Alaska',
                                                fr: 'Alaska',
                                            },
                                            value: 'AK',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'American Samoa',
                                                fr: 'Samoa américaines',
                                            },
                                            value: 'AS',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'Arizona',
                                                fr: 'Arizona',
                                            },
                                            value: 'AZ',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Arkansas',
                                                fr: 'Arkansas',
                                            },
                                            value: 'AR',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'California',
                                                fr: 'Californie',
                                            },
                                            value: 'CA',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Colorado',
                                                fr: 'Colorado',
                                            },
                                            value: 'CO',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Connecticut',
                                                fr: 'Connecticut',
                                            },
                                            value: 'CT',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'District of Columbia',
                                                fr: 'District of Columbia',
                                            },
                                            value: 'DC',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'Delaware',
                                                fr: 'Delaware',
                                            },
                                            value: 'DE',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Florida',
                                                fr: 'Floride',
                                            },
                                            value: 'FL',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'Georgia',
                                                fr: 'Géorgie',
                                            },
                                            value: 'GA',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Guam',
                                                fr: 'Guam',
                                            },
                                            value: 'GU',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'Hawaii',
                                                fr: 'Hawaï',
                                            },
                                            value: 'HI',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'Idaho',
                                                fr: 'Idaho',
                                            },
                                            value: 'ID',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Illinois',
                                                fr: 'Illinois',
                                            },
                                            value: 'IL',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Indiana',
                                                fr: 'Indiana',
                                            },
                                            value: 'IN',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Iowa',
                                                fr: 'Iowa',
                                            },
                                            value: 'IA',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Kansas',
                                                fr: 'Kansas',
                                            },
                                            value: 'KS',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Kentucky',
                                                fr: 'Kentucky',
                                            },
                                            value: 'KY',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Louisiana',
                                                fr: 'Louisiane',
                                            },
                                            value: 'LA',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'Maine',
                                                fr: 'Maine',
                                            },
                                            value: 'ME',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Maryland',
                                                fr: 'Maryland',
                                            },
                                            value: 'MD',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Massachusetts',
                                                fr: 'Massachusetts',
                                            },
                                            value: 'MA',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Michigan',
                                                fr: 'Michigan',
                                            },
                                            value: 'MI',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Minnesota',
                                                fr: 'Minnesota',
                                            },
                                            value: 'MN',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Mississippi',
                                                fr: 'Mississippi',
                                            },
                                            value: 'MS',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Missouri',
                                                fr: 'Missouri',
                                            },
                                            value: 'MO',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Montana',
                                                fr: 'Montana',
                                            },
                                            value: 'MT',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Nebraska',
                                                fr: 'Nebraska',
                                            },
                                            value: 'NE',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Nevada',
                                                fr: 'Nevada',
                                            },
                                            value: 'NV',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'New Hampshire',
                                                fr: 'New Hampshire',
                                            },
                                            value: 'NH',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'New Jersey',
                                                fr: 'New Jersey',
                                            },
                                            value: 'NJ',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'New Mexico',
                                                fr: 'Nouveau-Mexique',
                                            },
                                            value: 'NM',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'New York',
                                                fr: 'New York',
                                            },
                                            value: 'NY',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'North Carolina',
                                                fr: 'Caroline du Nord ',
                                            },
                                            value: 'NC',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'North Dakota',
                                                fr: 'Dakota du Nord',
                                            },
                                            value: 'ND',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Northern Mariana Islands',
                                                fr: 'Îles Mariannes du Nord',
                                            },
                                            value: 'MP',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'Ohio',
                                                fr: 'Ohio',
                                            },
                                            value: 'OH',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Oklahoma',
                                                fr: 'Oklahoma',
                                            },
                                            value: 'OK',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Oregon',
                                                fr: 'Oregon',
                                            },
                                            value: 'OR',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Pennsylvania',
                                                fr: 'Pennsylvanie',
                                            },
                                            value: 'PA',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Puerto Rico',
                                                fr: 'Puerto Rico',
                                            },
                                            value: 'PR',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'Rhode Island',
                                                fr: 'Rhode Island',
                                            },
                                            value: 'RI',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'South Carolina',
                                                fr: 'Caroline du Sud',
                                            },
                                            value: 'SC',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'South Dakota',
                                                fr: 'Dakota du Sud',
                                            },
                                            value: 'SD',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Tennessee',
                                                fr: 'Tennessee',
                                            },
                                            value: 'TN',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Texas',
                                                fr: 'Texas',
                                            },
                                            value: 'TX',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'U.S. Virgin Islands',
                                                fr: 'Îles mineures éloignées des États-Unis',
                                            },
                                            value: 'VI',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'U.S. Minor Outlying Islands',
                                                fr: 'Îles mineures éloignées des États-Unis',
                                            },
                                            value: 'UM',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'Utah',
                                                fr: 'Utah',
                                            },
                                            value: 'UT',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Vermont',
                                                fr: 'Vermont',
                                            },
                                            value: 'VT',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Virginia',
                                                fr: 'Virginie',
                                            },
                                            value: 'VA',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Washington',
                                                fr: 'Washington',
                                            },
                                            value: 'WA',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'West Virginia',
                                                fr: 'Virginie-Occidentale',
                                            },
                                            value: 'WV',
                                            orderingIndex: 1,
                                            hidden: true,
                                        },
                                        {
                                            text: {
                                                en: 'Wisconsin',
                                                fr: 'Wisconsin',
                                            },
                                            value: 'WI',
                                            orderingIndex: 1,
                                        },
                                        {
                                            text: {
                                                en: 'Wyoming',
                                                fr: 'Wyoming',
                                            },
                                            value: 'WY',
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Sex at Birth',
                                        fr: '',
                                    },
                                    outputPath: 'insured.gender',
                                    answerNodeId: 'sex',
                                    renderOn: [],
                                    platforms: ['consumer'],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: 'fd4db8c2-e5f4-4cc8-a143-4fe1ebdc39c4',
                                    partName:
                                        'custom-b79336d0-71ff-4bac-8df6-4e36aa79651b',
                                    selectOptions: [
                                        {
                                            value: 'FEMALE',
                                            text: {
                                                en: 'Female',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'MALE',
                                            text: {
                                                en: 'Male',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    disabled: true,
                                    defaultValue: 'MALE',
                                },
                                {
                                    fieldType: 'date',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Date of Birth',
                                        fr: '',
                                    },
                                    outputPath: 'insured.dateOfBirth',
                                    answerNodeId: 'date-of-birth',
                                    renderOn: [],
                                    platforms: ['consumer'],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '160d7706-d2da-4869-8e7b-cecd777be910',
                                    partName:
                                        'custom-48e9160a-44da-447e-9882-8dd9718a9c13',
                                    validateAs: 'pastDate',
                                    valid: [
                                        {
                                            id: '6b71ae8b-b8d9-41a9-90c5-0977fca5b505',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'ageRangeCondition',
                                                                value: {
                                                                    minAge: 18,
                                                                    maxAge: 75,
                                                                    unit: 'year',
                                                                },
                                                                targetBirthdateNodeId:
                                                                    'date-of-birth',
                                                                roundingType:
                                                                    'lastBirthday',
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The age must be 18-75.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    disabled: true,
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Premium Class',
                                        fr: '',
                                    },
                                    answerNodeId: 'premium-class',
                                    outputPath: 'premiumClass',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '8547480e-81a4-4778-b71d-870dfc0a3e5b',
                                    partName:
                                        'custom-39bf8d14-b635-4116-8f0f-9894409d6af8',
                                    selectOptions: [
                                        {
                                            value: 'STANDARDNONTOBACCO',
                                            text: {
                                                en: 'Platinum',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'STANDARDPLUSNONTOBACCO',
                                            text: {
                                                en: 'Platinum Choice',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'PREFERREDNONTOBACCO',
                                            text: {
                                                en: 'Platinum Plus',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'ELITENONTOBACCO',
                                            text: {
                                                en: 'Platinum Elite',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'STANDARDTOBACCO',
                                            text: {
                                                en: 'Gold',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'PREFERREDTOBACCO',
                                            text: {
                                                en: 'Gold Plus',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'STANDARDNONTOBACCO',
                                },
                                {
                                    fieldType: 'checkboxGroup',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'table-or-flat-extra-selection',
                                    outputPath: 'tableOrFlatExtraSelection',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {},
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: 'ee983615-56d5-459d-9000-57bc8910d0fd',
                                    partName:
                                        'custom-281f12c6-5c81-473e-ab5d-30a885b717ad',
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: 'selectTableOrFlatExtraRatings',
                                            text: {
                                                en: 'Add sub-standard rating',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: [
                                                    'STANDARDNONTOBACCO',
                                                    'STANDARDTOBACCO',
                                                ],
                                                targetNodeId: 'premium-class',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                        },
                        {
                            id: 'e14e16f6-4196-470f-8ee4-0d7bec08a300',
                            partName:
                                'custom-bda1ddd1-5dc1-4e77-b473-42e93aab6333',
                            text: {},
                            title: {},
                            isCustom: true,
                            fields: [
                                {
                                    fieldType: 'information',
                                    text: {
                                        en: 'For Table or Flat Extra Ratings, please select one of the Substandard classes',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    answerNodeId: 'table-flat-ratings-info',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 12,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '1533d9cf-87e8-4ebe-b1cf-9c607b2dc6ce',
                                    partName:
                                        'custom-8beadcd6-616c-4a31-9ed5-625db38a1927',
                                    variant: 'info',
                                    validateAs: 'string',
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Table Rating',
                                        fr: '',
                                    },
                                    answerNodeId: 'table-rating',
                                    outputPath: 'subStandardRating',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '47bc5261-7647-4d16-bee0-4eacfb10e434',
                                    partName:
                                        'custom-58f1c54d-284d-4650-86c3-6e6274e7f4f5',
                                    selectOptions: [
                                        {
                                            value: 'NONETABLE',
                                            text: {
                                                en: 'None',
                                            },
                                            isCustom: true,
                                            orderingIndex: 2,
                                        },
                                        {
                                            value: 'TABLEA',
                                            text: {
                                                en: 'A',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEB',
                                            text: {
                                                en: 'B',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEC',
                                            text: {
                                                en: 'C',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLED',
                                            text: {
                                                en: 'D',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEE',
                                            text: {
                                                en: 'E',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEF',
                                            text: {
                                                en: 'F',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEG',
                                            text: {
                                                en: 'G',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEH',
                                            text: {
                                                en: 'H',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEI',
                                            text: {
                                                en: 'I',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEJ',
                                            text: {
                                                en: 'J',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEK',
                                            text: {
                                                en: 'K',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEL',
                                            text: {
                                                en: 'L',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEM',
                                            text: {
                                                en: 'M',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEN',
                                            text: {
                                                en: 'N',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEO',
                                            text: {
                                                en: 'O',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEP',
                                            text: {
                                                en: 'P',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    isCustom: true,
                                    defaultValue: 'NONETABLE',
                                },
                                {
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Temporary Flat Extra',
                                        fr: '',
                                    },
                                    answerNodeId: 'temporary-flat-extra',
                                    outputPath: 'temporaryFlatExtra.amount',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '75b52f5f-5c10-4f2e-97ec-592dc9acfa8b',
                                    partName:
                                        'custom-242542b0-1cb1-417d-b276-44e0aa006b52',
                                    validateAs: 'decimal',
                                    valid: [
                                        {
                                            id: 'ddf60c38-eb5e-439c-8a16-1412c8f72bd7',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 15,
                                                                targetNodeId:
                                                                    'temporary-flat-extra',
                                                                operator:
                                                                    'lessThanOrEqual',
                                                            },
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 0,
                                                                targetNodeId:
                                                                    'temporary-flat-extra',
                                                                operator:
                                                                    'greaterThanOrEqual',
                                                            },
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 0.5,
                                                                targetNodeId:
                                                                    'temporary-flat-extra',
                                                                operator:
                                                                    'multipleOf',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        type: 'emptinessCondition',
                                                        isEmpty: true,
                                                        targetNodeId:
                                                            'temporary-flat-extra',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The temporary flat extra must be less than or equal to $15.00 and a multiple of $0.50.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    isCustom: true,
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: [
                                                    'selectTableOrFlatExtraRatings',
                                                ],
                                                targetNodeId:
                                                    'table-or-flat-extra-selection',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                            visible: {
                                booleanOperator: 'and',
                                conditions: [
                                    {
                                        type: 'matchesCondition',
                                        value: [
                                            'selectTableOrFlatExtraRatings',
                                        ],
                                        targetNodeId:
                                            'table-or-flat-extra-selection',
                                        quantifier: 'any',
                                    },
                                ],
                            },
                        },
                        {
                            id: 'cec5bf91-116c-42c0-a03e-92b69ffd7cdd',
                            partName:
                                'custom-8cb0b7a2-c892-401d-aecd-f41b0c97a24b',
                            text: {},
                            title: {
                                en: 'Temporary Flat Extra Schedule',
                            },
                            isCustom: true,
                            fields: [
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Duration',
                                        fr: '',
                                    },
                                    answerNodeId: 'schedule-duration',
                                    outputPath: 'temporaryFlatExtra.duration',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                        forceNewLine: true,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '2ff66fed-483c-459d-9c5f-fb64ff59131d',
                                    partName:
                                        'custom-02e07017-570f-4ffb-ab7b-edee1174b021',
                                    validateAs: 'integer',
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Duration Unit',
                                        fr: '',
                                    },
                                    answerNodeId: 'schedule-duration-unit',
                                    outputPath:
                                        'temporaryFlatExtra.durationType',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: 'ae6b4e38-3982-49bb-b4b1-e0688ed12bba',
                                    partName:
                                        'custom-2137dbfd-b52d-4ca1-92f3-e8b8f59e10ee',
                                    selectOptions: [
                                        {
                                            value: 'YEARS',
                                            text: {
                                                en: 'Years',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'MONTHS',
                                            text: {
                                                en: 'Months',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'YEARS',
                                },
                            ],
                            displayAsCard: true,
                            copyable: 'none',
                            visible: {
                                booleanOperator: 'and',
                                conditions: [
                                    {
                                        type: 'matchesCondition',
                                        value: [
                                            'selectTableOrFlatExtraRatings',
                                        ],
                                        targetNodeId:
                                            'table-or-flat-extra-selection',
                                        quantifier: 'any',
                                    },
                                    {
                                        type: 'numberComparisonCondition',
                                        value: 0,
                                        targetNodeId: 'temporary-flat-extra',
                                        operator: 'greaterThan',
                                    },
                                ],
                            },
                        },
                        {
                            id: '10e41f1d-3a9d-4bb4-9d3a-c8efcfa2da4b',
                            partName:
                                'custom-cf8774cd-af80-4589-87bc-626d9c2b4193',
                            text: {},
                            title: {},
                            isCustom: true,
                            fields: [
                                {
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Permanent Flat Extra',
                                        fr: '',
                                    },
                                    answerNodeId: 'permanent-flat-extra',
                                    outputPath: 'permanentFlatExtra.amount',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '4ba0c468-06b7-4ac5-94c0-efbe34d8d101',
                                    partName:
                                        'custom-858d837e-8edf-4cb8-8367-6186b65d48cf',
                                    validateAs: 'decimal',
                                    valid: [
                                        {
                                            id: 'ddf60c38-eb5e-439c-8a16-1412c8f72bd7',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 15,
                                                                targetNodeId:
                                                                    'permanent-flat-extra',
                                                                operator:
                                                                    'lessThanOrEqual',
                                                            },
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 0,
                                                                targetNodeId:
                                                                    'permanent-flat-extra',
                                                                operator:
                                                                    'greaterThanOrEqual',
                                                            },
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 0.5,
                                                                targetNodeId:
                                                                    'permanent-flat-extra',
                                                                operator:
                                                                    'multipleOf',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        type: 'emptinessCondition',
                                                        isEmpty: true,
                                                        targetNodeId:
                                                            'permanent-flat-extra',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The permanent flat extra must be less than or equal to $15.00 and a multiple of $0.50.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    isCustom: true,
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                            visible: {
                                booleanOperator: 'and',
                                conditions: [
                                    {
                                        type: 'matchesCondition',
                                        value: [
                                            'selectTableOrFlatExtraRatings',
                                        ],
                                        targetNodeId:
                                            'table-or-flat-extra-selection',
                                        quantifier: 'any',
                                    },
                                ],
                            },
                        },
                        {
                            id: '2bb31d72-a6ec-414a-bb67-16fdbfa91ff9',
                            partName:
                                'custom-e27fe421-38cc-4979-a1d6-0f22f6200e31',
                            text: {},
                            title: {
                                en: 'Adjustments',
                            },
                            isCustom: true,
                            fields: [
                                {
                                    fieldType: 'checkboxGroup',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    answerNodeId: 'multiple-policy-owner',
                                    outputPath: 'discountIndicator',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '73209330-ce34-4084-bff5-dc40a6d966fc',
                                    partName:
                                        'custom-86910a5b-146a-48c0-9185-c8999658c49e',
                                    selectOptions: [
                                        {
                                            value: 'MULTIPRODUCT',
                                            text: {
                                                en: "Farmer's Multiple Policy Owner",
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                    ],
                                    validateAs: 'string',
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                        },
                    ],
                    showInNavigation: false,
                    copyable: 'none',
                },
            ],
            copyable: 'none',
        },
        {
            id: '0defa8b5-f08b-47be-86b4-96234f271b31',
            sectionGroupKey: 'contract',
            partName: 'custom-d9198ce5-c58d-4f35-8824-59ce953474f2',
            title: {
                en: 'Coverage',
            },
            modules: ['insuranceApplication'],
            isCustom: true,
            subsections: [
                {
                    id: '87cb6064-4260-4aa5-8cff-0d4fbcc6f6c6',
                    partName: 'custom-0b4f7c5d-0a06-455a-91e1-f556199df632',
                    text: {},
                    title: {
                        en: 'Coverage',
                    },
                    isCustom: true,
                    fieldGroups: [
                        {
                            id: '388f6f4b-2278-444f-8df3-b2a043f0c905',
                            partName:
                                'custom-8c249907-96bf-46a1-871c-3b32ddc59ca6',
                            text: {},
                            title: {},
                            isCustom: true,
                            fields: [
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Solve For',
                                        fr: '',
                                    },
                                    answerNodeId: 'solve-for',
                                    outputPath: 'solveFor',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '87eeddca-274c-44dd-b0b5-f91902917cf8',
                                    partName:
                                        'custom-5182d038-db4b-4bd6-a675-59133b5b53c8',
                                    selectOptions: [
                                        {
                                            value: 'PREMIUM',
                                            text: {
                                                en: 'Premium',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'FACE',
                                            text: {
                                                en: 'Face Amount',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'PREMIUM',
                                },
                                {
                                    fieldType: 'money',
                                    defaultValue: 50000,
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Face Amount',
                                        fr: '',
                                    },
                                    answerNodeId: 'face-amount',
                                    outputPath: 'baseCoverage.currentAmount',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '55ebb606-92ee-4ddc-a0b4-ecc7e9acd5d8',
                                    partName:
                                        'custom-6b0d4bee-65ad-4156-91ec-4c19f480f275',
                                    validateAs: 'integer',
                                    valid: [
                                        {
                                            id: '6d18b6e2-a9e2-4c00-bdd0-14d07174ef6d',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 50000,
                                                        targetNodeId:
                                                            'face-amount',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The minimum is $50,000',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: '286a577c-8494-4f20-a13e-c2c967e2cd28',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 10000000,
                                                        targetNodeId:
                                                            'face-amount',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The maximum is $10,000,000',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'PREMIUM',
                                                isEqual: true,
                                                targetNodeId: 'solve-for',
                                            },
                                        ],
                                    },
                                },
                                {
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Modal Premium',
                                        fr: '',
                                    },
                                    answerNodeId: 'modal-premium',
                                    outputPath: 'modalPremiumValue',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: 'b1a3682f-2b2a-435c-9b60-7434631bd358',
                                    partName:
                                        'custom-928186e2-d4cc-4a7d-be74-06d6487c68b6',
                                    validateAs: 'integer',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'FACE',
                                                isEqual: true,
                                                targetNodeId: 'solve-for',
                                            },
                                        ],
                                    },
                                },
                                {
                                    fieldType: 'dropdown',
                                    defaultValue: '10',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Level Term Period',
                                        fr: '',
                                    },
                                    answerNodeId: 'level-term-period',
                                    outputPath: 'fixedCostPeriod',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '5aa6d477-e97a-480a-b570-e277ebb4e0da',
                                    partName:
                                        'custom-19d339fc-8143-4ba5-91c3-0f03597c57e6',
                                    selectOptions: [
                                        {
                                            value: '10',
                                            text: {
                                                en: 'Term 10',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                            visible: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 18,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 75,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                        },

                                        {
                                            value: '15',
                                            text: {
                                                en: 'Term 15',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                            visible: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 18,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 70,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            value: '20',
                                            text: {
                                                en: 'Term 20',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                            visible: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 18,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 65,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            value: '30',
                                            text: {
                                                en: 'Term 30',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                            visible: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 18,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 50,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                    validateAs: 'string',
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                        },
                        {
                            id: '9bb00c0d-2e4e-4688-b0e9-5aa03b187867',
                            partName:
                                'custom-d7d0aff4-61aa-487e-90c7-30d04cb057f3',
                            text: {},
                            title: {},
                            isCustom: true,
                            fields: [
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Premium Mode',
                                        fr: '',
                                    },
                                    answerNodeId: 'premium-mode',
                                    outputPath: 'paymentMode',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '5829b2a4-edde-4a51-bf4a-73637fd6ddb2',
                                    partName:
                                        'custom-6ba00b34-9327-4f8f-beb8-72692621c37a',
                                    selectOptions: [
                                        {
                                            value: 'MONTHLY',
                                            text: {
                                                en: 'Monthly',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'QUARTERLY',
                                            text: {
                                                en: 'Quarterly',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'SEMIANNUAL',
                                            text: {
                                                en: 'Semi-Annual',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'ANNUAL',
                                            text: {
                                                en: 'Annual',
                                            },
                                            isCustom: true,
                                            orderingIndex: 2,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'MONTHLY',
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Payment Mode',
                                        fr: '',
                                    },
                                    answerNodeId: 'payment-mode',
                                    outputPath: 'paymentMethod',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '5f3b6863-5845-4a2d-9cd7-ad0160ec5fbd',
                                    partName:
                                        'custom-89613af1-6b8e-4673-848b-9f890c0e6e4a',
                                    selectOptions: [
                                        {
                                            value: 'ACH',
                                            text: {
                                                en: 'Electronic Funds Transfer (EFT)',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'CREDITCARD',
                                            text: {
                                                en: 'Credit Card',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'ACH',
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                        },
                    ],
                    showInNavigation: false,
                    copyable: 'none',
                },
            ],
            copyable: 'none',
        },
        {
            id: '90e31710-b95e-48a1-90e0-e320cd4426cd',
            sectionGroupKey: 'contract',
            partName: 'custom-445b598e-5a90-4fc6-a92d-b5aacdf5a728',
            title: {
                en: 'Riders',
            },
            modules: ['insuranceApplication'],
            isCustom: true,
            subsections: [
                {
                    id: '8312dbd3-a86f-4822-89f2-5b2a8ae254d0',
                    partName: 'custom-9ff4a82f-e298-4c2b-b775-68e697095a40',
                    text: {},
                    title: {},
                    isCustom: true,
                    fieldGroups: [
                        {
                            id: 'e9672bf7-4b1d-4aa5-b1c7-ed97ff594d6c',
                            partName:
                                'custom-0f6122f3-3d98-456a-9ef5-e49ad70ad7a8',
                            text: {},
                            title: {
                                en: 'Riders',
                            },
                            isCustom: true,
                            fields: [
                                {
                                    answerNodeId:
                                        'accidental-death-benefit-rider',
                                    outputPath:
                                        'riders.accidentalDeathBenefitRider.values',
                                    fieldType: 'checkboxGroup',
                                    id: '2ae303f9-3282-4207-85e1-7bd97a99a016',
                                    partName:
                                        'custom-82b7a540-c743-4494-85c2-bd4f57ca424e',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 18,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'greaterThanOrEqual',
                                            },
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 60,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'lessThanOrEqual',
                                            },
                                        ],
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    copyable: 'none',
                                    optional: true,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 12,
                                        forceNewLine: false,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: 'Rider_ADR',
                                            text: {
                                                en: 'Accidental Death Benefit Rider',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                },
                                {
                                    answerNodeId:
                                        'accidental-death-benefit-rider-benefit',
                                    outputPath:
                                        'riders.accidentalDeathBenefitRider.benefit',
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Benefit',
                                        fr: '',
                                    },
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '35f713f1-e857-4a91-ac32-9e75ffe9fdb9',
                                    partName:
                                        'custom-73695d64-bff2-41eb-a581-bebebb2b0001',
                                    validateAs: 'integer',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: ['Rider_ADR'],
                                                targetNodeId:
                                                    'accidental-death-benefit-rider',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                    valid: [
                                        {
                                            id: 'f07f1426-7063-453b-b268-9b9d32cff1c8',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 10000,
                                                        targetNodeId:
                                                            'accidental-death-benefit-rider-benefit',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The minimum is $10,000.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: 'c5148de6-b2f2-4e73-a80c-839f7b952e1c',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 300000,
                                                        targetNodeId:
                                                            'accidental-death-benefit-rider-benefit',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The maximum is $300,000.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                },
                                {
                                    answerNodeId:
                                        'accidental-death-benefit-rider-table-rating',
                                    outputPath:
                                        'riders.accidentalDeathBenefitRider.tableRating',
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Table Rating',
                                        fr: '',
                                    },
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '2f1ecfcb-2aca-46c3-a691-ae2377c77363',
                                    partName:
                                        'custom-1c1c6151-41e3-4a7f-8f2c-cc55c6b077f0',
                                    selectOptions: [
                                        {
                                            value: 'NONETABLE',
                                            text: {
                                                en: 'Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'TABLEB',
                                            text: {
                                                en: '1.5 x Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLED',
                                            text: {
                                                en: '2.0 x Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEF',
                                            text: {
                                                en: '2.5 x Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEH',
                                            text: {
                                                en: '3.0 x Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'NONETABLE',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: ['Rider_ADR'],
                                                targetNodeId:
                                                    'accidental-death-benefit-rider',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                },
                                {
                                    answerNodeId:
                                        'children-term-insurance-rider',
                                    outputPath:
                                        'riders.childrenTermInsuranceRider.values',
                                    fieldType: 'checkboxGroup',
                                    id: 'ac44bd3a-7077-429d-92d0-b04d4a14ed0a',
                                    partName:
                                        'custom-0ecc2535-caf6-469b-af91-47a9dc24d9d4',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 18,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'greaterThanOrEqual',
                                            },
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 55,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'lessThanOrEqual',
                                            },
                                        ],
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    copyable: 'none',
                                    optional: true,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 12,
                                        forceNewLine: false,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: 'Rider_CTR',
                                            text: {
                                                en: "Children's Term Insurance Rider",
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                },
                                {
                                    answerNodeId:
                                        'children-term-insurance-rider-face-amount',
                                    outputPath:
                                        'riders.childrenTermInsuranceRider.faceAmount',
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Face Amount',
                                        fr: '',
                                    },
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '5e080533-1769-489e-ba38-7b7dfc9c509a',
                                    partName:
                                        'custom-da961adc-7b66-4d12-8022-b6973b5a102c',
                                    validateAs: 'integer',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: ['Rider_CTR'],
                                                targetNodeId:
                                                    'children-term-insurance-rider',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                    valid: [
                                        {
                                            id: '46dbf562-418c-4c05-913d-3cf6931eea98',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 5000,
                                                        targetNodeId:
                                                            'children-term-insurance-rider-face-amount',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The minimum is $5,000.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: 'a1624721-8c24-4494-a08a-c02f400dc714',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 25000,
                                                        targetNodeId:
                                                            'children-term-insurance-rider-face-amount',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The maximum is $25,000.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    defaultValue: 5000,
                                },
                                {
                                    answerNodeId: 'waiver-of-premium-rider',
                                    outputPath:
                                        'riders.waiverOfPremiumRider.values',
                                    fieldType: 'checkboxGroup',
                                    id: 'ddf1e1f8-9e8d-44ec-bf42-ad91d34d5bdd',
                                    partName:
                                        'custom-26c26d0e-0178-44a9-a224-ca853e7fcaea',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 18,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'greaterThanOrEqual',
                                            },
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 55,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'lessThanOrEqual',
                                            },
                                        ],
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    copyable: 'none',
                                    optional: true,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 12,
                                        forceNewLine: false,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: 'Rider_WPR',
                                            text: {
                                                en: 'Waiver of Premium Rider',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                },
                                {
                                    answerNodeId:
                                        'waiver-of-premium-rider-table-rating',
                                    outputPath:
                                        'riders.waiverOfPremiumRider.tableRating',
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Table Rating',
                                        fr: '',
                                    },
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '3c0c7a04-f0f4-414e-b640-dcc6b94959da',
                                    partName:
                                        'custom-bf30a8b8-b3d2-4f48-aac8-2668633f170e',
                                    selectOptions: [
                                        {
                                            value: 'NONETABLE',
                                            text: {
                                                en: 'Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'TABLEB',
                                            text: {
                                                en: '1.5 x Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLED',
                                            text: {
                                                en: '2.0 x Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEF',
                                            text: {
                                                en: '2.5 x Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TABLEH',
                                            text: {
                                                en: '3.0 x Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'NONETABLE',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: ['Rider_WPR'],
                                                targetNodeId:
                                                    'waiver-of-premium-rider',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                        },
                        {
                            id: '0de0f11b-938f-4c7a-92a0-107a5a478d55',
                            partName:
                                'custom-b4ffd6cf-ba90-4863-89ee-80e1566178e8',
                            text: {},
                            title: {
                                en: 'Additional premium-free riders available',
                            },
                            isCustom: true,
                            fields: [
                                {
                                    answerNodeId:
                                        'accelerated-death-benefit-rider-for-terminal-illness',
                                    outputPath:
                                        'riders.acceleratedDeathBenefitRiderForTerminalIllness.values',
                                    fieldType: 'checkboxGroup',
                                    id: '0e42cc99-3e99-4cf0-87b0-1d514c9ae453',
                                    partName:
                                        'custom-32a53850-8f98-4e0a-9778-7c0449d47bab',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    copyable: 'none',
                                    optional: true,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 12,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: 'Rider_ABRTRM',
                                            text: {
                                                en: 'Accelerated Death Benefit Rider for Terminal Illness',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                },
                                {
                                    answerNodeId: 'charitable-giving-rider',
                                    outputPath:
                                        'riders.charitableGivingRider.values',
                                    fieldType: 'checkboxGroup',
                                    id: '6d3f588a-46c6-401c-90e7-a3638296b5e7',
                                    partName:
                                        'custom-f84b65d6-cdb9-491c-a458-0324c797f534',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    copyable: 'none',
                                    optional: true,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 12,
                                        forceNewLine: false,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: 'Rider_CGR',
                                            text: {
                                                en: 'Charitable Giving Rider',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                },
                                {
                                    answerNodeId:
                                        'chronic-illness-accelerated-death-benefit-rider',
                                    outputPath:
                                        'riders.chronicIllnessAcceleratedDeathBenefitRider.values',
                                    fieldType: 'checkboxGroup',
                                    id: '80af6907-476e-43e4-a452-4fc6017a3805',
                                    partName:
                                        'custom-6e1ec913-a3ce-43ba-8195-7c9f046811e9',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: ['Rider_ABRTRM'],
                                                targetNodeId:
                                                    'accelerated-death-benefit-rider-for-terminal-illness',
                                                quantifier: 'any',
                                            },
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 18,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'greaterThanOrEqual',
                                            },
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 70,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'lessThanOrEqual',
                                            },
                                        ],
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    copyable: 'none',
                                    optional: true,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 12,
                                        forceNewLine: false,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: 'Rider_ABRCHR',
                                            text: {
                                                en: 'Chronic Illness Accelerated Death Benefit Rider',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                    hidden: true,
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                        },
                    ],
                    showInNavigation: false,
                    copyable: 'none',
                },
            ],
            copyable: 'none',
        },
    ],
    sectionGroupBlueprints: {
        insuredPeople: {
            id: 'insuredPeople',
            partName: 'insuredPeople',
        },
        contract: {
            id: 'contract',
            partName: 'contract',
        },
    },
} as QuestionnaireBlueprint;
