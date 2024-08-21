import { ProductType } from '@zinnia/api-types/types/sor';
import { BannerAlert, BannerVariant, Label } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { HoldingFunds } from '@/components/funds-table/HoldingFunds';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicyFundDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';

import styles from './Funds.module.css';

const pageTitle = getPageTitle(RouteKey.FUNDS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

// const policyProductType = ProductType.UNIVERSALLIFE;
const policyProductType = ProductType.INDEXEDUNIVERSALLIFE;

export default async function AccountValuePage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const { data, error } = await getPolicyFundDetails({
    planCode,
    policyNumber,
  });

  const allocationData = () => {
    if (error || !data) {
      return <NoDataAvailable />;
    }

    return data.map(allocation => {
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
            <p className="typography-content-body-sm">{`${allocation.allocationPercentage ?? 0}%`}</p>
          </div>
        </div>
      );
    });
  };

  // return (
  //   <div className="container">
  // <div className={`${styles.container} card`}>
  //   <AccountValue
  //     planCode={planCode}
  //     policyNumber={policyNumber}
  //     className={clsx({ 'pb-2xl': data?.length })}
  //   />
  //   {allocationData()}
  // </div>
  // <CallForAssistance
  //   callToAction="Questions about your allocation?"
  //   customInstruction="for more information."
  // />
  //   </div>
  // );

  return (
    <div className="container">
      <div className={`${styles.container} card`}>
        <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          hideTicker
        />
      </div>
      {policyProductType === ProductType.INDEXEDUNIVERSALLIFE && (
        <>
          <div className={styles.sectionContainer}>
            <h2>{toTitleCase('holding funds')}</h2>
            <p className="typography-content-body-sm">
              Holding funds are where your premium dollars are first deposited.
              While there, all fees and charges (like your cost of of insurance)
              come out. Then, what remains is moved or “swept” into your elected
              funds on the sweep date.
            </p>
            <HoldingFunds />
          </div>

          <div className={styles.sectionContainer}>
            <h2>{toTitleCase('available funds')}</h2>
            <BannerAlert
              variant={BannerVariant.Information}
              bodyText="Editing allocations is coming soon. For now, call 1-855-290-0529 to make changes."
            />
            <div>
              <p className="typography-content-body-sm">
                The following funds are available for your policy.{' '}
              </p>
              <p
                className={`typography-content-body-sm ${styles.currentlyElectedLabel}`}
              >
                Currently elected funds
              </p>
            </div>
            <NonHoldingFunds />
          </div>
        </>
      )}
      {/* {policyProductType === ProductType.UNIVERSALLIFE && (
        <>
          <NonHoldingFunds />
          <CallForAssistance
            callToAction="Questions about your allocation?"
            customInstruction="for more information."
          />
        </>
      )} */}
    </div>
  );
}
