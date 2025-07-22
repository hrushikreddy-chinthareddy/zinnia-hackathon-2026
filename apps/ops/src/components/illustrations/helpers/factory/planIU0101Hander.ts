import { CarrierName } from '@zinnia/bloom/components';
import { QuestionnaireBlueprint } from '@zinnia/form-engine-sdk';
import { Result, t, failure, success, Infer } from 'typegate';
import { v4 as uuid } from 'uuid';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';

import {
    IllustrationHandler,
    OutputDataParsingError,
} from './illustrationsHandlerAbstractClass';
import { farmersBlueprintIU0101 } from '../farmers/farmersBlueprintIU0101';
import {
    CreateIllustrationPayload,
    CreateIllustrationPayloadParsingError,
    createIllustrationPayloadSchema,
    IllustrationFaceAmountAndPremiumBasis,
    IllustrationFlatExtraTypes,
    IllustrationPartyTypeCode,
    InsuredRoleCodes,
    NonInsuredRoleCodes,
    SubStandardRating,
} from '../illustrationApiSchemas';

const baseCoverageSchema = t.object(
    // TODO: change to not optional once we understand how to get amount when solve for is face amount
    t.optionalProperty('currentAmount', t.union(t.number, t.undefined)) //face-amount
);

const insuredSchema = t.object(
    t.property('issueAge', t.number), // age
    t.optionalProperty('gender', t.string), // sex
    t.property('dateOfBirth', t.string), // date-of-birth
    t.property('firstName', t.string), // insured-first-name
    t.optionalProperty('middleName', t.union(t.string, t.undefined)), // insured-middle-name
    t.property('lastName', t.string) // insured-last-name
);

const agentSchema = t.object(
    t.property('firstName', t.string), // insured-first-name    t.optionalProperty('middleName', t.union(t.string, t.undefined)), // insured-middle-name
    t.property('lastName', t.string) // insured-last-name
);

const ridersSchema = t.object(
    t.optionalProperty(
        'ownerWaiverOfDeductionRider',
        t.object(
            t.optionalProperty(
                'values',
                t.union(t.array(t.string), t.undefined)
            ),
            t.optionalProperty(
                'ownerAge',
                t.union(t.array(t.number), t.undefined)
            )
        )
    ),
    t.optionalProperty(
        'acceleratedDeathBenefitRiderForTerminalIllness',
        t.object(
            t.optionalProperty(
                'values',
                t.union(t.array(t.string), t.undefined)
            )
        )
    ),
    t.optionalProperty(
        'accidentalDeathBenefitRider',
        t.object(
            t.optionalProperty(
                'values',
                t.union(t.array(t.string), t.undefined)
            ),
            t.optionalProperty('benefit', t.union(t.number, t.undefined)),
            t.optionalProperty('tableRating', t.union(t.string, t.undefined))
        )
    ),
    t.optionalProperty(
        'charitableGivingRider',
        t.object(t.property('values', t.union(t.array(t.string), t.undefined)))
    ),
    t.optionalProperty(
        'childrenTermInsuranceRider',
        t.object(
            t.optionalProperty(
                'values',
                t.union(t.array(t.string), t.undefined)
            ),
            t.optionalProperty('faceAmount', t.union(t.number, t.undefined))
        )
    ),
    t.optionalProperty(
        'chronicIllnessAcceleratedDeathBenefitRider',
        t.object(
            t.optionalProperty(
                'values',
                t.union(t.array(t.string), t.undefined)
            )
        )
    ),
    t.optionalProperty(
        'granteedInsurabilityBenefitRider',
        t.object(
            t.optionalProperty(
                'values',
                t.union(t.array(t.string), t.undefined)
            ),
            t.optionalProperty(
                'faceAmount',
                t.union(t.array(t.string), t.undefined)
            )
        )
    ),
    t.optionalProperty(
        'overloanProtectionRider',
        t.object(
            t.optionalProperty(
                'values',
                t.union(t.array(t.string), t.undefined)
            )
        )
    ),
    t.optionalProperty(
        'waiverOfPremiumRider',
        t.object(
            t.optionalProperty(
                'values',
                t.union(t.array(t.string), t.undefined)
            ),
            t.optionalProperty('tableRating', t.union(t.string, t.undefined))
        )
    )
);

const farmersEntitiesSchema = t.object(
    t.property('illustrationType', t.string),
    t.property('illustrationRequestDate', t.string), // effective-date currently hard coded to today
    t.property('jurisdiction', t.string), // state-of-issue
    t.property('planCode', t.string), // product
    t.property('premiumClass', t.string), // premium-class
    t.property('baseCoverage', baseCoverageSchema),
    t.property('insured', insuredSchema),
    t.property('agent', agentSchema),
    t.optionalProperty(
        'subStandardRating',
        t.union(t.enum(SubStandardRating), t.undefined)
    ), // table-rating
    t.optionalProperty(
        'permanentFlatExtra',
        t.object(t.optionalProperty('amount', t.union(t.number, t.undefined))) // permanent-flat-extra
    ),
    t.optionalProperty(
        'temporaryFlatExtra',
        t.object(
            t.optionalProperty('amount', t.union(t.number, t.undefined)), // temporary-flat-extra
            t.property('duration', t.union(t.number, t.undefined)), // schedule-duration
            t.property('durationType', t.union(t.string, t.undefined)), // schedule-duration-unit
            t.property('startDate', t.union(t.string, t.undefined)) // schedule-from
        )
    ),
    t.optionalProperty('riders', ridersSchema),
    t.property('solveFor', t.string), // solve-for
    t.property('paymentMode', t.string),
    t.property('discountIndicator', t.string),
    t.property('paymentMethod', t.string),
    t.property('premiumDuration', t.number),
    t.optionalProperty('premiumDurationOption', t.string),
    t.optionalProperty('modalPremiumValue', t.union(t.number, t.undefined)),
    t.optionalProperty('preventMec', t.string),
    t.optionalProperty('non1035LumpSumAmount', t.union(t.number, t.undefined)),
    t.optionalProperty(
        'deathBenefitOption',
        t.object(
            t.property('from', t.union(t.number, t.string)),
            t.property('thru', t.union(t.number, t.string)),
            t.property('value', t.union(t.number, t.string))
        )
    ),
    t.optionalProperty('solveForPremiumType', t.union(t.string, t.undefined)),

    t.optionalProperty('targetCashValueOption', t.union(t.string, t.undefined)),
    t.optionalProperty(
        'targetCashValueAtOption',
        t.union(t.string, t.undefined)
    ),
    t.optionalProperty('targetCashValueAge', t.union(t.number, t.undefined)),
    t.optionalProperty('targetCashValueYear', t.union(t.number, t.undefined)),
    t.optionalProperty('targetCashValueAmount', t.union(t.number, t.undefined)),
    t.optionalProperty(
        'longTermFixedAccountCurrentRate',
        t.union(t.number, t.undefined)
    ),
    t.optionalProperty(
        'sp500IndexedAccountCurrentRate',
        t.union(t.number, t.undefined)
    ),
    t.optionalProperty(
        'spMarc5PercentErIndexedAccountCurrentRate',
        t.union(t.number, t.undefined)
    ),
    t.optionalProperty(
        'external1035ExchangeAmount',
        t.union(t.number, t.undefined)
    ),
    t.optionalProperty(
        'internal1035ExchangeAmount',
        t.union(t.number, t.undefined)
    ),
    t.optionalProperty('exchangeBasis1035', t.union(t.number, t.undefined)),
    t.optionalProperty('mec1035', t.union(t.string, t.undefined))
);

export type FarmersIU0101Entities = Infer<typeof farmersEntitiesSchema>;

const FARMERS_HARDCODED_DATA = {
    source: 'zinnia-live',
    permanentFlatExtraType: IllustrationFlatExtraTypes.PERMANENT,
    temporaryFlatExtraType: IllustrationFlatExtraTypes.TEMPORARY,
    insuredRoleCode: InsuredRoleCodes.INSURED,
    individualPartyTypeRoleCode: IllustrationPartyTypeCode.INDIVIDUAL,
    premiumBasis: IllustrationFaceAmountAndPremiumBasis.DURATION,
    premiumFrom: 1,
    premiumThrough: 120,
    baseCoverageId: 'BASE_COVERAGE',
    revisedIllustration: true,
    solveForFrequency: 'ANNUAL',
} as const;

const SUBSTANDARD_PREMIUM_CLASSES = [
    'StandardConversionNonTobacco',
    'StandardConversionTobacco',
];

function createIllustrationPayload(
    answerOutputData: unknown
): Result<
    OutputDataParsingError | CreateIllustrationPayloadParsingError,
    CreateIllustrationPayload
> {
    const parseResult = farmersEntitiesSchema.parse(answerOutputData);
    if (!parseResult.success) {
        console.log('Blueprint parseResult: ', parseResult.error);
        return failure(new OutputDataParsingError());
    }

    const values = parseResult.value;
    const insuredId = uuid();

    const riders = [];
    const baseParticipantForRiders = {
        participantId: insuredId,
        issueAge: values.insured.issueAge,
    };

    if (values.riders?.accidentalDeathBenefitRider?.values?.length) {
        riders.push({
            coverageId: values.riders.accidentalDeathBenefitRider?.values[0],
            currentAmount: values.riders.accidentalDeathBenefitRider.benefit,
            participants: [
                {
                    ...baseParticipantForRiders,
                    subStandardRating:
                        values.riders.accidentalDeathBenefitRider?.tableRating,
                },
            ],
        });
    }

    if (values.riders?.charitableGivingRider?.values?.length) {
        riders.push({
            coverageId: values.riders.charitableGivingRider?.values[0],
        });
    }

    if (values?.riders?.childrenTermInsuranceRider?.values?.length) {
        riders.push({
            coverageId: values.riders.childrenTermInsuranceRider?.values[0],
            currentAmount: values.riders.childrenTermInsuranceRider.faceAmount,
        });
    }

    if (
        values?.riders?.chronicIllnessAcceleratedDeathBenefitRider?.values
            ?.length
    ) {
        riders.push({
            coverageId:
                values.riders.chronicIllnessAcceleratedDeathBenefitRider
                    ?.values[0],
            participants: [baseParticipantForRiders],
        });
    }

    if (values?.riders?.granteedInsurabilityBenefitRider?.values?.length) {
        riders.push({
            coverageId:
                values.riders.granteedInsurabilityBenefitRider?.values[0],
            currentAmount:
                values.riders.granteedInsurabilityBenefitRider.faceAmount,
            participants: [baseParticipantForRiders],
        });
    }

    if (values?.riders?.overloanProtectionRider?.values?.length) {
        riders.push({
            coverageId: values.riders.overloanProtectionRider?.values[0],
            participants: [baseParticipantForRiders],
        });
    }

    if (values.riders?.ownerWaiverOfDeductionRider?.values?.length) {
        riders.push({
            coverageId: values.riders.ownerWaiverOfDeductionRider?.values[0],
            participants: [
                {
                    participantId: uuid(),
                    issueAge:
                        values.riders.ownerWaiverOfDeductionRider?.ownerAge,
                },
            ],
        });
    }

    // TODO this needs reviewed with product. DEPU-5382
    if (values?.riders?.ownerWaiverOfDeductionRider?.values?.length) {
        riders.push({
            coverageId: values.riders.ownerWaiverOfDeductionRider?.values[0],
            participants: [
                {
                    ...baseParticipantForRiders,
                    // subStandardRating: values.riders.ownerWaiverOfDeductionRider?.tableRating,
                },
            ],
        });
    }

    const output = {
        calculationType: values.illustrationType,
        source: FARMERS_HARDCODED_DATA.source,
        illustrationRequestDate: values.illustrationRequestDate,
        jurisdiction: values.jurisdiction,
        planCode: values.planCode,
        coverages: [
            {
                coverageId: FARMERS_HARDCODED_DATA.baseCoverageId,
                ...(values.baseCoverage.currentAmount && {
                    currentAmount: values.baseCoverage.currentAmount,
                }),
                participants: [
                    {
                        issueAge: values.insured.issueAge,
                        participantId: insuredId,
                        ...(values.subStandardRating && {
                            substandardRating: values.subStandardRating,
                        }),
                        underwritingClass: values.premiumClass,
                        ...(SUBSTANDARD_PREMIUM_CLASSES.includes(
                            values.premiumClass
                        ) && {
                            flatExtra: [
                                {
                                    type: FARMERS_HARDCODED_DATA.permanentFlatExtraType,
                                    amount: values.permanentFlatExtra?.amount,
                                },
                                {
                                    type: FARMERS_HARDCODED_DATA.temporaryFlatExtraType,
                                    amount: values.temporaryFlatExtra?.amount,
                                    duration:
                                        values.temporaryFlatExtra?.duration,
                                    durationType:
                                        values.temporaryFlatExtra?.durationType,
                                    startDate:
                                        values.temporaryFlatExtra?.startDate,
                                },
                            ],
                        }),
                    },
                ],
            },
            ...riders,
        ],
        parties: [
            {
                partyId: insuredId,
                partyTypeCode:
                    FARMERS_HARDCODED_DATA.individualPartyTypeRoleCode,
                gender: values.insured.gender,
                dateOfBirth: values.insured.dateOfBirth,
                firstName: values.insured.firstName,
                middleName: values.insured.middleName || '',
                lastName: values.insured.lastName,
                roleCode: FARMERS_HARDCODED_DATA.insuredRoleCode,
            },
            {
                partyId: uuid(),
                partyTypeCode:
                    FARMERS_HARDCODED_DATA.individualPartyTypeRoleCode,
                firstName: values.agent.firstName,
                lastName: values.agent.lastName,
                roleCode: NonInsuredRoleCodes.AGENT,
            },
            // ...(values.riders?.ownerWaiverOfDeductionRider?.values?.length && {
            //     partyId: uuid(),
            //     partyTypeCode: FARMERS_HARDCODED_DATA.individualPartyTypeRoleCode,
            //     // TODO: missing date of birth in the blueprint
            //     // dateOfBirth: values.riders.ownerWaiverOfDeductionRider?.ownerDateOfBirth,
            //     roleCode: InsuredRoleCodes.OWNER,
            // }),
        ],
        options: {
            revisedIllustration: FARMERS_HARDCODED_DATA.revisedIllustration,
            solveFor: values.solveFor,
            ...(values.solveFor === 'NO_SOLVE' && {
                paymentMode: values.paymentMode,
                discountIndicator: values.discountIndicator,
                paymentMethod: values.paymentMethod,
                premiumDuration: values.premiumDuration,
                premiumDurationOption: 'YEARS', // DEPU-5382
                faceAmount: {
                    frequency: FARMERS_HARDCODED_DATA.solveForFrequency,
                    basis: FARMERS_HARDCODED_DATA.premiumBasis,
                    sequence: [
                        {
                            from: FARMERS_HARDCODED_DATA.premiumFrom,
                            through: FARMERS_HARDCODED_DATA.premiumThrough,
                            value: values.modalPremiumValue,
                        },
                    ],
                },
                premium: {
                    frequency: FARMERS_HARDCODED_DATA.solveForFrequency,
                    basis: FARMERS_HARDCODED_DATA.premiumBasis,
                    sequence: [
                        {
                            from: FARMERS_HARDCODED_DATA.premiumFrom,
                            through: values.premiumDuration,
                            value: values.baseCoverage.currentAmount,
                        },
                    ],
                },
                doli: 'GPT',
                preventModifiedEndowment: values.preventMec,
                dumpInAmount: values.non1035LumpSumAmount,
                deathBenefitOption: {
                    frequency: FARMERS_HARDCODED_DATA.solveForFrequency,
                    basis: FARMERS_HARDCODED_DATA.premiumBasis,
                    sequence: [
                        {
                            from: values.deathBenefitOption?.from,
                            through: values.deathBenefitOption?.thru,
                            value: values.deathBenefitOption?.value,
                        },
                    ],
                },
            }),
            ...(values.solveFor === 'PREMIUM' && {
                paymentMode: values.paymentMode,
                discountIndicator: values.discountIndicator,
                paymentMethod: values.paymentMethod,
                premiumDuration: values.premiumDuration,
                premiumDurationOption: 'YEARS',
                faceAmount: {
                    frequency: FARMERS_HARDCODED_DATA.solveForFrequency,
                    basis: FARMERS_HARDCODED_DATA.premiumBasis,
                    sequence: [
                        {
                            from: FARMERS_HARDCODED_DATA.premiumFrom,
                            through: FARMERS_HARDCODED_DATA.premiumThrough,
                            value: values.baseCoverage.currentAmount,
                        },
                    ],
                },
                premium: {
                    frequency: FARMERS_HARDCODED_DATA.solveForFrequency,
                    basis: FARMERS_HARDCODED_DATA.premiumBasis,
                    sequence: [
                        {
                            from: FARMERS_HARDCODED_DATA.premiumFrom,
                            through: values.premiumDuration,
                            value: values.solveForPremiumType,
                        },
                    ],
                },
                targetCashValueOption: 'SPECIFY_AMOUNT',
                targetCashValueAtOption: values.targetCashValueAtOption,
                ...(values.targetCashValueAge && {
                    targetCashValueAge: values.targetCashValueAge,
                }),
                ...(values.targetCashValueYear && {
                    targetCashValueYear: values.targetCashValueYear,
                }),
                targetCashValueAmount: values.targetCashValueAmount,
                doli: 'GPT',
                preventModifiedEndowment: values.preventMec,
                dumpInAmount: values.non1035LumpSumAmount,
                deathBenefitOption: {
                    frequency: FARMERS_HARDCODED_DATA.solveForFrequency,
                    basis: FARMERS_HARDCODED_DATA.premiumBasis,
                    sequence: [
                        {
                            from: values.deathBenefitOption?.from,
                            through: values.deathBenefitOption?.thru,
                            value: values.deathBenefitOption?.value,
                        },
                    ],
                },
            }),
            ...(values.solveFor === 'FACE' && {
                paymentMode: values.paymentMode,
                discountIndicator: values.discountIndicator,
                paymentMethod: values.paymentMethod,
                premiumDuration: values.premiumDuration,
                premiumDurationOption: 'YEARS',
                faceAmount: {
                    frequency: FARMERS_HARDCODED_DATA.solveForFrequency,
                    basis: FARMERS_HARDCODED_DATA.premiumBasis,
                    sequence: [
                        {
                            from: FARMERS_HARDCODED_DATA.premiumFrom,
                            through: FARMERS_HARDCODED_DATA.premiumThrough,
                            value: values.solveForPremiumType,
                        },
                    ],
                },
                premium: {
                    frequency: FARMERS_HARDCODED_DATA.solveForFrequency,
                    basis: FARMERS_HARDCODED_DATA.premiumBasis,
                    sequence: [
                        {
                            from: FARMERS_HARDCODED_DATA.premiumFrom,
                            through: values.premiumDuration,
                            value: values.modalPremiumValue,
                        },
                    ],
                },
                targetCashValueOption: 'SPECIFY_AMOUNT',
                targetCashValueAtOption: values.targetCashValueAtOption,
                ...(values.targetCashValueAge && {
                    targetCashValueAge: values.targetCashValueAge,
                }),
                ...(values.targetCashValueYear && {
                    targetCashValueYear: values.targetCashValueYear,
                }),
                targetCashValueAmount: values.targetCashValueAmount,
                doli: 'GPT',
                preventModifiedEndowment: values.preventMec,
                dumpInAmount: values.non1035LumpSumAmount,
                deathBenefitOption: {
                    frequency: FARMERS_HARDCODED_DATA.solveForFrequency,
                    basis: FARMERS_HARDCODED_DATA.premiumBasis,
                    sequence: [
                        {
                            from: values.deathBenefitOption?.from,
                            through: values.deathBenefitOption?.thru,
                            value: values.deathBenefitOption?.value,
                        },
                    ],
                },
            }),
            fundAllocations: [
                {
                    allocationPercent: values.longTermFixedAccountCurrentRate,
                    fundId: 'FLF001',
                },
                {
                    allocationPercent: values.sp500IndexedAccountCurrentRate,
                    fundId: 'FLI001',
                },
                {
                    allocationPercent:
                        values.spMarc5PercentErIndexedAccountCurrentRate,
                    fundId: 'FLI002',
                },
            ],
            exchanges: {
                internalAmount: values.internal1035ExchangeAmount,
                externalAmount: values.external1035ExchangeAmount,
                basis: values.exchangeBasis1035,
                isMec: values.mec1035,
                carryOverLoan: 1,
            },
        },
    };

    const parseOutputResult = createIllustrationPayloadSchema.parse(output);
    if (!parseOutputResult.success) {
        console.log('pre-parsed output', output);
        console.log('parseOutputResult', parseOutputResult.error);
        return failure(
            new CreateIllustrationPayloadParsingError(parseOutputResult.error)
        );
    }
    return success(parseOutputResult.value);
}

function mapIllustrationPayloadToEngineInputData(
    data: CreateIllustrationPayload
): FarmersIU0101Entities {
    const dataInsuredParticipant = data.coverages?.[0]?.participants?.[0];
    const dataInsuredParty = data.parties[0];

    const dataAgent = data.parties.find(
        (p) => p.roleCode === NonInsuredRoleCodes.AGENT
    );

    return {
        illustrationType: data.calculationType,
        illustrationRequestDate: data.illustrationRequestDate,
        jurisdiction: data.jurisdiction,
        planCode: data.planCode,
        baseCoverage: {
            currentAmount: data.coverages[0].currentAmount,
        },
        insured: {
            issueAge: dataInsuredParticipant?.issueAge || 0,
            gender: dataInsuredParty.gender,
            dateOfBirth: dataInsuredParty.dateOfBirth || '',
            firstName: dataInsuredParty.firstName || '',
            middleName: dataInsuredParty.middleName || '',
            lastName: dataInsuredParty.lastName || '',
        },
        agent: {
            firstName: dataAgent?.firstName || '',
            lastName: dataAgent?.lastName || '',
        },
        subStandardRating: dataInsuredParticipant?.subStandardRating,
        permanentFlatExtra: {
            amount: dataInsuredParticipant?.flatExtra?.[0]?.amount,
        },
        temporaryFlatExtra: {
            amount: dataInsuredParticipant?.flatExtra?.[1]?.amount,
            duration: dataInsuredParticipant?.flatExtra?.[1]?.duration,
            durationType: dataInsuredParticipant?.flatExtra?.[1]?.durationType,
            startDate: dataInsuredParticipant?.flatExtra?.[1]?.startDate,
        },
        solveFor: data.options?.solveFor || '',
        paymentMethod: data.options?.paymentMethod || '',
        premiumDuration: data.options?.premiumDuration || 0,
        premiumDurationOption: data.options?.premiumDurationOption || '',
        modalPremiumValue:
            Number(data.options?.premium?.sequence[0].value) || 0,
        premiumClass: '',
        riders: {},
        paymentMode: data.options?.paymentMode || '',
        discountIndicator: data.options?.discountIndicator || '',
    };
}

// We are not checking the type of the return value right now so type is any
function getIllustrationDataFromResponse(data: any) {
    return {
        faceAmount: data.assumed.initial.totalFaceAmount,
        initialPremium: data.assumed.initial.totalModalPremium,
    };
}

export class PlanIU0101Handler extends IllustrationHandler<FarmersIU0101Entities> {
    constructor(clientCase: IllustrationsClientCase) {
        super(clientCase);
    }

    createIllustrationPayloadFromAnswerOutput(
        answerOutputData: unknown
    ): Result<
        OutputDataParsingError | CreateIllustrationPayloadParsingError,
        CreateIllustrationPayload
    > {
        // Parse and return result

        const data = answerOutputData as Record<string, any>;
        data.planCode = this.getPlanCode();
        return createIllustrationPayload(data);
    }

    mapIllustrationPayloadToEngineInputData(
        data: CreateIllustrationPayload
    ): FarmersIU0101Entities {
        return mapIllustrationPayloadToEngineInputData(data);
    }

    getIllustrationDataFromResponse(data: any): any {
        return getIllustrationDataFromResponse(data);
    }

    getBlueprint(): QuestionnaireBlueprint {
        // need an API request to get the correct risk class mappings for this plan
        return farmersBlueprintIU0101;
    }

    getLabel(): string {
        return 'Farmers Index Universal Life';
    }

    getPlanCode(): string {
        return 'IU0101';
    }

    getPlanType(): ProductTypes {
        return ProductTypes.INDEX_UNIVERSAL_LIFE;
    }

    getCarrier(): string {
        return CarrierName.FARMERS;
    }

    getIllustrationApiPath(): string {
        return '/api/illustration/v3/indexed-universal-life/new-business';
    }

    public generateTitle(data: any): string {
        const assumed = data.assumed;
        const guaranteed = data.guaranteed;
        const createDate = new Date().toLocaleDateString();

        const getRidersText = () => {
            const hasRiders = Object.keys(assumed.coverages).length > 1;
            if (!hasRiders) {
                return '';
            }

            const riders = Object.keys(assumed.coverages)
                .filter((coverage) => coverage !== 'base')
                .map((riderName) => riderName)
                .join(', ');

            return `, ${riders}`;
        };

        const getDeathBenefits = () => {
            const deathBenefitsMount =
                assumed.annualTimeSeriesData[0].deathBenefitsMount;

            if (deathBenefitsMount) {
                return `Death Benefits ${numberFormatify(
                    deathBenefitsMount
                )}, `;
            }

            return '';
        };

        return `${createDate}, Initial Premium ${numberFormatify(
            assumed.initial.minimumPremiumAmount
        )}, ${numberFormatify(
            assumed.initial.totalFaceAmount
        )}, ${getDeathBenefits()}${
            guaranteed.lapse.year
        }years ${getRidersText()}`;
    }
}
