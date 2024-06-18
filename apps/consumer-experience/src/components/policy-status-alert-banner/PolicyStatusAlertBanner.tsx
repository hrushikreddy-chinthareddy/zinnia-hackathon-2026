import { PolicyStatus } from '@zinnia/api-types/types/sor';
import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';

import { getPolicyStatusDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';

export const PolicyStatusAlertBanner = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
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
