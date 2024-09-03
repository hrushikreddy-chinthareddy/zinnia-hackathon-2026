import { PolicyFeature, PolicyStatus } from '@zinnia/api-types/types/sor';
import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';

import { getPolicyStatusDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';
import {
  convertKebabedDateString,
  standardDateMonthDayYear,
} from '@/utils/dates';

interface PolicyStatusAlertBannerProps extends PolicyRequestInputs {
  canShowFreelookBanner?: boolean;
}

/**
 * The 'canShowFreelookBanner' prop is basically only used for the policy overview screen.
 * Subpages should not display it
 * @param param0
 * @returns
 */
export const PolicyStatusAlertBanner = async ({
  planCode,
  policyNumber,
  canShowFreelookBanner,
}: PolicyStatusAlertBannerProps) => {
  if (!planCode || !policyNumber) {
    return null;
  }

  const { data } = await getPolicyStatusDetails({ planCode, policyNumber });

  let statusContent;

  switch (data?.policyStatus) {
    case PolicyStatus.PENDINGLAPSE:
      statusContent = {
        text: `Your policy is about to lapse, leaving you uninsured. Pay at least ${formatUSDollars(data.minimumPaymentDue)} by ${standardDateMonthDayYear(data.minimumPaymentDueDate)} to get back on track. Call ${EVERLY_CONTACT_PHONE_NUMBER} to make a payment.`,
        variant: BannerVariant.Warning,
      };
      break;

    case 'FREELOOK' as PolicyFeature.featureType:
      if (canShowFreelookBanner) {
        statusContent = {
          text: `You're still in the free look period. That means you can cancel this policy without penalty anytime before ${convertKebabedDateString(data.endDate)}. If you'd like to cancel, call ${EVERLY_CONTACT_PHONE_NUMBER}.`,
          variant: BannerVariant.Information,
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
    />
  );
};
