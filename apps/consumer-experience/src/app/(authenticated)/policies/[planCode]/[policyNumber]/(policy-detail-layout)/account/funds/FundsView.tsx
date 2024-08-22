'use client';

import { useQuery } from '@tanstack/react-query';
import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';
import { ProductType } from '@zinnia/api-types/types/sor';
import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { HoldingFunds } from '@/components/funds-table/HoldingFunds';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';
import { getPolicy, getPolicyFunds } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { Fund } from '@/services/funds';
import { PolicyRequestInputs } from '@/types/policy';

import styles from './Funds.module.css';

const sortNonHoldingFunds = (funds: Fund[] | undefined) => {
  if (!funds) {
    return [];
  }

  return [...funds].sort((a, b) => {
    // elected funds first
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    const isAElected = a.isElected;
    const isBElected = b.isElected;
    if (isAElected && !isBElected) return -1;
    if (!isAElected && isBElected) return 1;
    // elected funds sorted by allocation percentage
    if (isAElected && isBElected) {
      return (b.allocationPercentage ?? 0) - (a.allocationPercentage ?? 0);
    }
    // the rest sorted alphabetically
    return (a.fundName || '').localeCompare(b.fundName || '');
  });
};

export const FundsView = ({ planCode, policyNumber }: PolicyRequestInputs) => {
  const { data: policyProductType } = useQuery({
    queryKey: [QueryKeys.POLICY],
    // TODO: what should this be?
    // initialData: [],
    queryFn: () => getPolicy(planCode, policyNumber),
    select: data => data?.product?.productType,
  });

  // TODO: could i put this in the component, would it cache all of the funds calculation?
  const { data: fundsData } = useQuery({
    queryKey: [QueryKeys.POLICY_FUNDS],
    // TODO: what should this be?
    // initialData: [],
    queryFn: () => getPolicyFunds(planCode, policyNumber),
    select: data => {
      const holding = data?.filter(
        fund => fund.fundAccountType === FundAccountTypeEnum.HOLDING
      );
      const nonHolding = data?.filter(
        fund => fund.fundAccountType !== FundAccountTypeEnum.HOLDING
      );

      return {
        holding,
        nonHolding: sortNonHoldingFunds(nonHolding),
      };
    },
  });

  return (
    <div className="container">
      <div className={`${styles.container} card`}>
        {/* TODO: convert to client!!! */}
        {/* <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          hideTicker
        /> */}
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
            <HoldingFunds funds={fundsData?.holding} />
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
            <NonHoldingFunds funds={fundsData?.nonHolding} />
          </div>
        </>
      )}
      {policyProductType === ProductType.UNIVERSALLIFE && (
        <>
          <NonHoldingFunds funds={fundsData?.nonHolding} />
          <CallForAssistance
            callToAction="Questions about your allocation?"
            customInstruction="for more information."
          />
        </>
      )}
    </div>
  );
};
