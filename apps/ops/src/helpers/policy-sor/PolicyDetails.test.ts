import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';
import {
    PartyRole,
    PolicyStatus,
    ProductType,
} from '@zinnia/api-types/types/sor';

import { PolicyDetails } from './PolicyDetails';

const mockGetPartiesWithRole = jest.fn();
const mockGetPartyById = jest.fn();
const mockOwner = {};
const mockAllOwners = [mockOwner];
jest.mock('@deps/helpers/policy-sor/Parties', () => ({
    Parties: jest.fn().mockImplementation(() => {
        return {
            getPartiesWithRole: mockGetPartiesWithRole,
            getPartyById: mockGetPartyById,
            owner: mockOwner,
            allOwners: mockAllOwners,
        };
    }),
}));

const mockGetFeaturesByType = jest.fn();
jest.mock('@deps/helpers/policy-sor/Features', () => ({
    Features: jest.fn().mockImplementation(() => {
        return {
            getFeaturesByType: mockGetFeaturesByType,
        };
    }),
}));

let policyDetails: PolicyDetails;

const tpaMocks = [
    ['Zinnia', { value: 'Zinnia', result: true }],
    ['null', { value: 'null', result: true }], // NOTE: Confirm with BE team that the value is always a string or can be null / have to update the type
    ['SE2', { value: 'tpa-12345', result: true }],
    ['Non-Zinnia', { value: 'Non-Zinnia', result: false }],
] as const;

describe('PolicyDetails', () => {
    beforeAll(() => {
        policyDetails = new PolicyDetails(mockPolicy);
    });

    it('should return the policy from the policyRaw', () => {
        expect(policyDetails.policy).toEqual(mockPolicy);
    });

    it('should accurately determine if the policy is an annuity or life policy', () => {
        expect(policyDetails.isAnnuity).toEqual(false);
        expect(policyDetails.isLife).toEqual(true);
    });

    it('should properly return policy values', () => {
        expect(policyDetails.policyNumber).toEqual('JKIUL000888');
        expect(policyDetails.policyStatus).toEqual(PolicyStatus.ACTIVE);
        expect(policyDetails.currency).toEqual('USD');
        expect(policyDetails.marketingName).toEqual('Everly IUL TermVest+');
        expect(policyDetails.generalLedgerPlanCode).toEqual('IU201');
        expect(policyDetails.productType).toEqual(
            ProductType.INDEXEDUNIVERSALLIFE
        );
        expect(policyDetails.maturityDate).toEqual('2096-06-01');
        expect(policyDetails.issueDate).toEqual('2024-06-01');
        expect(policyDetails.planCode).toEqual('ELIULV01');
        expect(policyDetails.planName).toEqual('Everly IUL TermVest+');
        expect(policyDetails.carrierName).toEqual('Everly');
    });

    it('should hand off to the parties class', () => {
        const owner = policyDetails.owner;
        const allOwners = policyDetails.allOwners;
        policyDetails.getPartiesWithRole('mockRole' as PartyRole);
        policyDetails.getPartyById('mockId');
        expect(owner).toEqual(mockOwner);
        expect(allOwners).toEqual(mockAllOwners);
        expect(mockGetPartiesWithRole).toHaveBeenCalledWith('mockRole');
        expect(mockGetPartyById).toHaveBeenCalledWith('mockId');
    });

    it('should hand off to the features class', () => {
        policyDetails.getFeaturesByType('mockType' as any);
        expect(mockGetFeaturesByType).toHaveBeenCalledWith('mockType');
    });

    test.each(tpaMocks)(
        'determines whether the policy is thirdPartyAdministered when the ID is %s',
        (_, { value, result }) => {
            const mock = Object.assign(
                {},
                { ...mockPolicy, thirdPartyAdministratorId: value }
            );
            const mockedPolicy = new PolicyDetails(mock);
            expect(mockedPolicy.isTPA).toBe(result);
        }
    );
});
