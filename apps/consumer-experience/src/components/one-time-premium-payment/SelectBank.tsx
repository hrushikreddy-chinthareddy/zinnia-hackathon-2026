import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  Icon,
  IconType,
  SideSheet,
} from '@zinnia/bloom/components';
import { ChangeEvent, useState } from 'react';

import premiumStyles from './OneTimePremiumPayment.module.css';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';
import { AccountNumber } from '../pii/AccountNumber';
import { AccountType } from '../pii/AccountType';
import { BankName } from '../pii/BankName';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

const bankDetails = [
  {
    bankId: 'Bank_1',
    appliesToPartyId: 'Party_PI_1',
    startDate: '2022-07-11',
    // endDate: null,
    nameOnAccount: 'John Smith',
    accountStatus: 'ACTIVEBANKACCOUNT',
    accountType: 'CHECKING',
    accountNumber: '0854301265',
    routingNumber: '267014589',
    // internationalBankAccountNumber: null,
    branchName: 'CITIZEN BANK',
    autopayEnabled: false,
  },
  {
    bankId: 'Bank_1',
    appliesToPartyId: 'Party_PI_1',
    startDate: '2022-07-11',
    // endDate: null,
    nameOnAccount: 'John Smith',
    accountStatus: 'ACTIVEBANKACCOUNT',
    accountType: 'CHECKING',
    accountNumber: '0854301265',
    routingNumber: '267014589',
    // internationalBankAccountNumber: null,
    branchName: 'CITI BANK',
    autopayEnabled: true,
  },
];

// const bankDetails = [];

export const SelectBank = ({
  moveToNextStep,
}: {
  moveToNextStep?: () => void;
}) => {
  const [selectedBank, setSelectedBank] = useState<number | null>(
    bankDetails?.findIndex(bank => bank.autopayEnabled)
  );

  const { data: featureFlagData } = useFeatureFlags();

  const onBankSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedBank(Number(e.target.value));
  };

  return (
    <div>
      {/* TODO: fix the design on this */}
      {!bankDetails ||
        (bankDetails.length === 0 && (
          <NoDataAvailable
            iconType={IconType.BANK}
            message="Add a bank account to continue"
          />
        ))}

      {bankDetails?.length > 0 && (
        <div role="radiogroup" aria-label="select payment method">
          {bankDetails?.map((bankDetail, index) => {
            return (
              <label
                key={`${index}-${bankDetail.branchName}`}
                className={premiumStyles.bankContainer}
              >
                <BankName
                  bankName={bankDetail.branchName}
                  className="typography-labels-label-lg"
                />
                <div
                  className={`${premiumStyles.bankDetail} typography-content-caption`}
                >
                  <AccountType accountType={bankDetail.accountType} />{' '}
                  <span>account ending in</span>{' '}
                  <AccountNumber accountNumber={bankDetail.accountNumber} />
                </div>

                {bankDetail.autopayEnabled && (
                  <AssistiveText
                    variant={AssistiveTextVariant.Success}
                    text="Premium autopay"
                  />
                )}
                <input
                  style={{ position: 'absolute', opacity: 0 }}
                  type="radio"
                  role="radio"
                  name="bank"
                  id={`${index}-${bankDetail.branchName}`}
                  value={index}
                  onChange={onBankSelect}
                  defaultChecked={bankDetail.autopayEnabled}
                />
              </label>
            );
          })}
        </div>
      )}
      {featureFlagData?.[FEATURE_FLAGS.ADD_EDIT_DELETE_BANK_ACCOUNT] && (
        <SideSheet
          header="Add new bank"
          trigger={
            <Button size="small" mode="link">
              {/**
               * TODO: use the new ADD icon when its available
               */}
              <Icon width={16} height={16} type={IconType.ALERT} /> Add another
              bank account
            </Button>
          }
        >
          {/**TODO: swap in the real component */}
          <div>Bank component imported here</div>
        </SideSheet>
      )}

      <div className={premiumStyles.buttonGroup}>
        <Button
          mode="primary"
          onClick={moveToNextStep}
          disabled={selectedBank === -1}
        >
          Continue
        </Button>
        {/* TODO: show 'are you sure path', this should actually be a link */}
        <Button mode="link">Cancel</Button>
      </div>
    </div>
  );
};
