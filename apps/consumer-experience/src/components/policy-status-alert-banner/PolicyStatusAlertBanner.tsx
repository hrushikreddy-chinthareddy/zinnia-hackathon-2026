'use client';

import {
  FeatureType,
  LineOfBusiness,
  PolicyStatus,
} from '@zinnia/api-types/types/sor';
import { BannerAlert, BannerVariant, IconType } from '@zinnia/bloom/components';
import { usePathname } from 'next/navigation';

import { Link } from '@/components/link/Link';
import { PolicyRequestInputs, PolicyStatusDetail } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { lineOfBusinessUrlPath } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';

import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';

interface PolicyStatusAlertBannerProps extends PolicyRequestInputs {
  lineOfBusiness?: LineOfBusiness;
  policyStatusData: Partial<PolicyStatusDetail | null>;
}

/**
 * The 'canShowFreelookBanner' prop is basically only used for the policy overview screen.
 * Subpages should not display it
 * @param param0
 * @returns
 */
export const PolicyStatusAlertBanner = ({
  policyStatusData,
  planCode,
  policyNumber,
  lineOfBusiness = LineOfBusiness.LIFE,
}: PolicyStatusAlertBannerProps) => {
  const pathName = usePathname();

  const showFreelookBannerPaths = new Set([
    `/coverage/policies/${planCode}/${policyNumber}`,
    `/coverage/annuities/${planCode}/${policyNumber}`,
  ]);

  const { policyStatus } = policyStatusData || {};
  const shouldHide =
    policyStatus === PolicyStatus.PENDINGLAPSE &&
    pathName.includes('/premium/');

  const canShowFreelookBanner = showFreelookBannerPaths.has(pathName);

  if (!policyStatusData || !policyStatus || shouldHide) {
    return null;
  }

  const lineOfBusinessUrl = lineOfBusinessUrlPath(lineOfBusiness);

  let statusContent;

  switch (policyStatus) {
    case PolicyStatus.PENDINGLAPSE:
      statusContent = {
        text: (
          <span className="typography-nav-links-sm-inline">
            Your policy is about to lapse, leaving you uninsured. Pay at least{' '}
            {formatUSDollars(policyStatusData.minimumPaymentDue)} by{' '}
            {standardDateMonthDayYear(policyStatusData.minimumPaymentDueDate)}{' '}
            to get back on track.{' '}
            <Link
              isInternal
              href={`/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/premium/amount`}
            >
              Click here
            </Link>{' '}
            to make a payment.
          </span>
        ),
        variant: BannerVariant.Warning,
      };
      break;

    case FeatureType.FREELOOK:
      if (canShowFreelookBanner) {
        statusContent = {
          text: (
            <span className="typography-nav-links-sm-inline">
              You’re still in the free look period, a {policyStatusData.period}
              -day window after policy issuance when you can cancel without
              penalty. If you'd like to cancel, call <CarrierPhoneNumber />.
            </span>
          ),
          variant: BannerVariant.Information,
          icon: IconType.ALERT,
        };
      } else {
        statusContent = null;
      }

      break;
    default:
      statusContent = null;
  }

  if (!statusContent) {
    return null;
  }

  return (
    <BannerAlert
      className="mb-lg"
      bodyText={statusContent.text}
      variant={statusContent.variant}
      icon={statusContent.icon}
    />
  );
};
