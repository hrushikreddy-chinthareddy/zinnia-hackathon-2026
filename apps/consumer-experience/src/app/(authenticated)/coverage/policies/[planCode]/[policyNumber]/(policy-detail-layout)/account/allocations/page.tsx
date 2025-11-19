import { Metadata } from 'next';

import styles from '@/app/(authenticated)/coverage/shared-styles/Funds.module.css';
import { AccountValue } from '@/components/account-value/AccountValue';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { OutstandingLoanValue } from '@/components/outstanding-loan-value/OutstandingLoanValue';
import accountValueStyles from '@/components/policy-overview/PolicyOverview.module.css';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicyDetails, getPolicyStatusDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { logTrace } from '@/utils/logging/log-fns';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { ProductType } from '@zinnia/api-types/types/sor';

import { IULFundsView } from './IULFundsView';
import { ULFundsView } from './ULFundsView';

const pageTitle = getPageTitle(RouteKey.ALLOCATIONS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

// file path used for logging, determined on the module url
const currentFilePath = new URL(import.meta.url).pathname;

export default async function FundsPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const commonLog = await buildCommonLogContext();

  logTrace('Page::policies::FundsPage', {
    ...commonLog,
    file: currentFilePath,
    function: 'FundsPage',
  });

  const { data, error } = await getPolicyDetails(
    {
      planCode,
      policyNumber,
    },
    commonLog
  );

  const { data: policyStatusDetails } = await getPolicyStatusDetails(
    {
      planCode,
      policyNumber,
    },
    commonLog
  );

  if (!data || error) {
    return <NoDataAvailable correlationId={error?.correlationId} />;
  }

  return (
    <div className="container">
      {data?.product?.productType === ProductType.UNIVERSALLIFE && (
        <p>
          <span>Your policy's value is held within an account.</span> As you pay
          premiums, we first deduct all fees and charges, then leftover premium
          dollars are deposited into your account, which typically earns an
          interest rate.
        </p>
      )}
      {data?.product?.productType === ProductType.INDEXEDUNIVERSALLIFE && (
        <p>
          <span>Your policy's value is held within one or more accounts.</span>{' '}
          As you pay premiums, we first deduct all fees and charges, then
          leftover premium dollars are deposited into the account(s) you select.
        </p>
      )}
      <div className={`${styles.detailsContainer} card`}>
        <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          hideTicker
          className={accountValueStyles.allocationsContainer}
        />
        <OutstandingLoanValue planCode={planCode} policyNumber={policyNumber} />
      </div>
      {data?.product?.productType === ProductType.UNIVERSALLIFE && (
        <ULFundsView
          planCode={planCode}
          policyNumber={policyNumber}
          initialPolicyStatus={policyStatusDetails}
        />
      )}

      {data?.product?.productType === ProductType.INDEXEDUNIVERSALLIFE && (
        <IULFundsView
          planCode={planCode}
          policyNumber={policyNumber}
          initialPolicyStatus={policyStatusDetails}
        />
      )}
    </div>
  );
}
