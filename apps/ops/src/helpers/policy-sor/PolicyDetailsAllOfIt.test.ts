import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';

import { PolicyDetails } from './PolicyDetails';

describe('Policy Details with all the sub classes unmocked', () => {
    it('should not blow up if there is no policy provided to it', () => {
        const noPolicy = new PolicyDetails(undefined);
        expect(noPolicy.policyNumber).toBeUndefined();
        expect(noPolicy.isAnnuity).toEqual(false);
        expect(noPolicy.isLife).toEqual(false);
        expect(noPolicy.owner).toBeUndefined();
        expect(noPolicy.allOwners).toHaveLength(0);
        expect(noPolicy.coveredPeople).toHaveLength(0);
        expect(noPolicy.baseDeathBenefit).toBeUndefined();
        expect(noPolicy.getFeaturesByType('mockType' as any)).toHaveLength(0);
    });

    it('should not blow up if there is a policy provided to it', () => {
        const policy = new PolicyDetails(mockPolicy);
        expect(policy.policyNumber).toEqual(mockPolicy.policyNumber);
        expect(policy.isAnnuity).toEqual(false);
        expect(policy.isLife).toEqual(true);
        expect(policy.owner).toBeTruthy();
        expect(policy.allOwners).toHaveLength(1);
        expect(policy.coveredPeople).toHaveLength(1);
        expect(policy.baseDeathBenefit).toEqual(50000);
        expect(policy.getFeaturesByType('mockType' as any)).toHaveLength(0);
    });
});
