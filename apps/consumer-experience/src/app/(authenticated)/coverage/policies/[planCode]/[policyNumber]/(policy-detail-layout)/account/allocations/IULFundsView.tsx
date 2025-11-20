'use client';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@zinnia/bloom/components';

import styles from '@/app/(authenticated)/coverage/shared-styles/Funds.module.css';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClientOnly } from '@/components/client-only/ClientOnly';
import { HoldingFunds } from '@/components/funds-table/HoldingFunds';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';
import { sortNonHoldingFunds } from '@/components/funds-table/utils';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import {
  getPolicyFunds,
  getPolicyStatusDetails,
} from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PolicyStatusDetail } from '@/types/policy';
import { toTitleCase } from '@/utils/strings';
import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';
import { FeatureType, LineOfBusiness } from '@zinnia/api-types/types/sor';

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
        fund => fund.fundAccountType !== FundAccountTypeEnum.HOLDING
      );
      const holding = data?.filter(
        fund => fund.fundAccountType === FundAccountTypeEnum.HOLDING
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
        isFreelook: data?.policyStatus === FeatureType.FREELOOK,
        freelookDate: data?.endDate,
      };
    },
  });
  return (
    <>
      <div className={styles.sectionContainer}>
        <Label
          interactiveElements={[
            <LabelPopover key={'holding-accounts'} title={'Holding Accounts'}>
              <p>
                Holding accounts are where your premium dollars are first
                deposited. While there, all fees and charges (like your cost of
                of insurance) come out. Then, what remains is moved or “swept”
                into the account(s) you've selected on the sweep date.
              </p>
            </LabelPopover>,
          ]}
        >
          <h2>{toTitleCase('holding accounts')}</h2>
        </Label>

        <ClientOnly>
          <HoldingFunds
            funds={funds?.holding}
            isLoading={isLoading}
            lineOfBusiness={LineOfBusiness.LIFE}
          />
        </ClientOnly>
      </div>

      <div className={styles.sectionContainer}>
        <h2>{toTitleCase('Available accounts')}</h2>
        <CallForAssistance
          callToAction={
            freelookData?.isFreelook
              ? `You can't edit allocations until your free look period ends. Questions?`
              : 'Editing allocations is coming soon. For now, '
          }
          contactPrompt={freelookData?.isFreelook ? undefined : 'call'}
          customInstruction="to make changes."
        />

        <div>
          <p>The following accounts are available for your policy.</p>
        </div>
        <ClientOnly>
          <NonHoldingFunds funds={funds?.nonHolding} isLoading={isLoading} />
        </ClientOnly>
      </div>
    </>
  );
};
