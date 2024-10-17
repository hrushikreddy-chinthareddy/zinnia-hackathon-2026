'use client';

import {
  LineOfBusiness,
  PolicyFeature,
  PolicyStatus,
} from '@zinnia/api-types/types/sor';
import { BannerAlert, BannerVariant, IconType } from '@zinnia/bloom/components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PolicyRequestInputs, PolicyStatusDetail } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import {
  EVERLY_CONTACT_PHONE_NUMBER,
  lineOfBusinessUrlPath,
} from '@/utils/data';
import {
  convertKebabedDateString,
  standardDateMonthDayYear,
} from '@/utils/dates';

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

    case 'FREELOOK' as PolicyFeature.featureType:
      if (canShowFreelookBanner) {
        statusContent = {
          text: (
            <span className="typography-nav-links-sm-inline">
              You're still in the free look period. That means you can cancel
              this policy without penalty anytime before{' '}
              {convertKebabedDateString(policyStatusData.endDate)}. If you'd
              like to cancel, call{' '}
              <a href={`tel:+${EVERLY_CONTACT_PHONE_NUMBER}`}>
                {EVERLY_CONTACT_PHONE_NUMBER}
              </a>
              .
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
