'use client';

import { PolicyStatus } from '@zinnia/api-types/types/sor';
import { BannerAlert, BannerVariant } from '@zinnia/bloom/internal/components';
import { useParams } from 'next/navigation';

export const PolicyStatusAlertBanner = () => {
  const params = useParams<{ planCode: string; policyNumber: string }>();
  const { planCode, policyNumber } = params;
  // TODO: only show if policyStatus has banner
  // get banner details

  if (!planCode || !policyNumber) {
    return null;
  }

  const getStatus = () => {
    return {
      text: 'Your policy is about to lapse, leaving you uninsured. Pay at least $XXX.XX by X/X/XXXX to get back on track. Call 1-800-232-2222 to make a payment.',
      variant: BannerVariant.Warning,
    };
  };

  const statusContent = getStatus();
  return (
    <BannerAlert
      bodyText={statusContent.text}
      variant={statusContent.variant}
    />
  );
};
