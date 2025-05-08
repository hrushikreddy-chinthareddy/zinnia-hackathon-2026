import { DEFAULT_ERROR_STRING } from '@zinnia/utils';
import dayjs from 'dayjs';

import {
    DistributionType,
    DeathBenefitOptionType,
    LineOfBusiness,
    PartyRole,
    Policy,
    PolicyFeature,
    PolicyFeatureFeatureType,
    PolicyParties,
    PolicyStatus,
    Product,
    ProductType,
    Rider,
    LoanValues,
} from '@deps/models/policy/sor-policy';
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@deps/types/constants';
import { getCarrierLogoByClientId, getCarrierNameByClientId } from '@deps/utils/carriers';

import { Coverage } from './Coverage';
import { Features } from './Features';
import { Parties, PolicyParty } from './Parties';
import { SystematicPrograms } from './SystematicPrograms';
import { isNullEmptyOrUndefined } from '../string.helpers';

export type BasePolicyComponentArgs = {
    policy: PolicyDetails;
};

export class PolicyDetails {
    private policyRaw: Policy;
    public accountValue: number | undefined;
    public allParties: PolicyParties[] = [];
    public carrierId: string | undefined;
    public contestabilityStartDate: string | undefined;
    public contestabilityEndDate: string | undefined;
    public costBasis: number | undefined;
    public coverage: Coverage;
    public distribution: DistributionType | undefined;
    public cumulativeGrossDeathBenefitAmount: number | undefined;
    public currency: string | undefined;
    public deathBenefitOption: DeathBenefitOptionType | undefined;
    public features: Features;
    public fixedCostPeriod: number | undefined;
    public generalLedgerPlanCode: string | undefined;
    public grossDeathBenefitAmount: number | undefined;
    public isAnnuity: boolean;
    public isLife: boolean;
    public issueDate: string | undefined;
    public issueState: string | undefined;
    public loanValues: LoanValues | undefined;
    public marketingName: string | undefined;
    public maturityDate: string | undefined;
    public netAmountAtRisk: number | undefined;
    public netDeathBenefitAmount: number | undefined;
    public parties: Parties;
    public planCode: string | undefined;
    public planName: string | undefined;
    public policyNumber: string | undefined;
    public policyStatus: PolicyStatus | undefined;
    public policyTerm: number | undefined;
    public policyYear: number | undefined;
    public productType: ProductType | undefined;
    public product: Product | undefined;
    public riders?: Rider[];
    public surrenderValue: number | undefined;
    public systematicPrograms: SystematicPrograms;
    public investmentType?: string;

    constructor(policy: Policy = {}) {
        this.policyRaw = policy;

        this.parties = new Parties(policy);
        this.allParties = this.parties.parties;

        this.features = new Features(this.policyRaw.policyFeatures);

        this.coverage = new Coverage(this.policyRaw);

        this.systematicPrograms = new SystematicPrograms(this.policyRaw.systematicPrograms || []);

        this.accountValue = policy?.accountValues?.endingAccountValue;
        this.carrierId = policy?.carrierId;
        this.contestabilityStartDate = policy?.policyDates?.contestabilityStartDate;
        this.contestabilityEndDate = policy?.policyDates?.contestabilityEndDate;
        this.costBasis = policy?.costBasis?.costBasis;
        this.cumulativeGrossDeathBenefitAmount = policy?.coverage?.cumulativeGrossDeathBenefitAmount;
        this.currency = policy?.currency;
        this.deathBenefitOption = policy?.deathBenefit?.deathBenefitOption;
        this.distribution = policy.product?.distribution;
        this.fixedCostPeriod = policy.fixedCostPeriod;
        this.generalLedgerPlanCode = policy?.product?.generalLedgerPlanCode;
        // 'Annuity Product' seems to be coming to us a lot from the LC Annuities.
        // ToDo: remove once this is fixed
        this.isAnnuity =
            policy?.product?.lineOfBusiness === LineOfBusiness.ANNUITY ||
            policy?.product?.lineOfBusiness === ('Annuity Product' as LineOfBusiness);
        this.isLife = policy?.product?.lineOfBusiness === LineOfBusiness.LIFE;
        this.issueDate = policy.policyDates?.issueDate;
        this.issueState = policy.issueState;
        this.loanValues = policy?.loanValues;
        this.marketingName = policy?.product?.marketingName;
        this.maturityDate = policy.policyDates?.maturityDate;
        this.netAmountAtRisk = policy?.accountValues?.netAmountAtRisk;
        this.netDeathBenefitAmount = policy?.coverage?.netDeathBenefit;
        this.planCode = policy.product?.planCode;
        this.planName = policy.product?.planName;
        this.policyNumber = policy.policyNumber;
        this.policyStatus = policy.policyStatus;
        this.policyTerm = policy.policyTerm;
        this.policyYear = policy.policyYear;
        this.productType = policy.product?.productType;
        this.surrenderValue = policy?.accountValues?.surrenderValue;
        this.product = policy?.product;
        this.riders = policy?.riders;
        this.investmentType = policy?.allocation?.investmentType;
    }

    public get carrierName(): string | undefined {
        return getCarrierNameByClientId(this.carrierId as string) || this.carrierId;
    }

    // This will give you an svg of the carrier's logo or a placeholder
    public get logo(): any {
        return getCarrierLogoByClientId(this.carrierId as string);
    }

    public get owner(): PolicyParty | undefined {
        return this.parties.owner;
    }

    public get allOwners(): PolicyParty[] {
        return this.parties.allOwners;
    }

    // Will return annuitants for Annuities and insureds for Life Insurance
    public get coveredPeople(): PolicyParty[] {
        // ToDo - BPB: Once the data looks good, implement the below instead of catchin all
        // let coveredPartyRole: PartyRole;
        // if (this.isAnnuity) {
        //     coveredPartyRole = 'ANNUITANT' as PartyRole;
        // } else {
        //     coveredPartyRole = PartyRole.INSURED;
        // }

        return [...this.parties.getPartiesWithRole('ANNUITANT' as PartyRole), ...this.parties.getPartiesWithRole(PartyRole.INSURED)];
    }

    public get baseDeathBenefit(): number | undefined {
        return this.coverage.baseDeathBenefit;
    }

    public get faceValue(): number | undefined {
        return this.coverage.faceValue;
    }

    public get fixedCostPeriodLeft(): number | undefined {
        if (!isNullEmptyOrUndefined(this.fixedCostPeriod) && !isNullEmptyOrUndefined(this.policyYear)) {
            return Number(this.fixedCostPeriod) - Number(this.policyYear);
        }
        return undefined;
    }

    public getPartyById(id: string | undefined): PolicyParty | undefined {
        if (!id) {
            return;
        }
        return this.parties.getPartyById(id);
    }

    public getPartiesWithRole(role: PartyRole | undefined): PolicyParty[] {
        if (!role) {
            return [];
        }
        return this.parties.getPartiesWithRole(role);
    }

    public getFeaturesByType(featureType: PolicyFeatureFeatureType | undefined): PolicyFeature[] {
        if (!featureType) {
            return [];
        }
        return this.features.getFeaturesByType(featureType);
    }

    public get policy(): Policy {
        return this.policyRaw;
    }

    public get isUniversalLife(): boolean {
        return this.productType === ProductType.UNIVERSALLIFE;
    }

    public get hasLoans(): boolean {
        return !!this.policy?.allocation?.loanSegments?.length;
    }

    /**
     * Checks if the policy is still in the free look period and returns the end date.
     * @returns An object with two properties:
     *          - `isInFreeLookPeriod`: A boolean indicating if the policy is still in the free look period.
     *          - `endDate`: The date the free look period ends.
     */
    public get freeLookPeriodDetails(): { isInFreeLookPeriod: boolean; endDate: any } {
        const freeLookCancellationDate = this.features.getFirstFeatureByType(PolicyFeatureFeatureType.freelook)?.endDate;
        const hadEndDate = !isNullEmptyOrUndefined(freeLookCancellationDate);

        return {
            // We add 15 days to the cancellation date in case ops needs to back date,
            // so they still have access to the cancellation functionality. The 15 is based on... a number that was chosen.
            // In the banner we still display the ACTUAL end date of the free look period.
            isInFreeLookPeriod:
                this.policyStatus === PolicyStatus.ACTIVE && hadEndDate && dayjs().isBefore(dayjs(freeLookCancellationDate).add(15, 'day')),
            endDate: hadEndDate ? dayjs(freeLookCancellationDate).format(DEFAULT_DATE_DISPLAY_FORMAT) : DEFAULT_ERROR_STRING,
        };
    }

    public get requiredMinimumDistribution(): {
        // placeholder types
        calculationOption?: string;
        calculationDate?: Date;
        totalAnnualAmount?: number;
        remainingAmount?: number;
        priorYearValue?: number;
        actuarialPresentValue?: number;
    } {
        const {
            requiredMinimumDistributionCalculationOption: calculationOption,
            requiredMinimumDistributionCalculationDate: calculationDate,
            totalRequiredMinimumDistributionAnnualAmount: totalAnnualAmount,
            remainingRequiredMinimumDistributionAmount: remainingAmount,
            totalRequiredMinimumDistributionPriorYearEndAccountValue: priorYearValue,
            actuarialPresentValue,
            // @ts-expect-error waiting for requiredMinimumDistribution to be added to Policy
        } = this.policy?.requiredMinimumDistribution || {};

        return {
            calculationOption,
            calculationDate,
            totalAnnualAmount,
            remainingAmount,
            priorYearValue,
            actuarialPresentValue,
        };
    }
}
