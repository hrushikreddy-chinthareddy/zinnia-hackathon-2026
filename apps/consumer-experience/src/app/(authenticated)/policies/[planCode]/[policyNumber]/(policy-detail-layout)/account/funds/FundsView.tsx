'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductType } from '@zinnia/api-types/types/sor';
import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { HoldingFunds } from '@/components/funds-table/HoldingFunds';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';
import { getPolicy } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PolicyRequestInputs } from '@/types/policy';

import styles from './Funds.module.css';

export const FundsView = ({ planCode, policyNumber }: PolicyRequestInputs) => {
  // TODO: just kidding, don't do this because PII
  const { data: policyProductType } = useQuery({
    queryKey: [QueryKeys.POLICY],
    // TODO: what should this be?
    // initialData: [],
    queryFn: () => getPolicy(planCode, policyNumber),
    select: data => data?.product?.productType,
  });

  return (
    <div className="container">
      <div className={`${styles.container} card`}>
        {/* TODO: convert to client!!! */}
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
            <HoldingFunds planCode={planCode} policyNumber={policyNumber} />
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
            <NonHoldingFunds policyNumber={policyNumber} planCode={planCode} />
          </div>
        </>
      )}
      {policyProductType === ProductType.UNIVERSALLIFE && (
        <>
          <NonHoldingFunds policyNumber={policyNumber} planCode={planCode} />
          <CallForAssistance
            callToAction="Questions about your allocation?"
            customInstruction="for more information."
          />
        </>
      )}
    </div>
  );
};
