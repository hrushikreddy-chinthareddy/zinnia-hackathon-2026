import { CoverageLayer, CoverageParticipants, FlatExtra, Policy } from '@zinnia/api-types/types/sor';

import { DataDefinition } from '@deps/types/data';

export interface PolicyCoverageLayerDto {
    id?: number;
    coverageId?: string;
    coverageType?: string;
    coverageName?: string;
    productCode?: string;
    currentAmount?: number;
    originalCoverageAmount?: number;
    minimumCoverageAmount?: number;
    maximumCoverageAmount?: number;
    coverageChangeAmount?: number;
    grossDeathBenefitAmount?: number;
    lowDeathBenefitAmount?: number;
    coverageEffectiveDate?: string;
    coverageChangeEffectiveDate?: string;
    coverageTerminationDate?: string;
    unitOfCoverage?: number;
    valuePerUnitOfCoverage?: number;
    premiumFrequency?: string;
    guidelineSinglePremium?: number;
    guidelineLevelPremium?: number;
    sevenPayPremium?: number;
}

export const coverageLayerColumns = [
    { field: 'coverageID', headerName: 'Coverage ID', flex: 1 },
    { field: 'coverageType', headerName: 'Coverage Type', flex: 1 },
    { field: 'coverageName', headerName: 'Coverage Name', flex: 1 },
    { field: 'currentAmount', headerName: 'Current Coverage Amount', flex: 1.5 },
    { field: 'coverageEffectiveDate', headerName: 'Coverage Effective Date', flex: 1.5 },
    { field: 'coverageTerminationDate', headerName: 'Coverage Termination Date', flex: 1.5 },
    { field: 'actions', headerName: 'Actions', flex: 1 },
];

export const toPolicyCoverageLayersDto = (policy: Policy): PolicyCoverageLayerDto[] => {
    const coverageLayers = policy.coverage?.coverageLayers;
    if (!coverageLayers) {
        return [];
    }
    return coverageLayers.map((coverageLayer, idx) => {
        return {
            id: idx,
            coverageID: coverageLayer.coverageId,
            coverageType: coverageLayer.coverageType,
            coverageName: coverageLayer.coverageName,
            currentAmount: coverageLayer.currentAmount,
            coverageEffectiveDate: coverageLayer.coverageEffectiveDate,
            coverageTerminationDate: coverageLayer.coverageTerminationDate,
        };
    });
};

export const toPolicyCoverageLayerDto = (policy: Policy): PolicyCoverageLayerDto => {
    if (!policy.coverage) {
        return {} as PolicyCoverageLayerDto;
    }

    const coverageLayers = policy.coverage.coverageLayers;

    if (!coverageLayers || coverageLayers.length === 0) {
        return {} as PolicyCoverageLayerDto;
    }

    const coverageLayer = coverageLayers[0];

    const {
        coverageId,
        coverageType,
        coverageName,
        productCode,
        currentAmount,
        originalCoverageAmount,
        minimumCoverageAmount,
        maximumCoverageAmount,
        coverageChangeAmount,
        grossDeathBenefitAmount,
        lowDeathBenefitAmount,
        coverageEffectiveDate,
        coverageChangeEffectiveDate,
        coverageTerminationDate,
        unitOfCoverage,
        valuePerUnitOfCoverage,
        // TODO CB - Missing in spec used in [XE-153]
        // premiumFrequency,
    } = coverageLayer;

    return {
        coverageId,
        coverageType,
        coverageName,
        productCode,
        currentAmount,
        originalCoverageAmount,
        minimumCoverageAmount,
        maximumCoverageAmount,
        coverageChangeAmount,
        grossDeathBenefitAmount,
        lowDeathBenefitAmount,
        coverageEffectiveDate,
        coverageChangeEffectiveDate,
        coverageTerminationDate,
        unitOfCoverage,
        valuePerUnitOfCoverage,
        // TODO CB - Missing in spec used in [XE-153]
        // premiumFrequency,
    };
};

export const PolicyCoverageLayerInfo: DataDefinition<PolicyCoverageLayerDto>[] = [
    {
        key: `coverageId`,
        label: 'Coverage ID',
    },
    {
        key: `coverageType`,
        label: 'Coverage Type',
    },
    {
        key: `coverageName`,
        label: 'Coverage Name',
    },
    {
        key: `productCode`,
        label: 'Plan Code',
    },
    {
        key: `currentAmount`,
        label: 'Current Coverage Amount',
    },
    {
        key: `originalCoverageAmount`,
        label: 'Original Coverage Amount',
    },
    {
        key: `minimumCoverageAmount`,
        label: 'Minimum Coverage Amount',
    },
    {
        key: `maximumCoverageAmount`,
        label: 'Maximum Coverage Amount',
    },
    {
        key: `coverageChangeAmount`,
        label: 'Coverage Change Amount',
    },
    {
        key: `grossDeathBenefitAmount`,
        label: 'Gross Death Benefit',
    },
    {
        key: `lowDeathBenefitAmount`,
        label: 'Low Death Benefit',
    },
    {
        key: `coverageEffectiveDate`,
        label: 'Coverage Effective Date',
    },
    {
        key: `coverageChangeEffectiveDate`,
        label: 'Coverage Change Effective Date',
    },
    {
        key: `coverageTerminationDate`,
        label: 'Coverage Termination Date',
    },
    {
        key: `unitOfCoverage`,
        label: 'Unit of Coverage',
    },
    {
        key: `valuePerUnitOfCoverage`,
        label: 'Value Per Unit of Coverage',
    },
    {
        key: `premiumFrequency`,
        label: 'Premium Mode',
    },
];

export const toPolicyCoverageLayerTestDto = (policy: Policy): PolicyCoverageLayerDto => {
    if (!policy.coverage || !policy.coverage.coverageLayers || policy.coverage.coverageLayers.length === 0) {
        return {} as PolicyCoverageLayerDto;
    }

    const coverageLayer = policy.coverage.coverageLayers[0];
    const { guidelineSinglePremium, guidelineLevelPremium, sevenPayPremium } = coverageLayer;

    return { guidelineSinglePremium, guidelineLevelPremium, sevenPayPremium };
};

export const PolicyCoverageLayerTestInfo: DataDefinition<PolicyCoverageLayerDto>[] = [
    {
        key: `guidelineSinglePremium`,
        label: 'Guideline Single Premium',
    },
    {
        key: `guidelineLevelPremium`,
        label: 'Guideline Level Premium',
    },
    {
        key: `sevenPayPremium`,
        label: '7 Pay Premium',
    },
];

export const coverageLayerInsuredTieColums = [
    { field: 'partyID', headerName: 'Insured ID', flex: 1 },
    { field: 'issueAge', headerName: 'Insured Age at Issue', flex: 1 },
    { field: 'riskClass', headerName: 'Risk Class', flex: 1 },
    { field: 'subStandardRating', headerName: 'Sub Standard Rating', flex: 1 },
    { field: 'flatExtraType', headerName: 'Flat Extra Type', flex: 1 },
    { field: 'flatExtraDuration', headerName: 'Flat Extra Duration', flex: 1 },
    { field: 'flatExtraAmount', headerName: 'Flat Extra Amount', flex: 1 },
    { field: 'flatExtraStartDate', headerName: 'Flex Extra Start Date', flex: 1 },
];

export type PolicyCoverageLayerInsuredTieDto = {
    id?: number;
    partyID?: string;
    attainedAge?: number;
    issueAge?: number;
    riskClass?: number;
    subStandardRating?: number;
    flatExtraType?: number;
    flatExtraDuration?: number;
    flatExtraAmount?: number;
    flatExtraStartDate?: string;
};

export const toPolicyCoverageLayerInsuredTieDto = (policy: Policy): PolicyCoverageLayerInsuredTieDto[] => {
    // Assuming coverageParticipants are located in policy.coverage.coverageLayers[].coverageParticipants
    const coverageLayers = policy.coverage?.coverageLayers;

    if (!coverageLayers) {
        return [] as PolicyCoverageLayerInsuredTieDto[];
    }

    let insuredTies: PolicyCoverageLayerInsuredTieDto[] = [];

    coverageLayers.forEach((coverageLayer: CoverageLayer) => {
        const coverageParticipants = coverageLayer.coverageParticipants;
        coverageParticipants?.map((coverageParticipant: CoverageParticipants) =>
            coverageParticipant.flatExtra?.map((flEx: FlatExtra, flExIdx: number) => {
                insuredTies = [
                    ...insuredTies,
                    {
                        id: flExIdx,
                        partyID: coverageParticipant.partyId,
                        issueAge: coverageParticipant.issueAge,
                        riskClass: coverageParticipant.riskClass ? parseInt(coverageParticipant.riskClass) : undefined,
                        subStandardRating: coverageParticipant.substandardRating
                            ? parseInt(coverageParticipant.substandardRating)
                            : undefined,
                        flatExtraAmount: flEx.flatExtraAmount,
                        flatExtraDuration: flEx.flatExtraDuration,
                        flatExtraStartDate: flEx.flatExtraStartDate,
                        flatExtraType: flEx.flatExtraType ? parseInt(flEx.flatExtraType) : undefined,
                    },
                ];
            })
        );
    });

    return insuredTies;
};
