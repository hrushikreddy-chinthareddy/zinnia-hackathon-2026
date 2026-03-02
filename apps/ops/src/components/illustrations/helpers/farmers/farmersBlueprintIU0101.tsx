import { QuestionnaireBlueprint } from '@zinnia/form-engine-sdk';

const ILLUSTRATED_RATE = 7.03;

export const farmersBlueprintIU0101 = {
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
                    title: {
                        en: 'Personal Details',
                    },
                    isCustom: true,
                    fieldGroups: [
                        {
                            id: 'a66ca6bc-2ea4-4b0c-9816-2481fa8029c4',
                            partName:
                                'custom-96000823-7ada-4474-949d-c60f31b9909e',
                            text: {},
                            title: {},
                            isCustom: true,
                            fields: [
                                {
                                    fieldType: 'radio',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Is this a conversion',
                                        fr: '',
                                    },
                                    answerNodeId: 'is-conversion',
                                    outputPath: 'isConversion',
                                    renderOn: [],
                                    platforms: ['consumer'],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {},
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: 'eff17a99-11c4-462e-8309-ff9d67d0b6b2',
                                    partName:
                                        'custom-4b626be5-96ba-4c85-aa52-df2c5e6b7436',
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: true,
                                            text: {
                                                en: 'Yes',
                                            },
                                            isCustom: true,
                                        },
                                        {
                                            value: false,
                                            text: {
                                                en: 'No',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                    disabled: true,
                                },
                                {
                                    fieldType: 'radio',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Is MEC',
                                        fr: '',
                                    },
                                    answerNodeId: 'isMec',
                                    outputPath: 'isMec',
                                    renderOn: [],
                                    platforms: ['consumer'],
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
                                    id: '27d13bc0-a1a1-4a2d-99fb-9821ddf3fbc8',
                                    partName:
                                        'custom-e5783eca-478f-4a9c-8d9c-8774dc2e0100',
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: true,
                                            text: {
                                                en: 'Yes',
                                            },
                                            isCustom: true,
                                        },
                                        {
                                            value: false,
                                            text: {
                                                en: 'No',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                    disabled: true,
                                },
                                {
                                    fieldType: 'input',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Agent First Name',
                                        fr: '',
                                    },
                                    answerNodeId: 'agent-first-name',
                                    outputPath: 'agent.firstName',
                                    renderOn: [],
                                    platforms: ['consumer'],
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
                                    id: '4b6a010c-d4ec-400a-ad11-8e4c66b4f4cb',
                                    partName:
                                        'custom-64b8c476-752e-437d-9e73-e7833a581f33',
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
                                        en: 'Agent Last Name',
                                        fr: '',
                                    },
                                    answerNodeId: 'agent-last-name',
                                    outputPath: 'agent.lastName',
                                    renderOn: [],
                                    platforms: ['consumer'],
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
                                    id: 'ec2421a8-9df3-45d9-b15a-fbc6c3c10b28',
                                    partName:
                                        'custom-1c385a15-d030-48b2-b29b-c640bf7189c3',
                                    validateAs: 'string',
                                    disabled: true,
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
                                    answerNodeId: 'insured-nicotine-tag',
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
                                    id: 'ca06eb12-f28c-4bc7-b1d5-72630d14f97a',
                                    partName:
                                        'f77424d5-24e5-4704-9664-ba1c0fa18079',
                                    validateAs: 'custom',
                                    customProperties: {
                                        tagNodeIds: ['is-nicotine-user'],
                                    },
                                },
                                {
                                    fieldType: 'radio',
                                    id: '73968a4c-3cc7-4f56-9f2c-01edb9b4fa69',
                                    partName:
                                        'custom-4319e0df-6a1e-45db-b036-b76402b4d572',
                                    referenceLabel: '',
                                    text: {
                                        en: 'Nicotine User',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    platforms: ['consumer'],
                                    renderOn: [],
                                    copyable: 'none',
                                    answerNodeId: 'is-nicotine-user',
                                    outputPath: 'insured.nicotineUser',
                                    optional: false,
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
                                            value: 'Nicotine',
                                            text: {
                                                en: 'Nicotine',
                                            },
                                            isCustom: true,
                                        },
                                        {
                                            value: 'Non-Nicotine',
                                            text: {
                                                en: 'Non-Nicotine',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                    defaultValue: 'Non-Nicotine',
                                    disabled: true,
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
                                    renderOn: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 3,
                                        forceNewLine: true,
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
                                    valid: [
                                        {
                                            id: '8a87dfcd-7904-4d35-9bc8-10bfda84b403',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 80,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Farmers Index Universal Life not available over age 80.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    disabled: {
                                        booleanOperator: 'or',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: true,
                                                targetNodeId: 'is-conversion',
                                                isEqual: true,
                                            },
                                        ],
                                    },
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
                                        forceNewLine: true,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: 'c5ecf6ea-e9f4-4722-9a11-a683aef67dcc',
                                    partName:
                                        'custom-f3331c9e-6642-4199-848b-d89312707c64',
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
                                    id: '6889cbae-0a6b-4f49-a0ce-77866acc574b',
                                    partName:
                                        'custom-1490a801-347c-4222-b59d-0bbc4c9be590',
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
                                    id: '432e23be-f3dd-4d15-9af5-e6fa42646f2e',
                                    partName:
                                        'custom-18ccde86-e6b5-463b-85ee-5b899fc20ae0',
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
                                    answerNodeId: 'sex',
                                    outputPath: 'insured.gender',
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
                                    answerNodeId: 'date-of-birth',
                                    outputPath: 'insured.dateOfBirth',
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
                                                                    minAge: 0,
                                                                    maxAge: 80,
                                                                    unit: 'year',
                                                                },
                                                                targetBirthdateNodeId:
                                                                    'date-of-birth',
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The age must be 0-80.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    disabled: true,
                                },
                                {
                                    fieldType: 'input',
                                    id: 'eafbbfee-eb08-46b2-83e4-85b8b484bb27',
                                    partName:
                                        'custom-2482f9e9-78ca-46db-b09a-7fae45b5bf42',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Age',
                                        fr: '',
                                    },
                                    platforms: ['consumer'],
                                    renderOn: [],
                                    copyable: 'none',
                                    answerNodeId: 'age',
                                    outputPath: 'insured.age',
                                    internal: {
                                        computedValue: {
                                            select: ['date-of-birth'],
                                            operator: 'formula',
                                            operatorParams: {
                                                formula:
                                                    "dateToAge(date_of_birth, 'lastBirthday', '--')",
                                            },
                                        },
                                    },
                                    valid: [
                                        {
                                            id: 'f41a1156-7d54-45db-a707-d1ce6f7f9227',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'ageRangeCondition',
                                                        value: {
                                                            minAge: 0,
                                                            maxAge: 80,
                                                            unit: 'year',
                                                        },
                                                        targetBirthdateNodeId:
                                                            'date-of-birth',
                                                        roundingType:
                                                            'lastBirthday',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'This property requires a value which is an INTEGER and is >=0 and is <80 and must be entered.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    optional: false,
                                    disabled: true,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    validateAs: 'string',
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
                                    optional: true,
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
                                    id: '8547480e-81a4-4778-b71d-870dfc0a3e5b',
                                    partName:
                                        'custom-39bf8d14-b635-4116-8f0f-9894409d6af8',
                                    disabled: {
                                        booleanOperator: 'or',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: true,
                                                targetNodeId: 'is-conversion',
                                                isEqual: true,
                                            },
                                        ],
                                    },
                                    selectOptions: [
                                        {
                                            value: 'STANDARDNONTOBACCO',
                                            text: {
                                                en: 'Platinum',
                                            },
                                            isCustom: true,
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
                                                        type: 'equalityCondition',
                                                        value: 'Non-Nicotine',
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-nicotine-user',
                                                    },
                                                ],
                                            },
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'STANDARDPLUSNONTOBACCO',
                                            text: {
                                                en: 'Platinum Choice',
                                            },
                                            isCustom: true,
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
                                                        type: 'equalityCondition',
                                                        value: 'Non-Nicotine',
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-nicotine-user',
                                                    },
                                                ],
                                            },
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'PREFERREDNONTOBACCO',
                                            text: {
                                                en: 'Platinum Plus',
                                            },
                                            isCustom: true,
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
                                                        type: 'equalityCondition',
                                                        value: 'Non-Nicotine',
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-nicotine-user',
                                                    },
                                                ],
                                            },
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'ELITENONTOBACCO',
                                            text: {
                                                en: 'Platinum Elite',
                                            },
                                            isCustom: true,
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
                                                        type: 'equalityCondition',
                                                        value: 'Non-Nicotine',
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-nicotine-user',
                                                    },
                                                ],
                                            },
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'STANDARDTOBACCO',
                                            text: {
                                                en: 'Gold',
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
                                                        type: 'equalityCondition',
                                                        value: 'Nicotine',
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-nicotine-user',
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            value: 'PREFERREDTOBACCO',
                                            text: {
                                                en: 'Gold Plus',
                                            },
                                            isCustom: true,
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
                                                        type: 'equalityCondition',
                                                        value: 'Nicotine',
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-nicotine-user',
                                                    },
                                                ],
                                            },
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'juvenile',
                                            text: {
                                                en: 'Juvenile',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                            visible: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 17,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            value: 'juvenileSubstandard',
                                            text: {
                                                en: 'Juvenile Substandard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                            visible: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 17,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            value: 'platinumSubstandard',
                                            text: {
                                                en: 'Platinum Substandard',
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
                                                        type: 'equalityCondition',
                                                        value: 'Non-Nicotine',
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-nicotine-user',
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            value: 'goldSubstandard',
                                            text: {
                                                en: 'Gold Substandard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 2,
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
                                                        type: 'equalityCondition',
                                                        value: 'Nicotine',
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-nicotine-user',
                                                    },
                                                ],
                                            },
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
                                                    'goldSubstandard',
                                                    'platinumSubstandard',
                                                    'juvenileSubstandard',
                                                ],
                                                targetNodeId: 'premium-class',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                    valid: [
                                        {
                                            id: '1c3746d9-cd75-465f-9a4b-16bcd88c9e7c',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'equalityCondition',
                                                        isEqual: false,
                                                        value: 'NONETABLE',
                                                        targetNodeId:
                                                            'table-rating',
                                                    },
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'emptinessCondition',
                                                                isEmpty: false,
                                                                targetNodeId:
                                                                    'temporary-flat-extra',
                                                            },
                                                            {
                                                                type: 'equalityCondition',
                                                                isEqual: false,
                                                                value: 0,
                                                                targetNodeId:
                                                                    'temporary-flat-extra',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'emptinessCondition',
                                                                isEmpty: false,
                                                                targetNodeId:
                                                                    'permanent-flat-extra',
                                                            },
                                                            {
                                                                type: 'equalityCondition',
                                                                isEqual: false,
                                                                value: 0,
                                                                targetNodeId:
                                                                    'permanent-flat-extra',
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'For the sub-standard rating, please select one of the Table or Flat Extra Ratings and provide input.',
                                                fr: '',
                                            },
                                        },
                                    ],
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
                                        'non-nicotine-conversion-at-age-18',
                                    outputPath: 'nonNicotineConversionAtAge18',
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
                                    id: '3342e03a-e24a-4237-83fa-84b6f76fd42b',
                                    partName:
                                        'custom-ca83e524-9217-4abc-8b3d-7dfdb29072a8',
                                    validateAs: 'string',
                                    selectOptions: [
                                        {
                                            value: 'non-NicotineConversionAtAge18',
                                            text: {
                                                en: 'Non-Nicotine Conversion at Age 18',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 17,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'lessThanOrEqual',
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
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'juvenileSubstandard',
                                                isEqual: false,
                                                targetNodeId: 'premium-class',
                                            },
                                        ],
                                    },
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
                                    id: '77e9506a-417c-4b6e-8858-e1f56644255e',
                                    partName:
                                        'custom-a9e37ed6-bd3b-4abe-8a33-060f514911ec',
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
                                    ],
                                    validateAs: 'string',
                                    isCustom: true,
                                    defaultValue: 'NONETABLE',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'juvenileSubstandard',
                                                isEqual: true,
                                                targetNodeId: 'premium-class',
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
                                            {
                                                type: 'equalityCondition',
                                                value: 'juvenileSubstandard',
                                                isEqual: false,
                                                targetNodeId: 'premium-class',
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
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '75652a6b-99af-47c7-a3af-c4d767f69453',
                                    partName:
                                        'custom-25a847f7-e8f4-4faf-be79-0fe536167ba0',
                                    valid: [
                                        {
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 1,
                                                        targetNodeId:
                                                            'schedule-duration',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Input numeric value for duration',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    defaultValue: 0,
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
                                    id: '451b3f7d-0a39-46fd-a55e-9a80d78591ce',
                                    partName:
                                        'custom-a0facd93-5707-4773-97f6-3cd08eca0d7a',
                                    selectOptions: [
                                        {
                                            value: 'MONTHS',
                                            text: {
                                                en: 'Months',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'YEARS',
                                            text: {
                                                en: 'Years',
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
                                                en: 'The temporary flat extra must be less than or equal to $15.00 and a multiple of $0.50.',
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
                                    {
                                        type: 'equalityCondition',
                                        value: 'juvenileSubstandard',
                                        isEqual: false,
                                        targetNodeId: 'premium-class',
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
                                en: 'Policy Discounts and Credits',
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
                    id: 'ff8de8dc-9c95-4503-bac3-b92ee3bb637f',
                    partName: 'custom-1959682d-9215-4bf6-9265-d29f91acb28d',
                    text: {},
                    title: {
                        en: 'Coverage',
                    },
                    isCustom: true,
                    fieldGroups: [
                        {
                            id: '2f6d14b8-1146-4d83-a24e-63a6fcdefcbd',
                            partName:
                                'custom-66fe8bea-8491-4e7b-a112-5b5040c19216',
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
                                    id: '2f26f6f0-df79-444d-b29e-78c65db88c1d',
                                    partName:
                                        'custom-24dfcd91-03a7-4fcb-99bc-474a41cfcb70',
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
                                            visible: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'equalityCondition',
                                                        value: false,
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-conversion',
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            value: 'NO_SOLVE',
                                            text: {
                                                en: 'No Solve',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'incomeSolve',
                                            text: {
                                                en: 'Income Solve',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                            visible: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'ageRangeCondition',
                                                        value: {
                                                            minAge: 900,
                                                            maxAge: 999,
                                                            unit: 'year',
                                                        },
                                                        targetBirthdateNodeId:
                                                            'date-of-birth',
                                                        roundingType:
                                                            'closestBirthday',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                    validateAs: 'string',
                                    isCustom: true,
                                    defaultValue: 'PREMIUM',
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                        },
                        {
                            id: '4a16a9ad-94e5-4d3a-9716-ab288633beb7',
                            partName:
                                'custom-04d3dbf9-a0f8-4c59-9e45-b95b324c0bf7',
                            text: {},
                            title: {},
                            isCustom: true,
                            fields: [
                                {
                                    id: '451dfe47-da8a-4ba5-9279-135179abf112',
                                    fieldType: 'custom',
                                    customName: 'IllustrationScheduler',
                                    answerNodeId: 'modalPremiumTable',
                                    outputPath: 'modalPremiumTable',
                                    validateAs: 'custom',
                                    defaultValue: [
                                        {
                                            id: '2b712368-dba0-4a58-8148-2c46a147902d',
                                            firstColumn: 0,
                                            fromYear: 1,
                                            through: 100,
                                        },
                                    ],
                                    customProperties: {
                                        firstColumn: {
                                            type: 'money',
                                            label: {
                                                en: 'Modal Premium',
                                            },
                                            placeholder: {
                                                en: '0',
                                            },
                                            tooltip: {
                                                en: 'Modal Premium',
                                            },
                                            default: 0,
                                        },
                                        fromYear: {
                                            min: 1,
                                            label: {
                                                en: 'From year',
                                            },
                                        },
                                        through: {
                                            max: 100,
                                            label: {
                                                en: 'Through',
                                            },
                                        },
                                        buttons: {
                                            add: {
                                                label: {
                                                    en: 'Add new row',
                                                },
                                            },
                                        },
                                    },
                                },
                                {
                                    fieldType: 'money',
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
                                        forceNewLine: true,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '6707c95e-c0fe-486b-bde5-f002409f23c0',
                                    partName:
                                        'custom-fcca616f-7803-41e5-96c7-862c1c3d6f46',
                                    validateAs: 'integer',
                                    isCustom: true,
                                    defaultValue: 50000,
                                    valid: [
                                        {
                                            id: 'afc950cb-b349-4be9-a584-dff7fb36a5d4',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'equalityCondition',
                                                                value: true,
                                                                isEqual: true,
                                                                targetNodeId:
                                                                    'is-conversion',
                                                            },
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 50000,
                                                                targetNodeId:
                                                                    'max-conversion-face-amount',
                                                                operator:
                                                                    'lessThan',
                                                            },
                                                        ],
                                                    },
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
                                                en: 'Minimum face amount for this product is $50,000.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: 'a078189c-db75-4d0e-b62c-c2449acf367f',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 10000000,
                                                        targetNodeId:
                                                            'face-amount',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                    {
                                                        type: 'equalityCondition',
                                                        value: true,
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-conversion',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Maximum face amount for this product is $10,000,000.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: '635b3595-e7a2-4c86-af3d-87bcb94a6030',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'equalityCondition',
                                                        value: false,
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-conversion',
                                                    },
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        targetNodeId:
                                                            'face-amount',
                                                        operator:
                                                            'lessThanOrEqual',
                                                        nodeIdOfValue:
                                                            'max-conversion-face-amount',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'This value must be less than or equal to the original policy face amount.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: '4a54bbc8-d4a1-4e06-b8d5-76c21599fbe2',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'equalityCondition',
                                                                value: true,
                                                                isEqual: true,
                                                                targetNodeId:
                                                                    'is-conversion',
                                                            },
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 50000,
                                                                targetNodeId:
                                                                    'max-conversion-face-amount',
                                                                operator:
                                                                    'greaterThanOrEqual',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        type: 'equalityCondition',
                                                        value: false,
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-conversion',
                                                    },
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        targetNodeId:
                                                            'face-amount',
                                                        operator: 'equal',
                                                        nodeIdOfValue:
                                                            'max-conversion-face-amount',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The face amount must match the original policy face amount.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    referenceLabel: 'test',
                                },
                                {
                                    fieldType: 'money',
                                    id: '105ba9fd-2a76-4e0e-a2bf-a903143fb4d3',
                                    partName:
                                        'custom-80fefec2-1605-4b3c-ae3b-49316b27c362',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Original Policy Face Amount',
                                        fr: '',
                                    },
                                    platforms: ['consumer'],
                                    renderOn: [],
                                    copyable: 'none',
                                    answerNodeId: 'max-conversion-face-amount',
                                    outputPath: 'maxConversionFaceAmount',
                                    optional: false,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    validateAs: 'decimal',
                                    isCustom: true,
                                    disabled: true,
                                },
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
                                        forceNewLine: true,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: 'b28baa56-8373-4eba-b47b-6c4bfeb2f020',
                                    partName:
                                        'custom-f90b40dc-bfd6-44da-b1f1-72601e0202f8',
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
                                    isCustom: true,
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
                                    optional: true,
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
                                    id: '26540a92-c103-4a5c-a93b-2cca98aff5e9',
                                    partName:
                                        'custom-983f4c3d-cdfc-4f69-90c9-f955c79d08e9',
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
                                    isCustom: true,
                                    defaultValue: 'ACH',
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                            visible: {
                                booleanOperator: 'and',
                                conditions: [
                                    {
                                        type: 'equalityCondition',
                                        value: 'NO_SOLVE',
                                        isEqual: true,
                                        targetNodeId: 'solve-for',
                                    },
                                ],
                            },
                        },
                        {
                            id: 'c1aea97b-c804-4407-939f-0b92c44b6037',
                            partName:
                                'custom-fdedf372-72ce-485e-b3bd-9569ff987bf9',
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
                                        en: 'Solve Option',
                                        fr: '',
                                    },
                                    answerNodeId: 'solve-for-premium-type',
                                    outputPath: 'solveForPremiumType',
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
                                    id: '7a4545a0-6496-4227-964b-3e7ea2169a2f',
                                    partName:
                                        'custom-a3381593-d6d9-4e5e-9652-5cc03eeecda6',
                                    selectOptions: [
                                        {
                                            value: 'SOLVE_FOR_TARGET_CASH_VALUE',
                                            text: {
                                                en: 'Target Cash Value',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'MINIMUM_PREMIUM',
                                            text: {
                                                en: 'Minimum Premium',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'TARGET_PREMIUM',
                                            text: {
                                                en: 'Target Premium',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'GUIDELINE_LEVEL_PREMIUM',
                                            text: {
                                                en: 'Guideline Level Premium',
                                            },
                                            isCustom: true,
                                            orderingIndex: 2,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'TARGET_PREMIUM',
                                },
                                {
                                    fieldType: 'money',
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
                                        forceNewLine: true,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '20b89449-c480-48c6-97d6-c5c2c2015c96',
                                    partName:
                                        'custom-60b49b51-5e22-4094-b69f-f3e1a14091c7',
                                    validateAs: 'decimal',
                                    isCustom: true,
                                    defaultValue: 50000,
                                    valid: [
                                        {
                                            id: 'afc950cb-b349-4be9-a584-dff7fb36a5d4',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'equalityCondition',
                                                                value: true,
                                                                isEqual: true,
                                                                targetNodeId:
                                                                    'is-conversion',
                                                            },
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 50000,
                                                                targetNodeId:
                                                                    'max-conversion-face-amount',
                                                                operator:
                                                                    'lessThan',
                                                            },
                                                        ],
                                                    },
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
                                                en: 'Minimum face amount for this product is $50,000.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: 'a078189c-db75-4d0e-b62c-c2449acf367f',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 10000000,
                                                        targetNodeId:
                                                            'face-amount',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                    {
                                                        type: 'equalityCondition',
                                                        value: true,
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-conversion',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Maximum face amount for this product is $10,000,000.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: '635b3595-e7a2-4c86-af3d-87bcb94a6030',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'equalityCondition',
                                                        value: false,
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-conversion',
                                                    },
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        targetNodeId:
                                                            'face-amount',
                                                        operator:
                                                            'lessThanOrEqual',
                                                        nodeIdOfValue:
                                                            'max-conversion-face-amount',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'This value must be less than or equal to the original policy face amount.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: '4a54bbc8-d4a1-4e06-b8d5-76c21599fbe2',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'equalityCondition',
                                                                value: true,
                                                                isEqual: true,
                                                                targetNodeId:
                                                                    'is-conversion',
                                                            },
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 50000,
                                                                targetNodeId:
                                                                    'max-conversion-face-amount',
                                                                operator:
                                                                    'greaterThanOrEqual',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        type: 'equalityCondition',
                                                        value: false,
                                                        isEqual: true,
                                                        targetNodeId:
                                                            'is-conversion',
                                                    },
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        targetNodeId:
                                                            'face-amount',
                                                        operator: 'equal',
                                                        nodeIdOfValue:
                                                            'max-conversion-face-amount',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The face amount must match the original policy face amount.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                },
                                {
                                    fieldType: 'money',
                                    id: '675095ed-2bcb-474c-9572-6450775cb36a',
                                    partName:
                                        'custom-38090d53-f638-4963-b759-9ce7091fea16',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Original Policy Face Amount',
                                        fr: '',
                                    },
                                    platforms: ['consumer'],
                                    renderOn: [],
                                    copyable: 'none',
                                    answerNodeId: 'max-conversion-face-amount',
                                    outputPath: 'maxConversionFaceAmount',
                                    optional: false,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    validateAs: 'decimal',
                                    disabled: true,
                                },
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
                                        forceNewLine: true,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '5d72fb55-7bd5-4f9f-91a6-65843c00e0d4',
                                    partName:
                                        'custom-db55e733-8ca1-4f60-9d23-e876c52d3502',
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
                                    isCustom: true,
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
                                    optional: true,
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
                                    id: 'c6d51e5b-0bc7-4a61-827e-bee6d10cdcd7',
                                    partName:
                                        'custom-c8944d62-3ca6-4ee2-98dc-44eb963990ea',
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
                                    isCustom: true,
                                    defaultValue: 'ACH',
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Number of Years to Pay Premium',
                                        fr: '',
                                    },
                                    answerNodeId: 'payment-duration',
                                    outputPath: 'premiumDuration',
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
                                    id: '9425bef7-fcd1-4bb2-ab33-c737b64d26bf',
                                    partName:
                                        'custom-ed6f5349-bb0f-451c-b762-e0bc7aa7a384',
                                    validateAs: 'integer',
                                    isCustom: true,
                                    defaultValue: 100,
                                },
                                {
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Target Cash Value',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'solve-for-target-cash-value-cash-value',
                                    outputPath: 'targetCashValueAmount',
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
                                    id: '076ad6a3-6cc7-4dd2-a1e3-583c796d4dd3',
                                    partName:
                                        'custom-5086ee0d-4b7b-445b-8786-0bba12833df9',
                                    validateAs: 'decimal',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'SOLVE_FOR_TARGET_CASH_VALUE',
                                                isEqual: true,
                                                targetNodeId:
                                                    'solve-for-premium-type',
                                            },
                                        ],
                                    },
                                    defaultValue: 1,
                                },
                                {
                                    fieldType: 'dropdown',
                                    id: '307f9624-3305-47bb-902e-a620bccc9bf1',
                                    partName:
                                        'custom-a9b9e66a-fdbe-49b0-bfac-95b0742e6d9d',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Solve for Age or Years',
                                        fr: '',
                                    },
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'SOLVE_FOR_TARGET_CASH_VALUE',
                                                isEqual: true,
                                                targetNodeId:
                                                    'solve-for-premium-type',
                                            },
                                        ],
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    copyable: 'none',
                                    answerNodeId:
                                        'solve-for-target-cash-value-age-or-year',
                                    outputPath: 'targetCashValueAtOption',
                                    optional: false,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    selectOptions: [
                                        {
                                            value: 'AGE',
                                            text: {
                                                en: 'Age',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'YEAR',
                                            text: {
                                                en: 'Years',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'AGE',
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Target Age',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'solve-for-target-cash-value-age',
                                    outputPath: 'targetCashValueAge',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {},
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '1ffaa811-e534-4f9f-b15e-1ae1befccd8d',
                                    partName:
                                        'custom-60f47cc0-801b-4396-a906-ce86049c0f63',
                                    validateAs: 'integer',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'AGE',
                                                isEqual: true,
                                                targetNodeId:
                                                    'solve-for-target-cash-value-age-or-year',
                                            },
                                        ],
                                    },
                                    defaultValue: 120,
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Target Year',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'solve-for-target-cash-value-years',
                                    outputPath: 'targetCashValueYear',
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
                                    id: '256aabac-9785-4d0c-8068-67466c3d9bcd',
                                    partName:
                                        'custom-f6bef2bc-8e15-4f7b-811b-cd46cffd1d24',
                                    validateAs: 'integer',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'YEAR',
                                                isEqual: true,
                                                targetNodeId:
                                                    'solve-for-target-cash-value-age-or-year',
                                            },
                                        ],
                                    },
                                    DefaultValue: 20,
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
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
                            id: 'a99b970c-b358-48ca-967c-087fcb63ecdc',
                            partName:
                                'custom-0143c8d7-2663-449a-bd58-7c3f02d8a51f',
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
                                        en: 'Solve Option',
                                        fr: '',
                                    },
                                    answerNodeId: 'solve-for-premium-type',
                                    outputPath: 'solveForPremiumType',
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
                                    id: 'ada64a6a-b420-416c-9a6b-1e9d7f055659',
                                    partName:
                                        'custom-0625ff6e-d5c0-46e7-ade7-6b3e27139fb3',
                                    selectOptions: [
                                        {
                                            value: 'SOLVE_FOR_TARGET_CASH_VALUE',
                                            text: {
                                                en: 'Target Cash Value',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'MINIMUM_NON_MEC',
                                            text: {
                                                en: 'Minimum Non-MEC (Max Cash Value)',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    isCustom: true,
                                    defaultValue: 'SOLVE_FOR_TARGET_CASH_VALUE',
                                },
                                {
                                    id: '900234d9-547c-4446-ad43-6b76f1f746ec',
                                    fieldType: 'custom',
                                    customName: 'IllustrationScheduler',
                                    answerNodeId: 'modalPremiumTable',
                                    outputPath: 'modalPremiumTable',
                                    validateAs: 'custom',
                                    defaultValue: [
                                        {
                                            id: '2b7d2fb8-5186-4986-b8c4-60d12ee191db',
                                            firstColumn: 0,
                                            fromYear: 1,
                                            through: 100,
                                        },
                                    ],
                                    customProperties: {
                                        firstColumn: {
                                            type: 'money',
                                            label: {
                                                en: 'Modal Premium',
                                            },
                                            placeholder: {
                                                en: '0',
                                            },
                                            tooltip: {
                                                en: 'Modal Premium',
                                            },
                                            default: 0,
                                        },
                                        fromYear: {
                                            min: 1,
                                            label: {
                                                en: 'From year',
                                            },
                                        },
                                        through: {
                                            max: 100,
                                            label: {
                                                en: 'Through',
                                            },
                                        },
                                        buttons: {
                                            add: {
                                                label: {
                                                    en: 'Add new row',
                                                },
                                            },
                                        },
                                    },
                                },
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
                                    id: '9bb05ea6-2c66-4ee7-8312-8a213503dbd7',
                                    partName:
                                        'custom-4807d558-8b11-466b-9733-40c3b6c14037',
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
                                            value: 'ANNUAL',
                                            text: {
                                                en: 'Annual',
                                            },
                                            isCustom: true,
                                            orderingIndex: 2,
                                        },
                                        {
                                            value: 'SEMIANNUAL',
                                            text: {
                                                en: 'Semi-Annual',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    isCustom: true,
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
                                    optional: true,
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
                                    id: 'c3dbae40-6c22-4812-8fee-cf2db78c0538',
                                    partName:
                                        'custom-581db7bd-8ee9-4338-bce4-d4eea8f222c9',
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
                                    isCustom: true,
                                    defaultValue: 'ACH',
                                },
                                {
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Target Cash Value',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'solve-for-target-cash-value-cash-value',
                                    outputPath: 'targetCashValueAmount',
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
                                    id: '693e5058-f7a9-4d8a-a7c5-9f4b075b367c',
                                    partName:
                                        'custom-c03d1ebe-7f27-4777-a3c6-29f2a3f65030',
                                    validateAs: 'decimal',
                                    isCustom: true,
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'SOLVE_FOR_TARGET_CASH_VALUE',
                                                isEqual: true,
                                                targetNodeId:
                                                    'solve-for-premium-type',
                                            },
                                        ],
                                    },
                                    defaultValue: 1,
                                },
                                {
                                    fieldType: 'dropdown',
                                    id: 'b54a18f0-6338-4668-a649-95927c2c759d',
                                    partName:
                                        'custom-b4e31f7c-8f55-46d2-a224-31271365b79f',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Solve for Age or Years',
                                        fr: '',
                                    },
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'SOLVE_FOR_TARGET_CASH_VALUE',
                                                isEqual: true,
                                                targetNodeId:
                                                    'solve-for-premium-type',
                                            },
                                        ],
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    isCustom: true,
                                    copyable: 'none',
                                    answerNodeId:
                                        'solve-for-target-cash-value-age-or-year',
                                    outputPath: 'targetCashValueAtOption',
                                    optional: false,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 6,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    selectOptions: [
                                        {
                                            value: 'AGE',
                                            text: {
                                                en: 'Age',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'YEAR',
                                            text: {
                                                en: 'Years',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'AGE',
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Target Age',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'solve-for-target-cash-value-age',
                                    outputPath: 'targetCashValueAge',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {},
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '98829ac2-1540-44fe-9189-b5cf72eb3563',
                                    partName:
                                        'custom-fcd2f11d-1091-456b-897c-347a6e4740ac',
                                    validateAs: 'integer',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'AGE',
                                                isEqual: true,
                                                targetNodeId:
                                                    'solve-for-target-cash-value-age-or-year',
                                            },
                                        ],
                                    },
                                    isCustom: true,
                                    defaultValue: 120,
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Target Year',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'solve-for-target-cash-value-years',
                                    outputPath: 'targetCashValueYear',
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
                                    id: 'b2a9679f-5562-4eb6-85c4-0c96b1331793',
                                    partName:
                                        'custom-9aee3a66-4ac1-4c5b-a9c7-14d0c0650b90',
                                    validateAs: 'integer',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'YEAR',
                                                isEqual: true,
                                                targetNodeId:
                                                    'solve-for-target-cash-value-age-or-year',
                                            },
                                        ],
                                    },
                                    isCustom: true,
                                    defaultValue: 20,
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
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
                            id: '8430c2dd-455f-474f-8519-7e859c65e92b',
                            partName:
                                'custom-809c83f9-7fd7-4897-ae4a-195634e16f30',
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
                                        en: 'Solve Option',
                                        fr: '',
                                    },
                                    answerNodeId: 'income-solve-type',
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
                                    id: '260db88f-857c-454b-b2c5-d742df2b5fe5',
                                    partName:
                                        'custom-150045be-c1f6-4f10-9ba1-3c62331ea400',
                                    selectOptions: [
                                        {
                                            value: 'faceAmountAndIncome',
                                            text: {
                                                en: 'Face Amount and Income',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'premiumAndIncome',
                                            text: {
                                                en: 'Premium and Income',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'income',
                                            text: {
                                                en: 'Income',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
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
                                    id: 'ec06d4e9-741d-4f02-a0af-b18924d3690f',
                                    partName:
                                        'custom-7af5f07e-247d-46b1-99d9-508289356830',
                                    validateAs: 'integer',
                                    isCustom: true,
                                },
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
                                    id: '8d86b2df-45e9-4fb3-aeaa-765ab69c2caf',
                                    partName:
                                        'custom-005fe80e-0f24-499c-bcf2-f8dc5bdcf363',
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
                                    isCustom: true,
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
                                    id: 'e81fcedb-ab6c-4f7c-8804-60ffdb1458ab',
                                    partName:
                                        'custom-23481828-fede-4dd4-aff7-e862dc60ec2e',
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
                                    isCustom: true,
                                    defaultValue: 'ACH',
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Income Type',
                                        fr: '',
                                    },
                                    answerNodeId: 'income-type',
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
                                    id: 'd7662f03-e7a9-46eb-9871-71bbcc9b587b',
                                    partName:
                                        'custom-e38d9eda-ad32-4abc-bec1-4d09975ed943',
                                    selectOptions: [
                                        {
                                            value: 'withdrawalToBasis',
                                            text: {
                                                en: 'Withdrawal to Basis',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'loan',
                                            text: {
                                                en: 'Loan',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'withdrawal',
                                            text: {
                                                en: 'Withdrawal',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Start Age',
                                        fr: '',
                                    },
                                    answerNodeId: 'income-solve-start-age',
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
                                    id: '55685a92-2adf-4354-8b6f-5b1a0a38e542',
                                    partName:
                                        'custom-7cef81ec-e4e2-477c-a4b1-2338bd4a46ed',
                                    validateAs: 'integer',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'emptinessCondition',
                                                isEmpty: false,
                                                targetNodeId: 'income-type',
                                            },
                                        ],
                                    },
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Number of Years',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'income-solve-number-of-years',
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
                                    id: '0919364f-0596-4c2d-9e6f-0923eb11fa47',
                                    partName:
                                        'custom-e8521512-f229-45a9-86bc-d87eb8f048da',
                                    validateAs: 'integer',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'emptinessCondition',
                                                isEmpty: false,
                                                targetNodeId: 'income-type',
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
                                        type: 'equalityCondition',
                                        value: 'incomeSolve',
                                        isEqual: true,
                                        targetNodeId: 'solve-for',
                                    },
                                ],
                            },
                        },
                        {
                            id: '67918d23-a023-4def-b857-a3044c2cd2d5',
                            partName:
                                'custom-7ea3b94d-2044-4f0f-be89-de5dc84d5c82',
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
                                        en: 'Illustrate 1035',
                                        fr: '',
                                    },
                                    answerNodeId: 'illustrate-1035',
                                    outputPath: 'illustrate1035',
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
                                    id: 'c0cea165-f33d-4203-917f-38f317996396',
                                    partName:
                                        'custom-c4c2538a-ac29-4f15-a270-9d67ad3bf5bc',
                                    selectOptions: [
                                        {
                                            value: 'yes',
                                            text: {
                                                en: 'Yes',
                                            },
                                            isCustom: true,
                                            orderingIndex: 0,
                                        },
                                        {
                                            value: 'no',
                                            text: {
                                                en: 'No',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    isCustom: true,
                                    defaultValue: 'no',
                                },
                                {
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'External 1035 Exchange Amount ',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'external-1035-exchange-amount',
                                    outputPath: 'external1035ExchangeAmount',
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
                                    id: 'aaa533ec-a2e1-4180-8b49-3726642a1cb2',
                                    partName:
                                        'custom-6a4461a8-8fae-46ed-8053-e22e962aac9c',
                                    validateAs: 'decimal',
                                    isCustom: true,
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'yes',
                                                isEqual: true,
                                                targetNodeId: 'illustrate-1035',
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
                                        en: 'Internal 1035 Exchange Amount ',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'internal-1035-exchange-amount',
                                    outputPath: 'internal1035ExchangeAmount',
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
                                    id: '93452e18-ef31-4576-9786-571fd1c75051',
                                    partName:
                                        'custom-7a78e8ba-7195-4092-80fd-d2e59939fd16',
                                    validateAs: 'decimal',
                                    isCustom: true,
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'yes',
                                                isEqual: true,
                                                targetNodeId: 'illustrate-1035',
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
                                        en: 'Non-1035 Lump Sum Amount',
                                        fr: '',
                                    },
                                    answerNodeId: 'non-1035-lump-sum-amount',
                                    outputPath: 'non1035LumpSumAmount',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: true,
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
                                    id: '7f96885f-59e9-484c-9962-7c84bec5c2be',
                                    partName:
                                        'custom-73c4bc3b-2785-4152-bd23-a550f7b334ca',
                                    validateAs: 'decimal',
                                    isCustom: true,
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                            visible: {
                                booleanOperator: 'and',
                                conditions: [
                                    {
                                        type: 'emptinessCondition',
                                        isEmpty: false,
                                        targetNodeId: 'solve-for',
                                    },
                                ],
                            },
                        },
                    ],
                    showInNavigation: false,
                    copyable: 'none',
                },
            ],
            copyable: 'none',
        },
        {
            id: '263711f4-2fd9-4133-99f1-0ef53c65f434',
            sectionGroupKey: 'contract',
            partName: 'custom-4241f1e9-bf10-460b-a7df-336a92508d33',
            title: {
                en: 'Options',
            },
            modules: ['insuranceApplication'],
            isCustom: true,
            subsections: [
                {
                    id: '0de55e06-efba-4fd8-b172-af3084b04c30',
                    partName: 'custom-05be6ff2-d65c-47ad-bda7-a1befb434d8e',
                    text: {},
                    title: {
                        en: 'Options',
                    },
                    isCustom: true,
                    fieldGroups: [
                        {
                            id: 'dedb9431-0b2e-449a-a167-7cb01138dbbd',
                            partName:
                                'custom-1eb19fdd-12f6-4cf0-8ea5-55c2c3dd4191',
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
                                        en: 'Do you want to schedule Death benefit Option?',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'schedule-death-benefit-option',
                                    outputPath: 'scheduleDeathBenefitOption',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 9,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '9aa169a1-91be-4588-af9d-c1c9e827923e',
                                    partName:
                                        'custom-bc99356e-a65a-4fa7-8ad8-b5af642af466',
                                    selectOptions: [
                                        {
                                            value: 'yes',
                                            text: {
                                                en: 'Yes',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'no',
                                            text: {
                                                en: 'No',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'no',
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Death Benefit Option',
                                        fr: '',
                                    },
                                    answerNodeId: 'death-benefit-option',
                                    outputPath: 'deathBenefitOption',
                                    renderOn: [],
                                    platforms: [],
                                    copyable: 'none',
                                    optional: false,
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 9,
                                    },
                                    displayInCardPreview: false,
                                    applicationModes: ['digital', 'paper'],
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    id: '8d1fafbc-3396-4e68-9745-ad025e0e2522',
                                    partName:
                                        'custom-aab9385c-a4b9-4046-826d-3f6a6ec16a24',
                                    selectOptions: [
                                        {
                                            value: 'LEVEL',
                                            text: {
                                                en: 'Level',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'INCREASING',
                                            text: {
                                                en: 'Increasing',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'LEVEL',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'no',
                                                isEqual: true,
                                                targetNodeId:
                                                    'schedule-death-benefit-option',
                                            },
                                        ],
                                    },
                                },
                                {
                                    id: 'cae207c7-bb34-496b-8360-64ea609ea792',
                                    fieldType: 'custom',
                                    customName: 'IllustrationScheduler',
                                    answerNodeId: 'death-benefit-scheduler',
                                    outputPath: 'deathBenefitSchedulerValue',
                                    validateAs: 'custom',
                                    defaultValue: [
                                        {
                                            id: 'a0999c14-57a3-4fdc-b660-1cbc5f19fc0e',
                                            firstColumn: 'LEVEL',
                                            fromYear: 1,
                                            through: 120,
                                        },
                                    ],
                                    customProperties: {
                                        firstColumn: {
                                            type: 'dropdown',
                                            label: {
                                                en: 'Death benefit option',
                                            },
                                            tooltip: {
                                                en: 'Death benefit option',
                                            },
                                            options: [
                                                {
                                                    value: 'LEVEL',
                                                    label: {
                                                        en: 'Level',
                                                    },
                                                },
                                                {
                                                    value: 'INCREASING',
                                                    label: {
                                                        en: 'Increasing',
                                                    },
                                                },
                                            ],
                                        },
                                        fromYear: {
                                            min: 1,
                                            label: {
                                                en: 'From year',
                                            },
                                        },
                                        through: {
                                            max: 120,
                                            label: {
                                                en: 'Through',
                                            },
                                        },
                                        buttons: {
                                            add: {
                                                label: {
                                                    en: 'Add new row',
                                                },
                                            },
                                        },
                                    },
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'yes',
                                                isEqual: true,
                                                targetNodeId:
                                                    'schedule-death-benefit-option',
                                            },
                                        ],
                                    },
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Prevent MEC',
                                        fr: '',
                                    },
                                    answerNodeId: 'prevent-mec',
                                    outputPath: 'preventMec',
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
                                    id: '60d47d4c-b1a9-4e16-9475-ee03e4d82a2c',
                                    partName:
                                        'custom-e957ce1d-3747-4701-9821-8936018d597d',
                                    selectOptions: [
                                        {
                                            value: true,
                                            text: {
                                                en: 'Yes',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: false,
                                            text: {
                                                en: 'No',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'boolean',
                                    defaultValue: true,
                                    disabled: {
                                        booleanOperator: 'or',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: true,
                                                targetNodeId: 'is-conversion',
                                                isEqual: true,
                                            },
                                        ],
                                    },
                                },
                                {
                                    fieldType: 'custom',
                                    customName: 'Information',
                                    text: {
                                        en: 'Please note that the Illustrated policy may become a MEC.',
                                        fr: '',
                                    },
                                    title: {
                                        en: '',
                                        fr: '',
                                    },
                                    answerNodeId: 'prevent-mec-warning',
                                    outputPath: 'preventMecWarning',
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
                                    id: 'bb2e530f-17e0-4a94-aa25-980cc663c701',
                                    partName:
                                        'custom-970215ee-8fcb-42f5-81b4-5109ebae68e6',
                                    variant: 'warning',
                                    validateAs: 'string',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'equalityCondition',
                                                value: 'no',
                                                isEqual: true,
                                                targetNodeId: 'prevent-mec',
                                            },
                                        ],
                                    },
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                        },
                        {
                            id: 'c7e8f0ef-8cbb-4d4c-8bb9-e9627e91e226',
                            partName:
                                'custom-13a6acfe-5e10-44cc-aa1e-369011ce4d94',
                            text: {},
                            title: {
                                en: 'Allocations',
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
                                        en: 'Long Term Fixed Account Allocation',
                                        fr: '',
                                    },
                                    answerNodeId: 'long-term-fixed-account',
                                    outputPath:
                                        'longTermFixedAccountAllocation',
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
                                    id: '9df77d07-e023-441d-97b2-02a00b8fc7bb',
                                    partName:
                                        'custom-b28c2c95-299f-4223-9475-acaeb3d4565a',
                                    numericalDataType: 'float',
                                    validateAs: 'percentage',
                                    defaultValue: 0,
                                    valid: [
                                        {
                                            id: '419946a9-333d-460b-a617-cc0fcef0b77f',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'mathOperator',
                                                        value: 100,
                                                        nodeIds: [
                                                            'long-term-fixed-account',
                                                            'sp500-indexed-account',
                                                            'sp-marc-5-percent-er-indexed-account',
                                                        ],
                                                        operator: 'equal',
                                                        mathOperator: 'sum',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Total of funds allocated must be 100%',
                                                fr: '',
                                            },
                                        },
                                    ],
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Current Illustrated Rate (%)',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'long-term-holding-account-current-illustrated-rate',
                                    outputPath:
                                        'longTermHoldingAccountCurrentIllustratedRate',
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
                                    id: '62753c4c-e989-4ea0-a4e6-f0a28c744688',
                                    partName:
                                        'custom-61fa7a5c-d395-4a47-836c-9ba1f126ccde',
                                    numericalDataType: 'float',
                                    validateAs: 'percentage',
                                    defaultValue: 4,
                                    valid: [
                                        {
                                            id: '36ece1c0-491e-4f80-ab88-ddbebad173a9',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 4,
                                                        targetNodeId:
                                                            'long-term-holding-account-current-illustrated-rate',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Future Interest Rate can not be higher than the current interest rate of 4%.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: '299b18ca-16cf-4496-ac27-8bcaa5608f9e',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 1,
                                                        targetNodeId:
                                                            'long-term-holding-account-current-illustrated-rate',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Future Interest Rate must be greater than or equal to 1%.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    isCustom: true,
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'S&P 500 Indexed Account Allocation',
                                        fr: '',
                                    },
                                    answerNodeId: 'sp500-indexed-account',
                                    outputPath: 'sp500IndexedAccountAllocation',
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
                                    id: '76463bdd-b853-43e0-a7af-c3cfc282a294',
                                    partName:
                                        'custom-3f1d92a3-5820-4001-bb0b-e9056e4377b4',
                                    numericalDataType: 'float',
                                    validateAs: 'percentage',
                                    defaultValue: 50,
                                    valid: [
                                        {
                                            id: '36e4512c-6bd5-48ac-994f-2b7300e7d2f3',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'mathOperator',
                                                        value: 100,
                                                        nodeIds: [
                                                            'long-term-fixed-account',
                                                            'sp500-indexed-account',
                                                            'sp-marc-5-percent-er-indexed-account',
                                                        ],
                                                        operator: 'equal',
                                                        mathOperator: 'sum',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Total of funds allocated must be 100%',
                                                fr: '',
                                            },
                                        },
                                    ],
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Current Illustrated Rate (%)',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'sp500-indexed-account-current-illustrated-rate',
                                    outputPath:
                                        'sp500IndexedAccountCurrentIllustratedRate',
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
                                    id: 'b2e1eecf-50fd-4da5-a3a5-2c4548d7e81b',
                                    partName:
                                        'custom-ba46e0e6-d290-41d1-952c-6306bd16922a',
                                    numericalDataType: 'float',
                                    validateAs: 'percentage',
                                    defaultValue: ILLUSTRATED_RATE,
                                    valid: [
                                        {
                                            id: '36ece1c0-491e-4f80-ab88-ddbebad173a9',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: ILLUSTRATED_RATE,
                                                        targetNodeId:
                                                            'sp500-indexed-account-current-illustrated-rate',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Future Interest Rate can not be higher than the current interest rate of ${ILLUSTRATED_RATE}%.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    isCustom: true,
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'S&P MARC 5% ER Indexed Account Allocation',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'sp-marc-5-percent-er-indexed-account',
                                    outputPath:
                                        'spMarc5PercentErIndexedAccountAllocation',
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
                                    id: 'b761d886-0d22-444f-a218-a2c5db0759d4',
                                    partName:
                                        'custom-2f2372dd-347f-4eb4-9fe4-46d87b5b71c2',
                                    numericalDataType: 'float',
                                    validateAs: 'percentage',
                                    defaultValue: 50,
                                    valid: [
                                        {
                                            id: 'decf5541-2cf1-4a78-af48-b147142ec7bb',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'mathOperator',
                                                        value: 100,
                                                        nodeIds: [
                                                            'long-term-fixed-account',
                                                            'sp500-indexed-account',
                                                            'sp-marc-5-percent-er-indexed-account',
                                                        ],
                                                        operator: 'equal',
                                                        mathOperator: 'sum',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Total of funds allocated must be 100%',
                                                fr: '',
                                            },
                                        },
                                    ],
                                },
                                {
                                    fieldType: 'number',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Current Illustrated Rate (%)',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'sp-marc-5-percent-er-indexed-account-current-illustrated-rate',
                                    outputPath:
                                        'spMarc5PercentErIndexedAccountCurrentIllustratedRate',
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
                                    id: 'a268e602-e668-42b4-bf84-304a132f75e2',
                                    partName:
                                        'custom-8fed7eb2-5cc0-438e-9f62-20f660cf13cd',
                                    numericalDataType: 'float',
                                    validateAs: 'percentage',
                                    defaultValue: ILLUSTRATED_RATE,
                                    valid: [
                                        {
                                            id: '36ece1c0-491e-4f80-ab88-ddbebad173a9',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: ILLUSTRATED_RATE,
                                                        targetNodeId:
                                                            'sp-marc-5-percent-er-indexed-account-current-illustrated-rate',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Future Interest Rate can not be higher than the current interest rate of ${ILLUSTRATED_RATE}%.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                    isCustom: true,
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
                    id: '8839eee8-f7f1-43a7-90b8-b48dcd2e9a34',
                    partName: 'custom-0b9fb371-6dd4-4ec6-b7cc-55adb5672306',
                    text: {},
                    title: {
                        en: 'Riders',
                    },
                    isCustom: true,
                    fieldGroups: [
                        {
                            id: '21b8b2f0-2009-425a-bfd6-7a6b6b3fb5ed',
                            partName:
                                'custom-73315340-cfe0-458b-94f6-d55956a0e2d2',
                            text: {},
                            title: {},
                            isCustom: true,
                            fields: [
                                {
                                    fieldType: 'checkboxGroup',
                                    id: '7698bc54-013b-4b4c-bcc7-130350632b79',
                                    partName:
                                        'custom-8fa16e79-9919-4c40-9cb3-48fda6be2462',
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
                                                value: 60,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'lessThanOrEqual',
                                            },
                                            {
                                                type: 'numberComparisonCondition',
                                                value: 1,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'greaterThanOrEqual',
                                            },
                                        ],
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    isCustom: true,
                                    copyable: 'none',
                                    answerNodeId:
                                        'accidental-death-benefit-rider',
                                    outputPath:
                                        'riders.accidentalDeathBenefitRider.values',
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
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Benefit',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'accidental-death-benefit-rider-benefit',
                                    outputPath:
                                        'riders.accidentalDeathBenefitRider.benefit',
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
                                    id: 'affd5ee0-833f-45eb-bf92-6a2f5725ec04',
                                    partName:
                                        'custom-1eaba30c-0b36-4dc3-bdc0-c3991691f454',
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
                                    isCustom: true,
                                    valid: [
                                        {
                                            id: '7f0fa8cb-abed-4c99-86a1-d4cf97f374c8',
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
                                            id: '117d2af0-d971-415f-9a65-6fa499af1700',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 16,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'greaterThanOrEqual',
                                                    },
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 15,
                                                                targetNodeId:
                                                                    'insured-issue-age',
                                                                operator:
                                                                    'lessThanOrEqual',
                                                            },
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 50000,
                                                                targetNodeId:
                                                                    'accidental-death-benefit-rider-benefit',
                                                                operator:
                                                                    'lessThanOrEqual',
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'The maximum is $50,000.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: '7e470393-9f53-482f-ab6c-4d3bc447b7fe',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 15,
                                                        targetNodeId:
                                                            'insured-issue-age',
                                                        operator:
                                                            'lessThanOrEqual',
                                                    },
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                value: 16,
                                                                targetNodeId:
                                                                    'insured-issue-age',
                                                                operator:
                                                                    'greaterThanOrEqual',
                                                            },
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
                                                ],
                                            },
                                            message: {
                                                en: 'The maximum is $300,000.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: 'c3d143b4-15ae-40dc-8e52-1653fdfde6df',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'mathOperator',
                                                        value: 0,
                                                        nodeIds: [
                                                            'face-amount',
                                                            'accidental-death-benefit-rider-benefit',
                                                        ],
                                                        operator:
                                                            'greaterThanOrEqual',
                                                        mathOperator:
                                                            'subtract',
                                                    },
                                                    {
                                                        type: 'matchesCondition',
                                                        value: ['FACE'],
                                                        targetNodeId:
                                                            'solve-for',
                                                        quantifier: 'any',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: "The Accidental Death Benefit Rider Amount cannot exceed the Farmers Index Universal Life policy's face amount",
                                                fr: '',
                                            },
                                        },
                                    ],
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
                                    answerNodeId:
                                        'accidental-death-benefit-rider-table-rating',
                                    outputPath:
                                        'riders.accidentalDeathBenefitRider.tableRating',
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
                                    id: '00036e14-a322-43a1-95e1-777646f7b960',
                                    partName:
                                        'custom-310a1219-172c-49c2-805a-b1e903f97378',
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
                                    isCustom: true,
                                },
                                {
                                    fieldType: 'checkboxGroup',
                                    id: 'e364773f-30dd-493a-8bc8-2d7d55f978fd',
                                    partName:
                                        'custom-0f83554d-5e9c-4c04-a4c0-6a5d191d4b4d',
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
                                    isCustom: true,
                                    copyable: 'none',
                                    answerNodeId:
                                        'children-term-insurance-rider',
                                    outputPath:
                                        'riders.childrenTermInsuranceRider.values',
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
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Face Amount',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'children-term-insurance-rider-face-amount',
                                    outputPath:
                                        'riders.childrenTermInsuranceRider.faceAmount',
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
                                    id: '5e462813-45ce-41f5-8448-1c0a586b7261',
                                    partName:
                                        'custom-d92a82b1-05e5-4f85-90e7-b0d700eb2d06',
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
                                            id: '0a86fa0a-84bd-491c-aeda-d3ee48f5d12a',
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
                                    isCustom: true,
                                },
                                {
                                    fieldType: 'checkboxGroup',
                                    id: '906861fb-7b65-4f21-aaaa-e2c2e6861628',
                                    partName:
                                        'custom-961e9e2e-e8c6-4688-8793-6ca6e00bf8d4',
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
                                                value: 15,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'lessThanOrEqual',
                                            },
                                        ],
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    copyable: 'none',
                                    answerNodeId:
                                        'guaranteed-insurability-benefit-rider',
                                    outputPath:
                                        'riders.granteedInsurabilityBenefitRider.values',
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
                                            value: 'Rider_GIBR',
                                            text: {
                                                en: 'Guaranteed Insurability Benefit Rider',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                },
                                {
                                    fieldType: 'money',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Face Amount',
                                        fr: '',
                                    },
                                    answerNodeId:
                                        'guaranteed-insurability-benefit-rider-face-amount',
                                    outputPath:
                                        'riders.granteedInsurabilityBenefitRider.faceAmount',
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
                                    id: 'b105379f-be67-4100-af75-66b6899a398f',
                                    partName:
                                        'custom-65ae1f64-9b9f-4d3a-8429-5f275b98daa5',
                                    validateAs: 'integer',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: ['Rider_GIBR'],
                                                targetNodeId:
                                                    'guaranteed-insurability-benefit-rider',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                    valid: [
                                        {
                                            id: '89eeb554-c63e-4862-995e-a599c6b17b6e',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 10000,
                                                        targetNodeId:
                                                            'guaranteed-insurability-benefit-rider-face-amount',
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
                                            id: '4c67aaab-c57c-4063-9d5c-7b2a73ef164b',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'numberComparisonCondition',
                                                        value: 25000,
                                                        targetNodeId:
                                                            'guaranteed-insurability-benefit-rider-face-amount',
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
                                        {
                                            id: '50a9d054-cba4-423f-8222-f29446ea99ba',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'emptinessCondition',
                                                                isEmpty: false,
                                                                targetNodeId:
                                                                    'face-amount',
                                                            },
                                                            {
                                                                type: 'numberComparisonCondition',
                                                                targetNodeId:
                                                                    'guaranteed-insurability-benefit-rider-face-amount',
                                                                operator:
                                                                    'lessThanOrEqual',
                                                                nodeIdOfValue:
                                                                    'face-amount',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        type: 'emptinessCondition',
                                                        isEmpty: true,
                                                        targetNodeId:
                                                            'face-amount',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: "The amount can't exceed the base policy amount.",
                                                fr: '',
                                            },
                                        },
                                    ],
                                },
                                {
                                    fieldType: 'checkboxGroup',
                                    id: '7652bddc-378d-4813-a3e1-ab10b6889e3a',
                                    partName:
                                        'custom-fb2b3684-1678-4b3b-9767-992ff5a5af06',
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
                                                value: 17,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'lessThanOrEqual',
                                            },
                                            {
                                                type: 'equalityCondition',
                                                value: 'CA',
                                                isEqual: false,
                                                targetNodeId: 'state-of-issue',
                                            },
                                        ],
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    copyable: 'none',
                                    answerNodeId:
                                        'owner-waiver-of-deduction-rider',
                                    outputPath:
                                        'riders.ownerWaiverOfDeductionRider.values',
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
                                            value: 'Rider_OWDR',
                                            text: {
                                                en: 'Owner Waiver of Deduction Rider',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                },
                                {
                                    fieldType: 'date',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Owner Date of Birth',
                                        fr: '',
                                    },
                                    answerNodeId: 'owner-date-of-birth',
                                    outputPath:
                                        'riders.ownerWaiverOfDeductionRider.ownerAge',
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
                                    id: '84f068ea-9762-465b-8b09-1b0699665203',
                                    partName:
                                        'custom-f7971bbd-c1b9-4c5e-8ee3-a097024af431',
                                    validateAs: 'pastDate',
                                    valid: [
                                        {
                                            id: '1af02477-4d83-485b-86f2-5d0fa8fcd790',
                                            conditions: {
                                                booleanOperator: 'and',
                                                conditions: [
                                                    {
                                                        type: 'ageRangeCondition',
                                                        value: {
                                                            minAge: 18,
                                                            maxAge: 55,
                                                            unit: 'year',
                                                        },
                                                        targetBirthdateNodeId:
                                                            'owner-date-of-birth',
                                                        roundingType:
                                                            'lastBirthday',
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Age of owner on Owner Waiver of Deduction Rider must be between 18 and 55.',
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
                                                value: ['Rider_OWDR'],
                                                targetNodeId:
                                                    'owner-waiver-of-deduction-rider',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                },
                                {
                                    fieldType: 'checkboxGroup',
                                    id: 'fb27a292-857d-4314-9aed-c1d6cc485aed',
                                    partName:
                                        'custom-d96a0f05-d1a9-4833-bc66-b820328728a8',
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
                                    answerNodeId: 'waiver-of-deduction-rider',
                                    outputPath:
                                        'riders.waiverOfDeductionRider.values',
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
                                            value: 'Rider_WDR',
                                            text: {
                                                en: 'Waiver of Deduction',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                    isCustom: true,
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
                                    answerNodeId:
                                        'waiver-of-deduction-rider-table-rating',
                                    outputPath:
                                        'riders.waiverOfDeductionRider.tableRating',
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
                                    id: '01ef3e38-7e71-41fa-926a-3dac226d4c77',
                                    partName:
                                        'custom-5f288900-f507-4c25-a12a-95d42b5290d0',
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
                                            value: 'TABLEF',
                                            text: {
                                                en: '2.5 x Standard',
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
                                            value: 'TABLEH',
                                            text: {
                                                en: '3.0 x Standard',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: ['Rider_WDR'],
                                                targetNodeId:
                                                    'waiver-of-deduction-rider',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                    isCustom: true,
                                    defaultValue: 'NONETABLE',
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                        },
                        {
                            id: '57c5da23-f68f-4c77-b8a0-b62fb8a8d9db',
                            partName:
                                'custom-dd916e09-5882-4f7f-a125-4b00efd38af3',
                            text: {},
                            title: {
                                en: 'Additional premium-free riders available',
                            },
                            isCustom: true,
                            fields: [
                                {
                                    fieldType: 'checkboxGroup',
                                    id: '3cdba925-bea0-4891-8834-ee352b21dec8',
                                    partName:
                                        'custom-4662a116-7d11-4f4b-a71d-dfe89c1ab015',
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
                                    isCustom: true,
                                    copyable: 'none',
                                    answerNodeId:
                                        'accelerated-death-benefit-rider-for-terminal-illness',
                                    outputPath:
                                        'riders.acceleratedDeathBenefitRiderForTerminalIllness.values',
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
                                    defaultValue: ['Rider_ABRTRM'],
                                },
                                {
                                    fieldType: 'checkboxGroup',
                                    id: '79749e23-e895-4c6b-9c24-81cca20e3b27',
                                    partName:
                                        'custom-b135a63c-8d2d-46fc-82bf-ef15b0d74b28',
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
                                                value: 70,
                                                targetNodeId:
                                                    'insured-issue-age',
                                                operator: 'lessThanOrEqual',
                                            },
                                        ],
                                    },
                                    platforms: [],
                                    renderOn: [],
                                    isCustom: true,
                                    copyable: 'none',
                                    answerNodeId:
                                        'chronic-illness-accelerated-death-benefit-rider',
                                    outputPath:
                                        'riders.chronicIllnessAcceleratedDeathBenefitRider.values',
                                    optional: true,
                                    placeholder: {
                                        en: '',
                                        fr: '',
                                    },
                                    triggerStepNavigation: false,
                                    layout: {
                                        size: 12,
                                        forceNewLine: false,
                                        indent: 3,
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
                                    valid: [
                                        {
                                            id: 'b56f8155-65b3-4caf-be3b-46b9891a8958',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'emptinessCondition',
                                                        isEmpty: true,
                                                        targetNodeId:
                                                            'chronic-illness-accelerated-death-benefit-rider',
                                                    },
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'emptinessCondition',
                                                                isEmpty: false,
                                                                targetNodeId:
                                                                    'chronic-illness-accelerated-death-benefit-rider',
                                                            },
                                                            {
                                                                booleanOperator:
                                                                    'or',
                                                                conditions: [
                                                                    {
                                                                        type: 'numberComparisonCondition',
                                                                        value: 150000,
                                                                        targetNodeId:
                                                                            'face-amount',
                                                                        operator:
                                                                            'greaterThanOrEqual',
                                                                    },
                                                                    {
                                                                        type: 'emptinessCondition',
                                                                        isEmpty:
                                                                            true,
                                                                        targetNodeId:
                                                                            'face-amount',
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Minimum Face Amount of Base Policy $150,000.',
                                                fr: '',
                                            },
                                        },
                                        {
                                            id: '93849e09-017e-4d83-966b-85d4aa13e20a',
                                            conditions: {
                                                booleanOperator: 'or',
                                                conditions: [
                                                    {
                                                        type: 'emptinessCondition',
                                                        isEmpty: true,
                                                        targetNodeId:
                                                            'chronic-illness-accelerated-death-benefit-rider',
                                                    },
                                                    {
                                                        booleanOperator: 'and',
                                                        conditions: [
                                                            {
                                                                type: 'emptinessCondition',
                                                                isEmpty: false,
                                                                targetNodeId:
                                                                    'chronic-illness-accelerated-death-benefit-rider',
                                                            },
                                                            {
                                                                type: 'emptinessCondition',
                                                                isEmpty: false,
                                                                targetNodeId:
                                                                    'accelerated-death-benefit-rider-for-terminal-illness',
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            message: {
                                                en: 'Only available with Accelerated Death Benefit Rider for Terminal Illness.',
                                                fr: '',
                                            },
                                        },
                                    ],
                                },
                                {
                                    fieldType: 'checkboxGroup',
                                    id: '6f07067c-3360-4824-8a9d-7e091bc9c239',
                                    partName:
                                        'custom-8ee8668b-a0c4-440d-ac42-1b90623afb85',
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
                                    isCustom: true,
                                    copyable: 'none',
                                    answerNodeId: 'charitable-giving-rider',
                                    outputPath:
                                        'riders.charitableGivingRider.values',
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
                                    defaultValue: ['Rider_CGR'],
                                },
                                {
                                    fieldType: 'checkboxGroup',
                                    id: '45dc53a7-f73d-4e94-83a7-5724b51d2343',
                                    partName:
                                        'custom-e769409f-5720-4cbc-b267-c151a9c6505c',
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
                                    answerNodeId: 'overloan-protection-rider',
                                    outputPath:
                                        'riders.overloanProtectionRider.values',
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
                                            value: 'Rider_OPR',
                                            text: {
                                                en: 'Overloan Protection Rider',
                                            },
                                            isCustom: true,
                                        },
                                    ],
                                    isCustom: true,
                                    defaultValue: ['Rider_OPR'],
                                },
                            ],
                            displayAsCard: false,
                            copyable: 'none',
                            referenceLabel: '',
                        },
                    ],
                    showInNavigation: false,
                    copyable: 'none',
                },
            ],
            copyable: 'none',
        },
        {
            id: 'abfe5bb8-bcf0-4105-8a7b-5ba62b9c1d3a',
            sectionGroupKey: 'contract',
            partName: 'custom-9c28a00c-2c79-487d-a8e2-17a9c3fcdc06',
            title: {
                en: 'Distributions',
            },
            modules: ['insuranceApplication'],
            isCustom: true,
            subsections: [
                {
                    id: 'f5466115-624c-436a-8e95-198fa1990b4e',
                    partName: 'custom-e05038ad-7ab0-41df-91fb-55f07b3b0542',
                    text: {},
                    title: {
                        en: 'Distributions',
                    },
                    isCustom: true,
                    fieldGroups: [
                        {
                            id: '94356f46-4841-45a8-bd25-67e81e16e6da',
                            partName:
                                'custom-516af7cd-fba7-4679-ba33-2bbde9c9fc60',
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
                                        en: 'Schedule Distributions',
                                        fr: '',
                                    },
                                    answerNodeId: 'schedule-distributions',
                                    outputPath: 'scheduleDistributions',
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
                                    id: '39b42ce7-aa2f-47a9-897e-0103212bede0',
                                    partName:
                                        'custom-6c451b1e-e72d-4a45-91b0-12e34465205f',
                                    selectOptions: [
                                        {
                                            value: 'yes',
                                            text: {
                                                en: 'Yes',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'no',
                                            text: {
                                                en: 'No',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'no',
                                },
                                {
                                    id: '2d62b565-3878-446b-8802-a7ff3410c4c8',
                                    fieldType: 'custom',
                                    customName: 'IllustrationScheduler',
                                    answerNodeId: 'distribution-amount-table',
                                    outputPath: 'distributionAmountTable',
                                    validateAs: 'custom',
                                    defaultValue: [
                                        {
                                            id: '99090f2c-248f-4884-ad22-dbaef302c849',
                                            firstColumn: 0,
                                            fromYear: 1,
                                            through: 120,
                                        },
                                    ],
                                    customProperties: {
                                        firstColumn: {
                                            type: 'money',
                                            label: {
                                                en: 'Distribution Amount',
                                            },
                                            placeholder: {
                                                en: 'Maximum',
                                            },
                                            tooltip: {
                                                en: 'Distribution Amount',
                                            },
                                        },
                                        fromYear: {
                                            min: 1,
                                            label: {
                                                en: 'From year',
                                            },
                                        },
                                        through: {
                                            max: 120,
                                            label: {
                                                en: 'Through',
                                            },
                                        },
                                        buttons: {
                                            add: {
                                                label: {
                                                    en: 'Add new row',
                                                },
                                            },
                                        },
                                    },
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: ['yes'],
                                                targetNodeId:
                                                    'schedule-distributions',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Distribution Option',
                                        fr: '',
                                    },
                                    answerNodeId: 'distribution-options',
                                    outputPath: 'distributionOptions',
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
                                    id: '7db8d6b4-2f15-4e77-95ce-f865feb01b10',
                                    partName:
                                        'custom-f0d771ec-7add-431a-b1dd-0fffade91406',
                                    selectOptions: [
                                        {
                                            value: 'SWITCH_AT_BASIS',
                                            text: {
                                                en: 'Switch at basis',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'LOAN',
                                            text: {
                                                en: 'Loan',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'WITHDRAWAL',
                                            text: {
                                                en: 'Withdraw',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    defaultValue: 'WITHDRAWAL',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: ['yes'],
                                                targetNodeId:
                                                    'schedule-distributions',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
                                },
                                {
                                    fieldType: 'dropdown',
                                    text: {
                                        en: '',
                                        fr: '',
                                    },
                                    title: {
                                        en: 'Loan Interest Option',
                                        fr: '',
                                    },
                                    answerNodeId: 'loan-interest-option',
                                    outputPath: 'loanInterestOption',
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
                                    id: '51a57d59-5cb3-4e19-b328-4b18976969a1',
                                    partName:
                                        'custom-b252ac5d-d727-495d-b4d4-1a687b466626',
                                    selectOptions: [
                                        {
                                            value: 'BORROW',
                                            text: {
                                                en: 'Borrow',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                        {
                                            value: 'CASH',
                                            text: {
                                                en: 'Cash',
                                            },
                                            isCustom: true,
                                            orderingIndex: 1,
                                        },
                                    ],
                                    validateAs: 'string',
                                    referenceLabel: '',
                                    defaultValue: 'BORROW',
                                    visible: {
                                        booleanOperator: 'and',
                                        conditions: [
                                            {
                                                type: 'matchesCondition',
                                                value: ['yes'],
                                                targetNodeId:
                                                    'schedule-distributions',
                                                quantifier: 'any',
                                            },
                                        ],
                                    },
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
