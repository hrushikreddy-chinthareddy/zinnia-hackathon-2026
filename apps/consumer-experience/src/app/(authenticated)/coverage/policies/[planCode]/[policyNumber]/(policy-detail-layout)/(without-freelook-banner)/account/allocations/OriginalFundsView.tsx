import { PolicyFeature } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/components';
import clsx from 'clsx';

import styles from '@/app/(authenticated)/coverage/shared-styles/Funds.module.css';
import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { getPolicyFundDetails, getPolicyStatusDetails } from '@/services';
import { formatUSDollars } from '@/utils/currency';
import { convertKebabedDateString } from '@/utils/dates';

export const OriginalFundsView = async ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const { data, error } = await getPolicyFundDetails({
    planCode,
    policyNumber,
  });

  const { data: statusData } = await getPolicyStatusDetails({
    planCode,
    policyNumber,
  });
  const isFreelook =
    statusData?.policyStatus === ('FREELOOK' as PolicyFeature.featureType);

  const allocationData = () => {
    if (error || !data) {
      return <NoDataAvailable />;
    }

    return data?.map(allocation => {
      return (
        <div className={styles.item} key={allocation.fundName}>
          <div className="stacked-items">
            <Label>{allocation.fundName}</Label>
            <p className="typography-content-body-sm">
              {formatUSDollars(allocation.totalFundValue)}
            </p>
          </div>
          <div className="stacked-items">
            <Label>Allocation</Label>
            <p className="typography-content-body-sm">{`${allocation.allocationPercentage}%`}</p>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="container">
      <div className={`${styles.container} card`}>
        <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          className={clsx({ 'pb-2xl': data?.length })}
        />
        {allocationData()}
      </div>
      <CallForAssistance
        callToAction={
          isFreelook
            ? `You can't take edit allocations until your free look period ends on ${convertKebabedDateString(statusData.endDate)}. Questions?`
            : 'Editing allocations is coming soon. For now, '
        }
        contactPrompt={isFreelook ? undefined : 'call'}
        customInstruction="to make changes."
      />
    </div>
  );
};
