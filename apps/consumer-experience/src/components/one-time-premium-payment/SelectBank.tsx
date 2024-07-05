import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  IconType,
} from '@zinnia/bloom/components';

import premiumStyles from './OneTimePremiumPayment.module.css';
import { BankName } from '../pii/BankName';
import { AccountNumber } from '../pii/AccountNumber';
import { AccountType } from '../pii/AccountType';
import { ChangeEvent, useMemo, useState } from 'react';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';

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

  const onBankSelect = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
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
