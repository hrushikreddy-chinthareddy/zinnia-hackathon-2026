'use client';
import { useQuery } from '@tanstack/react-query';
import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';
import { PolicyFeature } from '@zinnia/api-types/types/sor';
import { toTitleCase } from '@zinnia/utils';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { HoldingFunds } from '@/components/funds-table/HoldingFunds';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';
import { sortNonHoldingFunds } from '@/components/funds-table/utils';
import {
  getPolicyFunds,
  getPolicyStatusDetails,
} from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PolicyStatusDetail } from '@/types/policy';
import { convertKebabedDateString } from '@/utils/dates';

import styles from './Funds.module.css';

export const IULFundsView = ({
  planCode,
  policyNumber,
  initialPolicyStatus,
}: {
  planCode: string;
  policyNumber: string;
  initialPolicyStatus: Partial<PolicyStatusDetail> | null;
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

  const { data: freelookData } = useQuery({
    queryKey: [QueryKeys.POLICY_STATUS, planCode, policyNumber],
    queryFn: () => getPolicyStatusDetails(planCode, policyNumber),
    initialData: initialPolicyStatus,
    select: data => {
      return {
        isFreelook:
          data?.policyStatus === ('FREELOOK' as PolicyFeature.featureType),
        freelookDate: data?.endDate,
      };
    },
  });
  return (
    <>
      <div className={styles.sectionContainer}>
        <h2>{toTitleCase('holding accounts')}</h2>
        <p className="typography-content-body">
          Holding accounts are where your premium dollars are first deposited.
          While there, all fees and charges (like your cost of of insurance)
          come out. Then, what remains is moved or “swept” into the account(s)
          you've selected on the sweep date.
        </p>
        <HoldingFunds funds={funds?.holding} isLoading={isLoading} />
      </div>

      <div className={styles.sectionContainer}>
        <h2>{toTitleCase('Account options')}</h2>
        <CallForAssistance
          callToAction={
            freelookData?.isFreelook
              ? `You can't edit allocations until your free look period ends on ${convertKebabedDateString(freelookData.freelookDate)}. Questions?`
              : 'Editing fund allocations is coming soon. For now, '
          }
          contactPrompt={freelookData?.isFreelook ? undefined : 'call'}
          customInstruction="."
        />

        <div>
          <p className="typography-content-body">
            The following accounts are available for your policy.{' '}
          </p>
          <p
            className={`typography-content-body ${styles.currentlyElectedLabel}`}
          >
            Currently selected accounts. The percentage reflects how money from
            the holding account is divided into selected accounts upon sweep.
          </p>
        </div>
        <NonHoldingFunds funds={funds?.nonHolding} isLoading={isLoading} />
      </div>
    </>
  );
};
