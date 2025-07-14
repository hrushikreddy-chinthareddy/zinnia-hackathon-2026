import { Infer, t } from 'typegate';

export enum IllustrationCalculationTypes {
    'QUICK_QUOTE' = 'QUICK_QUOTE',
    'SINGLE_ILLUSTRATION' = 'SINGLE_ILLUSTRATION',
    'AGGREGATE_ILLUSTRATION' = 'AGGREGATE_ILLUSTRATION',
    'COMPOSITE_ILLUSTRATION' = 'COMPOSITE_ILLUSTRATION',
}

enum Jurisdictions {
    AK = 'AK',
    AL = 'AL',
    AR = 'AR',
    AS = 'AS',
    AZ = 'AZ',
    CA = 'CA',
    CO = 'CO',
    CT = 'CT',
    DC = 'DC',
    DE = 'DE',
    FL = 'FL',
    GA = 'GA',
    GU = 'GU',
    HI = 'HI',
    IA = 'IA',
    ID = 'ID',
    IL = 'IL',
    IN = 'IN',
    KS = 'KS',
    KY = 'KY',
    LA = 'LA',
    MA = 'MA',
    MD = 'MD',
    ME = 'ME',
    MI = 'MI',
    MN = 'MN',
    MO = 'MO',
    MP = 'MP',
    MS = 'MS',
    MT = 'MT',
    NC = 'NC',
    ND = 'ND',
    NE = 'NE',
    NH = 'NH',
    NJ = 'NJ',
    NM = 'NM',
    NV = 'NV',
    NY = 'NY',
    OH = 'OH',
    OK = 'OK',
    OR = 'OR',
    PA = 'PA',
    PR = 'PR',
    RI = 'RI',
    SC = 'SC',
    SD = 'SD',
    TN = 'TN',
    TX = 'TX',
    UM = 'UM',
    UT = 'UT',
    VA = 'VA',
    VI = 'VI',
    VT = 'VT',
    WA = 'WA',
    WI = 'WI',
    WV = 'WV',
    WY = 'WY',
}

export enum IllustrationFlatExtraTypes {
    TEMPORARY = 'TEMPORARY',
    PERMANENT = 'PERMANENT',
}

enum FlatExtraDurationTypes {
    YEAR = 'YEARS',
    MONTH = 'MONTHS',
}

export enum IllustrationPartyTypeCode {
    INDIVIDUAL = 'INDIVIDUAL',
    ORGANIZATION = 'ORGANIZATION',
    TRUST = 'TRUST',
}

enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    UNISEX = 'UNISEX',
    OTHER = 'OTHER',
}

enum PhoneType {
    MOBILE = 'MOBILE',
    HOME = 'HOME',
    BUSINESS = 'BUSINESS',
    CLAIMCENTER = 'CLAIMCENTER',
    CUSTOMERSERVICE = 'CUSTOMERSERVICE',
    CORPORATEOFFICE = 'CORPORATEOFFICE',
    FAX = 'FAX',
    UNKNOWN = 'UNKNOWN',
    OTHER = 'OTHER',
}

enum IdentificationType {
    PASSPORT = 'PASSPORT',
    STATEID = 'STATEPHOTOID',
    DRIVERSLICENSE = 'DRIVERLICENSENUMBER',
    SSN = 'SSN',
    TIN = 'TIN',
    OTHER = 'OTHER',
    EXTERNAL = 'EXTERNAL',
}

enum SolveFor {
    PREMIUM = 'PREMIUM',
    FACE = 'FACE',
    NO_SOLVE = 'NO_SOLVE',
}

enum PaymentModes {
    DAILY = 'DAILY',
    EVERYTWOWEEKS = 'EVERYTWOWEEKS',
    MONTHLY = 'MONTHLY',
    SEMIANNUAL = 'SEMIANNUAL',
    QUARTERLY = 'QUARTERLY',
    ANNUAL = 'ANNUAL',
    SINGLEPAYMENT = 'SINGLEPAYMENT',
}

enum DiscountIndicators {
    MULTIPRODUCT = 'MULTIPRODUCT',
    NON = 'NON',
}

enum PaymentMethods {
    DTCC = 'DTCC',
    CREDITCARD = 'CREDITCARD',
    ACH = 'ACH',
    CHECK = 'CHECK',
    EXCHANGE = 'EXCHANGE',
    WIRE = 'WIRE',
}

enum PremiumDurationOptions {
    AGE = 'AGE',
    YEARS = 'YEARS',
}

enum FaceAmountAndPremiumFrequency {
    DAILY = 'DAILY',
    EVERYTWOWEEKS = 'EVERYTWOWEEKS',
    MONTHLY = 'MONTHLY',
    SEMIANNUAL = 'SEMIANNUAL',
    QUARTERLY = 'QUARTERLY',
    ANNUAL = 'ANNUAL',
    SINGLEPAYMENT = 'SINGLEPAYMENT',
}

export enum IllustrationFaceAmountAndPremiumBasis {
    AGE = 'AGE',
    DURATION = 'DURATION',
    RETIREMENT = 'RETIREMENT',
}

enum FaceAmountOption {
    SOLVE_FOR_TARGET_CASH_VALUE = 'SOLVE_FOR_TARGET_CASH_VALUE',
    MINIMUM_NON_MEC = 'MINIMUM_NON_MEC',
}

export enum InsuredRoleCodes {
    INSURED = 'INSURED',
    OWNER = 'OWNER',
}

enum NonInsuredRoleCodes {
    OWNER = 'OWNER',
    PRIMARYBENEFICIARY = 'PRIMARYBENEFICIARY',
    CONTINGENTBENEFICIARY = 'CONTINGENTBENEFICIARY',
    INSURED = 'INSURED',
    PAYOR = 'PAYOR',
    PAYEE = 'PAYEE',
    AGENT = 'AGENT',
    PRIMARYWRITINGAGENT = 'PRIMARYWRITINGAGENT',
    PRIMARYSERVICINGAGENT = 'PRIMARYSERVICINGAGENT',
    ADDITIONALSERVICINGAGENT = 'ADDITIONALSERVICINGAGENT',
    ADDITIONALWRITINGAGENT = 'ADDITIONALWRITINGAGENT',
    THIRDPARTYDESIGNEE = 'THIRDPARTYDESIGNEE',
    JOINTOWNER = 'JOINTOWNER',
    COVERAGEINSURED = 'COVERAGEINSURED',
    ASSIGNEE = 'ASSIGNEE',
    ANNUITANT = 'ANNUITANT',
    EXCHANGECOMPANY = 'EXCHANGECOMPANY',
    JOINTANNUITANT = 'JOINTANNUITANT',
    GRANTOR = 'GRANTOR',
    TRUSTEE = 'TRUSTEE',
    POWEROFATTORNEY = 'POWEROFATTORNEY',
    AUTHORISEDSIGNER = 'AUTHORISEDSIGNER',
    OTHERINTERESTEDPARTY = 'OTHERINTERESTEDPARTY',
    CONTINGENTOWNER = 'CONTINGENTOWNER',
}

enum PremiumOption {
    SOLVE_FOR_TARGET_CASH_VALUE = 'SOLVE_FOR_TARGET_CASH_VALUE',
    MINIMUM_PREMIUM = 'MINIMUM_PREMIUM',
    TARGET_PREMIUM = 'TARGET_PREMIUM',
    GUIDELINE_MAXIMUM_PREMIUM = 'GUIDELINE_MAXIMUM_PREMIUM',
    GUIDELINE_LEVEL_PREMIUM = 'GUIDELINE_LEVEL_PREMIUM',
    LEVEL_NON_MEC = 'LEVEL_NON_MEC',
}

enum TargetCashValueOption {
    SPECIFY_AMOUNT = 'SPECIFY_AMOUNT',
    ENDOWMENT = 'ENDOWMENT',
}

enum UnderwritingClass {
    ULTRANONTOBACCO = 'ULTRANONTOBACCO',
    ELITENONTOBACCO = 'ELITENONTOBACCO',
    PREFERREDNONTOBACCO = 'PREFERREDNONTOBACCO',
    STANDARDNONTOBACCO = 'STANDARDNONTOBACCO',
    STANDARDTOBACCO = 'STANDARDTOBACCO',
    STANDARDAGGREGATE = 'STANDARDAGGREGATE',
    SUBSTANDARDNONTOBACCO = 'SUBSTANDARDNONTOBACCO',
    SUBSTANDARDTOBACCO = 'SUBSTANDARDTOBACCO',
    STANDARDPLUSNONTOBACCO = 'STANDARDPLUSNONTOBACCO',
    PREFERREDTOBACCO = 'PREFERREDTOBACCO',
    STANDARDCONVERSIONNONTOBACCO = 'STANDARDCONVERSIONNONTOBACCO',
    STANDARDCONVERSIONTOBACCO = 'STANDARDCONVERSIONTOBACCO',
    STANDARDPLUSBLEND = 'STANDARDPLUSBLEND',
    STANDARDPLUSTOBACCO = 'STANDARDPLUSTOBACCO',
    STANDARDBLEND = 'STANDARDBLEND',
    SUBSTANDARDBLEND = 'SUBSTANDARDBLEND',
    PREFERREDSELECTNONTOBACCO = 'PREFERREDSELECTNONTOBACCO',
    PREFERREDSELECTBLEND = 'PREFERREDSELECTBLEND',
    PREFERREDSELECTTOBACCO = 'PREFERREDSELECTTOBACCO',
    PREFERREDBLEND = 'PREFERREDBLEND',
}

export enum SubStandardRating {
    TABLEA = 'TABLEA',
    TABLEB = 'TABLEB',
    TABLEC = 'TABLEC',
    TABLED = 'TABLED',
    TABLEE = 'TABLEE',
    TABLEF = 'TABLEF',
    TABLEG = 'TABLEG',
    TABLEH = 'TABLEH',
    TABLEI = 'TABLEI',
    TABLEJ = 'TABLEJ',
    TABLEK = 'TABLEK',
    TABLEL = 'TABLEL',
    TABLEM = 'TABLEM',
    TABLEN = 'TABLEN',
    TABLEO = 'TABLEO',
    TABLEP = 'TABLEP',
    NONETABLE = 'NONETABLE',
}

const illustrationPayloadFlatExtraSchema = t.object(
    t.optionalProperty('type', t.enum(IllustrationFlatExtraTypes)),
    t.optionalProperty('amount', t.number),
    t.optionalProperty('duration', t.number),
    t.optionalProperty('durationType', t.enum(FlatExtraDurationTypes)),
    t.optionalProperty('startDate', t.string)
);

const illustrationPayloadParticipantSchema = t.object(
    t.property('issueAge', t.number),
    t.property('participantId', t.string),
    t.optionalProperty('underwritingClass', t.enum(UnderwritingClass)),
    t.optionalProperty('subStandardRating', t.enum(SubStandardRating)),
    t.optionalProperty('flatExtra', t.array(illustrationPayloadFlatExtraSchema))
);

const illustrationPayloadCoverageSchema = t.object(
    t.property('coverageId', t.string),
    t.optionalProperty('riderYears', t.number),
    t.optionalProperty('currentAmount', t.number),
    t.optionalProperty(
        'participants',
        t.array(illustrationPayloadParticipantSchema)
    )
);

const illustrationPayloadAddressSchema = t.object(
    t.optionalProperty('addressLine1', t.string),
    t.optionalProperty('addressLine2', t.string),
    t.optionalProperty('city', t.string),
    t.optionalProperty('state', t.string),
    t.optionalProperty('zipCode', t.string)
);

const illustrationPayloadIdentificationSchema = t.object(
    t.optionalProperty('identificationType', t.enum(IdentificationType)),
    t.optionalProperty('identificationKey', t.string),
    t.optionalProperty('identificationDescription', t.string),
    t.optionalProperty('identificationValue', t.string)
);

const illustrationPayloadBasePartySchema = t.object(
    t.property('partyId', t.string),
    t.property('partyTypeCode', t.enum(IllustrationPartyTypeCode)),
    t.optionalProperty('dateOfBirth', t.string),
    t.optionalProperty('firstName', t.string),
    t.optionalProperty('middleName', t.string),
    t.optionalProperty('suffix', t.string),
    t.optionalProperty('address', illustrationPayloadAddressSchema),
    t.optionalProperty('phoneType', t.enum(PhoneType)),
    t.optionalProperty('phone', t.string),
    t.optionalProperty(
        'identification',
        illustrationPayloadIdentificationSchema
    )
);

const illustrationPayloadInsuredPartySchema = t.intersection(
    illustrationPayloadBasePartySchema,
    t.object(
        t.property('gender', t.enum(Gender)),
        t.property('lastName', t.string),
        t.property('roleCode', t.enum(InsuredRoleCodes))
    )
);

const illustrationPayloadNonInsuredPartySchema = t.intersection(
    illustrationPayloadBasePartySchema,
    t.object(
        t.property('gender', t.enum(Gender)),
        t.property('lastName', t.string),
        t.property('roleCode', t.enum(NonInsuredRoleCodes))
    )
);

const illustrationPayloadFaceAmountSequenceSchema = t.object(
    t.property('from', t.number),
    t.property('through', t.number),
    t.property('value', t.union(t.number, t.enum(FaceAmountOption)))
);

const illustrationPayloadFaceAmountSchema = t.object(
    t.optionalProperty('frequency', t.enum(FaceAmountAndPremiumFrequency)),
    t.optionalProperty('basis', t.enum(IllustrationFaceAmountAndPremiumBasis)),
    t.property('sequence', t.array(illustrationPayloadFaceAmountSequenceSchema))
);

const illustrationPayloadPremiumSequenceSchema = t.object(
    t.property('from', t.number),
    t.property('through', t.number),
    t.property('value', t.union(t.number, t.enum(PremiumOption)))
);

const illustrationPayloadPremiumSchema = t.object(
    t.optionalProperty('frequency', t.enum(FaceAmountAndPremiumFrequency)),
    t.optionalProperty('basis', t.enum(IllustrationFaceAmountAndPremiumBasis)),
    t.property('sequence', t.array(illustrationPayloadPremiumSequenceSchema))
);

const illustrationPayloadOptionsSchema = t.object(
    t.property('revisedIllustration', t.boolean),
    t.property('solveFor', t.enum(SolveFor)),
    t.optionalProperty('fixedCostPeriod', t.number),
    t.property('paymentMode', t.enum(PaymentModes)),
    t.optionalProperty('discountIndicator', t.enum(DiscountIndicators)),
    t.optionalProperty('paymentMethod', t.enum(PaymentMethods)),
    t.optionalProperty('premiumDuration', t.number),
    t.optionalProperty('premiumDurationOption', t.enum(PremiumDurationOptions)),
    t.optionalProperty('faceAmount', illustrationPayloadFaceAmountSchema),
    t.optionalProperty('premium', illustrationPayloadPremiumSchema),
    t.optionalProperty('targetCashValueOption', t.enum(TargetCashValueOption)),
    t.optionalProperty('targetCashValueAge', t.number),
    t.optionalProperty('targetCashValueAmount', t.union(t.number, t.undefined))
);

const illustrationPayloadReportsSchema = t.object(
    t.optionalProperty('internalRateOfReturnOn', t.boolean),
    t.optionalProperty('annualChargesOn', t.boolean),
    t.optionalProperty('annualChargesYears', t.number),
    t.optionalProperty('monthlyChargesOn', t.boolean),
    t.optionalProperty('monthlyChargesYears', t.number)
);

export const createIllustrationPayloadSchema = t
    .object(
        t.property(
            'calculationType',
            t.union(t.enum(IllustrationCalculationTypes))
        ),
        t.optionalProperty('source', t.string),
        t.property('illustrationRequestDate', t.string),
        t.property('illustrationRequestDate', t.string),
        t.property('jurisdiction', t.enum(Jurisdictions)),
        t.property('planCode', t.string),
        t.property('coverages', t.array(illustrationPayloadCoverageSchema)),
        t.property(
            'parties',
            t.array(
                t.union(
                    illustrationPayloadInsuredPartySchema,
                    illustrationPayloadNonInsuredPartySchema
                )
            )
        ),
        t.optionalProperty('options', illustrationPayloadOptionsSchema),
        t.optionalProperty('reports', illustrationPayloadReportsSchema)
    )
    .setTypeName('CreateIllustrationPayload');

export type CreateIllustrationPayload = Infer<
    typeof createIllustrationPayloadSchema
>;

export class CreateIllustrationPayloadParsingError extends Error {
    readonly _tag = 'CreateIllustrationPayloadParsingError';
}
