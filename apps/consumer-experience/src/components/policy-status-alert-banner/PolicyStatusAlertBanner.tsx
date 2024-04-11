import { PolicyStatus } from '@zinnia/api-types/types/sor';
import { BannerAlert, BannerVariant } from '@zinnia/bloom/internal/components';

import { getPolicyStatusDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { standardDateMonthYear } from '@/utils/dates';

export const PolicyStatusAlertBanner = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  // TODO: just pass in params from layout

  if (!planCode || !policyNumber) {
    return null;
  }

  const { data } = await getPolicyStatusDetails({ planCode, policyNumber });

  let statusContent;

  switch (data?.policyStatus) {
    case PolicyStatus.PENDINGLAPSE:
      statusContent = {
        text: `Your policy is about to lapse, leaving you uninsured. Pay at least ${formatUSDollars(data.minimumPaymentDue)} by ${standardDateMonthYear(data.minimumPaymentDueDate)} to get back on track. Call 1-800-232-2222 to make a payment.`,
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
