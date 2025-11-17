'use client';

import { useQuery } from '@tanstack/react-query';
import { DEFAULT_DATE_FORMAT } from '@zinnia/xd-utils';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

import { ComparisonTable } from '@/components/comparison-table/ComparisonTable';
import { Name } from '@/components/pii/Name';
import commonStyles from '@/components/stepped-workflow/common/Styles.module.css';
import { useUser } from '@/hooks/use-user';
import { getPaymentMethods } from '@/queries/payment-queries';
import { getPolicyParties } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { formatUSDollars } from '@/utils/currency';

import { BankDisplay } from './BankDisplay';
import { SummaryDisplay } from './SummaryDisplay';
import { SystematicPremiumSteps } from '../../provider/types';
import { useSystematicPremiums } from '../../provider/useSystematicPremiums';
import { stepsInfo } from '../../steps';
import { paymentFrequencyDisplay } from '../../utils';

export const SummaryTable = ({
  policyNumber,
  planCode,
}: {
  policyNumber: string;
  planCode: string;
}) => {
  const router = useRouter();
  const { state } = useSystematicPremiums();
  const { user } = useUser();
  const currentUserPartyId = user?.partyId;

  // TODO: hold up page render for this loading?
  const { data: paymentMethods = [] } = useQuery({
    queryKey: [QueryKeys.PAYMENT_METHODS, policyNumber, planCode],
    queryFn: () => getPaymentMethods(policyNumber, planCode),
  });

  const { data: policyParties = [] } = useQuery({
    queryKey: [QueryKeys.POLICY_PARTIES, policyNumber, planCode],
    queryFn: () => getPolicyParties({ policyNumber, planCode }),
  });

  const handleEdit = (step: SystematicPremiumSteps) => {
    const url = stepsInfo[step].url;
    router.push(url);
  };

  const hasCurrentSystematicPremium = !!state.currentSystematicPremium;
  const currentSystematicPremium = state.currentSystematicPremium;
  // TODO: currently the bankId on payor is null for farmers and possibly for
  // other carriers, check to make sure paymentMethods data is populating
  // systematic programs in policy
  const currentPremiumPaymentMethod =
    paymentMethods.find(
      paymentMethod =>
        paymentMethod.bankId === currentSystematicPremium?.party?.[0]?.bankId
    ) || {};

  const currentPayor = policyParties.find(party => {
    // For now this object only has one payor in it since we only allow a single payor
    // for transaction, but this may need to change in the future
    return party.partyId === currentSystematicPremium?.parties?.[0]?.partyId;
  });

  const newPayor = policyParties.find(party => {
    return party.partyId === currentUserPartyId;
  });

  const comparisonTableData = {
    amount: {
      label: 'Amount',
      onEdit: () => handleEdit(SystematicPremiumSteps.AMOUNT),
      newValue: (
        <span>
          {formatUSDollars(state.systematicPremiumAmountStep.paymentAmount)}
        </span>
      ),
      currentValue: hasCurrentSystematicPremium && (
        <span>{formatUSDollars(currentSystematicPremium?.amount)}</span>
      ),
      isNew:
        hasCurrentSystematicPremium &&
        state.systematicPremiumAmountStep.paymentAmount !==
          currentSystematicPremium?.amount,
    },
    frequency: {
      label: 'Frequency',
      onEdit: () => handleEdit(SystematicPremiumSteps.AMOUNT),
      newValue: (
        <span>
          {paymentFrequencyDisplay(
            state.systematicPremiumAmountStep.paymentFrequency
          )}
        </span>
      ),
      currentValue: hasCurrentSystematicPremium && (
        <span>
          {paymentFrequencyDisplay(currentSystematicPremium?.frequency)}
        </span>
      ),
      isNew:
        hasCurrentSystematicPremium &&
        state.systematicPremiumAmountStep.paymentFrequency !==
          currentSystematicPremium?.frequency,
    },
    nextPaymentDate: {
      label: 'Next payment date',
      onEdit: () => handleEdit(SystematicPremiumSteps.AMOUNT),
      newValue: (
        <span>
          {dayjs(state.systematicPremiumAmountStep.nextPaymentDate).format(
            DEFAULT_DATE_FORMAT
          )}
        </span>
      ),
      currentValue: hasCurrentSystematicPremium && (
        <span>
          {dayjs(currentSystematicPremium?.nextProgramDate).format(
            DEFAULT_DATE_FORMAT
          )}
        </span>
      ),
      isNew:
        hasCurrentSystematicPremium &&
        state.systematicPremiumAmountStep.nextPaymentDate !==
          currentSystematicPremium?.nextPaymentDate,
    },
    // We use parties from the policy and current logged in user partyId
    // to display these values rather than the nameOnAccount value that is on
    // the payment method because there isn't a gaurantee that the payment method
    // belongs to the current logged in user. The payor of a transaction is the person logged
    // in and making the payment. The payment method could be owned by anyone
    payor: {
      label: 'Payor',
      onEdit: () => handleEdit(SystematicPremiumSteps.BANK),
      newValue: (
        <span>
          <Name displayName={newPayor?.firstName} />{' '}
          <Name displayName={newPayor?.lastName} />
        </span>
      ),
      currentValue: hasCurrentSystematicPremium && (
        <span>
          <Name displayName={currentPayor?.firstName} />{' '}
          <Name displayName={currentPayor?.lastName} />
        </span>
      ),
      isNew:
        hasCurrentSystematicPremium &&
        state.selectBankStep.appliesToPartyId !==
          currentPremiumPaymentMethod?.appliesToPartyId,
    },
    bankingDetails: {
      label: 'Banking details',
      onEdit: () => handleEdit(SystematicPremiumSteps.BANK),
      newValue: <BankDisplay paymentMethod={state.selectBankStep} />,
      currentValue: hasCurrentSystematicPremium && (
        <BankDisplay paymentMethod={currentPremiumPaymentMethod} />
      ),
      isNew:
        hasCurrentSystematicPremium &&
        currentPremiumPaymentMethod?.bankId !== state.selectBankStep.bankId,
    },
  };

  return (
    <>
      <div className={clsx(commonStyles.paymentSummaryDetails)}>
        <ComparisonTable
          newValueHeader="New autopay details"
          currentValueHeader={state.currentSystematicPremium && 'Current'}
          data={comparisonTableData}
        />
        {/* TODO: hiding this for now because there is no call to populate the one time payment data
        there is also a component called FrequencyAlert...once we have information about this value,
        we should use that */}
        {/* {tableValues?.currentValues?.frequency &&
          tableValues.currentValues.frequency !==
            tableValues.newValues.frequency && (
            <BannerAlert
              icon={IconType.ALERT}
              variant={BannerVariant.Information}
              bodyText={`Changing your payment frequency updates your premium amount and next payment date.
              A one-time payment of $X,XXX.XX will be processed to cover the until the new schedule takes effect.`}
            />
          )} */}
      </div>
      <div
        className={clsx(
          commonStyles.paymentSummaryDetails,
          commonStyles.mobile
        )}
      >
        <SummaryDisplay tableData={comparisonTableData} />
      </div>
    </>
  );
};
