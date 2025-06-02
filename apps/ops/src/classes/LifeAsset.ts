import { LineOfBusiness, Policy, ProductType, Reason } from '@zinnia/api-types/types/sor';

import {
    checkEligibilityOneTimePremium,
    checkEligibilityPartialWithdrawalOneTime,
    checkEligibilitySystematicPrograms,
    TransactionResponse,
} from '@deps/queries/api/bpm';

export abstract class LifeAsset {
    policy: Policy;
    constructor(policy: Policy) {
        this.policy = policy;
    }

    getSystematicPrograms(reason: Reason) {
        return this.policy.systematicPrograms?.find(sp => sp.reason === reason);
    }

    isLifePolicy() {
        return this.policy.product?.lineOfBusiness === LineOfBusiness.LIFE;
    }

    isAnnuity() {
        return this.policy.product?.lineOfBusiness === LineOfBusiness.ANNUITY;
    }

    abstract checkEligibilitySystematicPrograms(): Promise<TransactionResponse>;
    abstract checkEligibilityOneTimePremium(): Promise<TransactionResponse>;
    abstract checkEligibilityPartialWithdrawalOneTime(): Promise<TransactionResponse>;
}

// Example subclass implementation
export class ULAsset extends LifeAsset {
    async checkEligibilitySystematicPrograms(): Promise<TransactionResponse> {
        const systematicProgram = this.getSystematicPrograms(Reason.PREMIUM);
        const arrangementId = systematicProgram?.arrangementId || ''; // TODO: why does this default to an empty string?
        return await checkEligibilitySystematicPrograms(this.policy.product?.planCode, this.policy.policyNumber, arrangementId);
    }

    async checkEligibilityOneTimePremium(): Promise<TransactionResponse> {
        return await checkEligibilityOneTimePremium(this.policy.product?.planCode, this.policy.policyNumber);
    }

    async checkEligibilityPartialWithdrawalOneTime(): Promise<TransactionResponse> {
        return await checkEligibilityPartialWithdrawalOneTime(this.policy.product?.planCode, this.policy.policyNumber);
    }
}

export class IULAsset extends LifeAsset {
    async checkEligibilitySystematicPrograms(): Promise<TransactionResponse> {
        const systematicProgram = this.getSystematicPrograms(Reason.PREMIUM);
        const arrangementId = systematicProgram?.arrangementId || ''; // TODO: why does this default to an empty string?
        return await checkEligibilitySystematicPrograms(this.policy.product?.planCode, this.policy.policyNumber, arrangementId);
    }

    async checkEligibilityOneTimePremium(): Promise<TransactionResponse> {
        return await checkEligibilityOneTimePremium(this.policy.product?.planCode, this.policy.policyNumber);
    }

    async checkEligibilityPartialWithdrawalOneTime(): Promise<TransactionResponse> {
        return await checkEligibilityPartialWithdrawalOneTime(this.policy.product?.planCode, this.policy.policyNumber);
    }
}

export class AnnuityAsset extends LifeAsset {
    async checkEligibilitySystematicPrograms(): Promise<TransactionResponse> {
        return Promise.reject(new Error('AnnuityAsset checkEligibilitySystematicPrograms Not implemented'));
    }

    async checkEligibilityOneTimePremium(): Promise<TransactionResponse> {
        return Promise.reject(new Error('AnnuityAsset checkEligibilityOneTimePremium Not implemented'));
    }

    async checkEligibilityPartialWithdrawalOneTime(): Promise<TransactionResponse> {
        return Promise.reject(new Error('AnnuityAsset checkEligibilityPartialWithdrawalOneTime Not implemented'));
    }
}

export class LifeAssetFactory {
    static getLifeAsset(policy: Policy): LifeAsset {
        if (policy.product?.lineOfBusiness === LineOfBusiness.LIFE) {
            if (policy.product?.productType === ProductType.UNIVERSALLIFE) {
                return new ULAsset(policy);
            } else if (policy.product?.productType === ProductType.INDEXEDUNIVERSALLIFE) {
                // TODO: what is the product type for IUL assets?
                return new IULAsset(policy);
            }
        } else if (policy.product?.lineOfBusiness === LineOfBusiness.ANNUITY) {
            return new AnnuityAsset(policy);

            // example of specific productType
            // if (policy.product?.productType === 'Fixed Index Annuity') {

            // }
            // Add additional checks for productType under 'Annuity Product' if needed
        } else {
            throw new Error(`Unsupported line of business: ${policy.product?.lineOfBusiness}`);
        }

        return new ULAsset(policy); // TODO: what to do if line of business is not Life or Annuity
    }
}
