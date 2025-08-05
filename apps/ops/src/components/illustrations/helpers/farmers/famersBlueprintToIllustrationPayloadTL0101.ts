import { t, Result, failure, success, Infer } from 'typegate';
import { v4 as uuid } from 'uuid';

import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { OutputDataParsingError } from '../factory/illustrationsHandlerAbstractClass';
import {
    CreateIllustrationPayload,
    CreateIllustrationPayloadParsingError,
    createIllustrationPayloadSchema,
    IllustrationFaceAmountAndPremiumBasis,
    IllustrationFlatExtraTypes,
    IllustrationPartyTypeCode,
    InsuredRoleCodes,
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
    t.optionalProperty('firstName', t.union(t.string, t.undefined)), // insured-first-name
    t.optionalProperty('middleName', t.union(t.string, t.undefined)), // insured-middle-name
    t.optionalProperty('lastName', t.union(t.string, t.undefined)) // insured-last-name
);

const ridersSchema = t.object(
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
    t.property('illustrationRequestDate', t.string), // effective-date
    t.property('jurisdiction', t.string), // state-of-issue
    t.property('planCode', t.string), // product
    t.property('premiumClass', t.string), // premium-class
    t.optionalProperty(
        'tableOrFlatExtraSelection',
        t.union(t.array(t.union(t.string, t.undefined)), t.undefined)
    ),
    t.property('baseCoverage', baseCoverageSchema),
    t.property('insured', insuredSchema),
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
            t.property('durationType', t.union(t.string, t.undefined)) // schedule-duration-unit
        )
    ),
    t.optionalProperty('riders', ridersSchema),
    t.property('solveFor', t.string), // solve-for
    t.optionalProperty('fixedCostPeriod', t.union(t.string, t.undefined)), // level-term-period
    t.property('paymentMode', t.string), // premium-mode
    t.property('discountIndicator', t.union(t.array(t.string), t.undefined)), // multiple-policy-owner
    t.property('paymentMethod', t.string), // payment-mode
    t.optionalProperty('modalPremiumValue', t.union(t.number, t.undefined)) // modal-premium
);

export type FarmersEntities = Infer<typeof farmersEntitiesSchema>;

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
} as const;

const SUBSTANDARD_PREMIUM_CLASSES = ['STANDARDNONTOBACCO', 'STANDARDTOBACCO'];

export function getFarmersCreateIllustrationPayload(
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

    if (
        values.riders?.acceleratedDeathBenefitRiderForTerminalIllness?.values
            ?.length
    ) {
        riders.push({
            coverageId:
                values.riders.acceleratedDeathBenefitRiderForTerminalIllness
                    ?.values[0],
            participants: [baseParticipantForRiders],
        });
    }

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

    if (values.riders?.childrenTermInsuranceRider?.values?.length) {
        riders.push({
            coverageId: values.riders.childrenTermInsuranceRider?.values[0],
            currentAmount: values.riders.childrenTermInsuranceRider.faceAmount,
        });
    }

    if (
        values.riders?.chronicIllnessAcceleratedDeathBenefitRider?.values
            ?.length
    ) {
        riders.push({
            coverageId:
                values.riders.chronicIllnessAcceleratedDeathBenefitRider
                    ?.values[0],
            participants: [baseParticipantForRiders],
        });
    }

    if (values.riders?.waiverOfPremiumRider?.values?.length) {
        riders.push({
            coverageId: values.riders.waiverOfPremiumRider?.values[0],
            participants: [
                {
                    ...baseParticipantForRiders,
                    subStandardRating:
                        values.riders.waiverOfPremiumRider?.tableRating,
                },
            ],
        });
    }

    const flatExtras = [];

    if (
        SUBSTANDARD_PREMIUM_CLASSES.includes(values.premiumClass) &&
        values.tableOrFlatExtraSelection?.[0] == 'selectTableOrFlatExtraRatings'
    ) {
        if (values.permanentFlatExtra?.amount) {
            flatExtras.push({
                type: FARMERS_HARDCODED_DATA.permanentFlatExtraType,
                amount: values.permanentFlatExtra.amount,
            });
        }
        if (values.temporaryFlatExtra?.amount) {
            flatExtras.push({
                type: FARMERS_HARDCODED_DATA.temporaryFlatExtraType,
                amount: values.temporaryFlatExtra.amount,
                duration: values.temporaryFlatExtra?.duration,
                durationType: values.temporaryFlatExtra?.durationType,
            });
        }
    }

    const output = {
        calculationType: values.illustrationType,
        source: FARMERS_HARDCODED_DATA.source,
        illustrationRequestDate: values.illustrationRequestDate,
        jurisdiction: values.jurisdiction,
        planCode: values.planCode, // 'TL0101'
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
                        flatExtras,
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
                firstName: values.insured.firstName || '',
                middleName: values.insured.middleName || '',
                lastName: values.insured.lastName || '',
                roleCode: FARMERS_HARDCODED_DATA.insuredRoleCode,
            },
        ],
        options: {
            revisedIllustration: FARMERS_HARDCODED_DATA.revisedIllustration,
            solveFor: values.solveFor,
            fixedCostPeriod: Number(values.fixedCostPeriod),
            paymentMode: values.paymentMode,
            discountIndicator: values.discountIndicator?.[0] || 'NON',
            paymentMethod: values.paymentMethod,
            ...(values.solveFor === 'FACE' && {
                premium: {
                    basis: FARMERS_HARDCODED_DATA.premiumBasis,
                    sequence: [
                        {
                            from: FARMERS_HARDCODED_DATA.premiumFrom,
                            through: FARMERS_HARDCODED_DATA.premiumThrough,
                            value: values.modalPremiumValue,
                        },
                    ],
                },
            }),
        },
    };

    const parseOutputResult = createIllustrationPayloadSchema.parse(output);
    if (!parseOutputResult.success) {
        console.log('parseOutputResult', parseOutputResult.error);
        return failure(
            new CreateIllustrationPayloadParsingError(parseOutputResult.error)
        );
    }
    return success(parseOutputResult.value);
}

export function mapIllustrationPayloadToEngineInputData(
    data: CreateIllustrationPayload
): FarmersEntities {
    const dataInsuredParticipant = data.coverages?.[0]?.participants?.[0];
    const dataInsuredParty = data.parties[0];

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
        ...(dataInsuredParticipant?.subStandardRating && {
            subStandardRating: dataInsuredParticipant?.subStandardRating,
        }),
        permanentFlatExtra: {
            amount: dataInsuredParticipant?.flatExtra?.[0]?.amount,
        },
        temporaryFlatExtra: {
            amount: dataInsuredParticipant?.flatExtra?.[1]?.amount,
            duration: dataInsuredParticipant?.flatExtra?.[1]?.duration,
            durationType: dataInsuredParticipant?.flatExtra?.[1]?.durationType,
        },
        solveFor: data.options?.solveFor || '',
        fixedCostPeriod: data.options?.fixedCostPeriod?.toString(),
        paymentMethod: data.options?.paymentMethod || '',
        modalPremiumValue:
            Number(data.options?.premium?.sequence[0].value) || 0,
        premiumClass: '',
        riders: {},
        paymentMode: data.options?.paymentMode || '',
        discountIndicator: data.options?.discountIndicator
            ? [data.options?.discountIndicator]
            : undefined,
    };
}

// We are not checking the type of the return value right now so type is any
export function getIllustrationDataFromResponse(data: any, formInputs: any) {
    return {
        faceAmount:
            data?.assumed?.initial?.totalFaceAmount || DEFAULT_ERROR_STRING,
        initialPremium:
            data?.assumed?.initial?.totalModalPremium || DEFAULT_ERROR_STRING,
        termLength: `${
            formInputs?.fixedCostPeriod || DEFAULT_ERROR_STRING
        } years`,
    };
}
