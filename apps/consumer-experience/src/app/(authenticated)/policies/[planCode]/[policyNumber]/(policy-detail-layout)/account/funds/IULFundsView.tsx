'use client';
import { useQuery } from '@tanstack/react-query';
import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';
import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';

import { HoldingFunds } from '@/components/funds-table/HoldingFunds';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';
import { sortNonHoldingFunds } from '@/components/funds-table/utils';
import { getPolicyFunds } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';

import styles from './Funds.module.css';

export const IULFundsView = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const { data: funds, isLoading } = useQuery({
    queryKey: [QueryKeys.POLICY_FUNDS, planCode, policyNumber],
    queryFn: () => getPolicyFunds(planCode, policyNumber),
    select: data => {
      const nonHolding = data?.filter(
        fund =>
          fund.fundAccountType &&
          fund.fundAccountType !== FundAccountTypeEnum.HOLDING
      );
      const holding = data?.filter(
        fund =>
          fund.fundAccountType &&
          fund.fundAccountType === FundAccountTypeEnum.HOLDING
      );

      return { nonHolding: sortNonHoldingFunds(nonHolding), holding };
    },
  });

  return (
    <>
      <div className={styles.sectionContainer}>
        <h2>{toTitleCase('holding funds')}</h2>
        <p className="typography-content-body-sm">
          Holding funds are where your premium dollars are first deposited.
          While there, all fees and charges (like your cost of of insurance)
          come out. Then, what remains is moved or “swept” into your elected
          funds on the sweep date.
        </p>
        <HoldingFunds funds={funds?.holding} isLoading={isLoading} />
      </div>

      <div className={styles.sectionContainer}>
        <h2>{toTitleCase('available funds')}</h2>
        <BannerAlert
          variant={BannerVariant.Information}
          bodyText={
            <p>
              Editing allocations is coming soon. For now, call{' '}
              <a href={`tel:${EVERLY_CONTACT_PHONE_NUMBER}`}>
                {EVERLY_CONTACT_PHONE_NUMBER}
              </a>{' '}
              to make changes.
            </p>
          }
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
        <NonHoldingFunds funds={funds?.nonHolding} isLoading={isLoading} />
      </div>
    </>
  );
};
