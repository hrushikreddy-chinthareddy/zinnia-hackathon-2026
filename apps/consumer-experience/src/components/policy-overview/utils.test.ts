import {
  FeatureType,
  PolicyFeature,
  PolicyStatus,
  ProductType,
} from '@xd/api-types/dist/generated-types/sor';

import { upcomingPaymentDetails } from './utils';

describe('upcomingPaymentDetails', () => {
  describe('when policy status is PENDINGLAPSE', () => {
    it('should return correct details with amount from pendingLapseDueDetails', () => {
      const pendingLapseDate = '2023-12-31';
      const pendingLapseAmount = 500;

      const result = upcomingPaymentDetails({
        policyStatus: PolicyStatus.PENDINGLAPSE,
        policyFeatures: [
          {
            featureType: FeatureType.LAPSEASSESSMENT,
            totalMinimumRequiredAmount: pendingLapseAmount,
            endDate: pendingLapseDate,
          } as PolicyFeature,
        ],
        upcomingPaymentValid: true, // Should be ignored in PENDINGLAPSE state
        upcomingPaymentAmount: 200, // Should be ignored in PENDINGLAPSE state
        nextActivityDate: '2023-11-15',
        productType: ProductType.TERM,
      });

      expect(result).toEqual({
        amount: pendingLapseAmount,
        label: 'Premium due',
        caption: `Due by 12/31/2023`,
      });
    });

    it('should return undefined amount when no LAPSEASSESSMENT feature is found', () => {
      const result = upcomingPaymentDetails({
        policyStatus: PolicyStatus.PENDINGLAPSE,
        policyFeatures: [
          {
            featureType: FeatureType.BILLING, // Not LAPSEASSESSMENT
            totalMinimumRequiredAmount: 500,
            endDate: '2023-12-31',
          } as PolicyFeature,
        ],
        nextActivityDate: '2023-11-15',
      });

      expect(result).toEqual({
        amount: undefined,
        label: 'Premium due',
        caption: undefined,
      });
    });

    it('should handle null or undefined policyFeatures', () => {
      const result = upcomingPaymentDetails({
        policyStatus: PolicyStatus.PENDINGLAPSE,
        policyFeatures: null,
        nextActivityDate: '2023-11-15',
      });

      expect(result).toEqual({
        amount: undefined,
        label: 'Premium due',
        caption: undefined,
      });
    });
  });

  describe('when upcomingPaymentValid is true', () => {
    it('should return scheduled premium details with autopay date', () => {
      const nextActivityDate = '2023-11-15';
      const upcomingPaymentAmount = 300;

      const result = upcomingPaymentDetails({
        policyStatus: PolicyStatus.ACTIVE,
        upcomingPaymentValid: true,
        upcomingPaymentAmount,
        nextActivityDate,
      });

      expect(result).toEqual({
        amount: upcomingPaymentAmount,
        label: 'Scheduled premium',
        caption: `Autopay on 11/15/2023`,
      });
    });
  });

  describe('when upcomingPaymentValid is false', () => {
    describe('and productType is TERM', () => {
      it('should return premium due details from billing feature', () => {
        const billingDate = '2023-12-01';
        const billingAmount = 250;

        const result = upcomingPaymentDetails({
          policyStatus: PolicyStatus.ACTIVE,
          upcomingPaymentValid: false,
          productType: ProductType.TERM,
          policyFeatures: [
            {
              featureType: FeatureType.BILLING,
              paymentAmount: billingAmount,
              effectiveDate: billingDate,
            } as PolicyFeature,
          ],
          nextActivityDate: '2023-11-15',
        });

        expect(result).toEqual({
          amount: billingAmount,
          label: 'Premium due',
          caption: `Due by 12/1/2023`,
        });
      });

      it('should handle missing billing feature', () => {
        const result = upcomingPaymentDetails({
          policyStatus: PolicyStatus.ACTIVE,
          upcomingPaymentValid: false,
          productType: ProductType.TERM,
          policyFeatures: [
            {
              featureType: FeatureType.LAPSEASSESSMENT, // Not BILLING
            } as PolicyFeature,
          ],
          nextActivityDate: '2023-11-15',
        });

        expect(result).toEqual({
          amount: undefined,
          label: 'Premium due',
          caption: undefined,
        });
      });
    });

    describe('and productType is not TERM', () => {
      it('should return zero amount with default labels', () => {
        const result = upcomingPaymentDetails({
          policyStatus: PolicyStatus.ACTIVE,
          upcomingPaymentValid: false,
          // undefined or any non-TERM value should fall into else branch and set amount to 0
          productType: undefined,
          nextActivityDate: '2023-11-15',
        });

        expect(result).toEqual({
          amount: 0,
          label: 'Premium due',
          caption: undefined,
        });
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined productType when upcomingPaymentValid is false', () => {
      const result = upcomingPaymentDetails({
        policyStatus: PolicyStatus.ACTIVE,
        upcomingPaymentValid: false,
        nextActivityDate: '2023-11-15',
      });

      expect(result).toEqual({
        amount: 0,
        label: 'Premium due',
        caption: undefined,
      });
    });

    it('should handle undefined upcomingPaymentAmount when upcomingPaymentValid is true', () => {
      const nextActivityDate = '2023-11-15';

      const result = upcomingPaymentDetails({
        policyStatus: PolicyStatus.ACTIVE,
        upcomingPaymentValid: true,
        nextActivityDate,
      });

      expect(result).toEqual({
        amount: undefined,
        label: 'Scheduled premium',
        caption: `Autopay on 11/15/2023`,
      });
    });
  });
});
