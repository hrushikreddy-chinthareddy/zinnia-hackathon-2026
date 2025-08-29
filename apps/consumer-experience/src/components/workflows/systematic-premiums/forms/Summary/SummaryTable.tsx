'use client';

import { ComparisonTable } from '@xd-components/components/ComparisonTable/ComparisonTable';
import {
  BannerAlert,
  BannerVariant,
  IconType,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

import { Payee } from '@/components/pii/Payee';
import { SystematicPremiumSteps } from '@/components/providers/systematic-premiums/types';
import commonStyles from '@/components/stepped-workflow/common/Styles.module.css';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { getPartyName } from '@/utils/policy';

import { BankDisplay } from './BankDisplay';
import { SummaryDisplay } from './SummaryDisplay';
import { getFrequencyText } from './SummaryForm.helpers';
import { TableValues } from './SummaryForm.types';
import { stepsInfo } from '../../steps';

export const SummaryTable = ({
  tableValues,
}: {
  tableValues?: TableValues;
}) => {
  const router = useRouter();
  const handleEdit = (step: SystematicPremiumSteps) => {
    const url = stepsInfo[step].url;
    router.push(url);
  };

  if (!tableValues) {
    return <PaymentLoading />;
  }

  const comparisonTableData = {
    amount: {
      label: 'Amount',
      onEdit: () => handleEdit(SystematicPremiumSteps.AMOUNT),
      newValue: (
        <span className="typography-content-body-sm">
          {tableValues.newValues.amount}
        </span>
      ),
      currentValue: tableValues?.currentValues?.amount && (
        <span className="typography-content-body-sm">
          {tableValues.currentValues.amount}
        </span>
      ),
      isNew:
        tableValues.currentValues &&
        tableValues.newValues.amount !== tableValues?.currentValues?.amount,
    },
    frequency: {
      label: 'Frequency',
      onEdit: () => handleEdit(SystematicPremiumSteps.AMOUNT),
      newValue: (
        <span className="typography-content-body-sm">
          {getFrequencyText(tableValues.newValues.frequency)}
        </span>
      ),
      currentValue: tableValues?.currentValues?.frequency && (
        <span className="typography-content-body-sm">
          {getFrequencyText(tableValues.currentValues.frequency)}
        </span>
      ),
      isNew:
        tableValues.currentValues &&
        tableValues.newValues.frequency !==
        tableValues?.currentValues?.frequency,
    },
    nextPaymentDate: {
      label: 'Next payment date',
      onEdit: () => handleEdit(SystematicPremiumSteps.AMOUNT),
      newValue: (
        <span className="typography-content-body-sm">
          {tableValues.newValues.nextPaymentDate}
        </span>
      ),
      currentValue: tableValues?.currentValues?.nextPaymentDate && (
        <span className="typography-content-body-sm">
          {tableValues.currentValues.nextPaymentDate}
        </span>
      ),
      isNew:
        tableValues.currentValues &&
        tableValues.newValues.nextPaymentDate !==
        tableValues?.currentValues?.nextPaymentDate,
    },
    payor: {
      label: 'Payor',
      onEdit: () => handleEdit(SystematicPremiumSteps.BANK),
      newValue: (
        <Payee
          className="typography-content-body-sm"
          payee={getPartyName(tableValues.newValues.payor)}
        />
      ),
      currentValue: tableValues?.currentValues?.payor && (
        <Payee
          className="typography-content-body-sm"
          payee={getPartyName(tableValues.currentValues.payor)}
        />
      ),
      isNew:
        tableValues.currentValues &&
        tableValues.newValues.payor?.partyId !==
        tableValues?.currentValues?.payor?.partyId,
    },
    bankingDetails: {
      label: 'Banking details',
      onEdit: () => handleEdit(SystematicPremiumSteps.BANK),
      newValue: (
        <BankDisplay
          paymentMethod={tableValues.newValues.bank}
        />
      ),
      currentValue: tableValues?.currentValues?.bank && (
        <BankDisplay
          paymentMethod={tableValues.currentValues.bank}
        />
      ),
      isNew:
        tableValues.currentValues &&
        tableValues.currentValues?.bank?.bankId !==
        tableValues.newValues.bank?.bankId,
    },
  };

  return (
    <>
      <div className={clsx(commonStyles.paymentSummaryDetails)}>
        <ComparisonTable
          newValueHeader="New autopay details"
          currentValueHeader={tableValues.currentValues && 'Current'}
          data={comparisonTableData}
        />
        {tableValues?.currentValues?.frequency &&
          tableValues.currentValues.frequency !==
          tableValues.newValues.frequency && (
            <BannerAlert
              icon={IconType.ALERT}
              variant={BannerVariant.Information}
              bodyText={`Changing your payment frequency updates your premium amount and next payment date.
              A one-time payment of $X,XXX.XX will be processed to cover the until the new schedule takes effect.`}
            />
          )}
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

