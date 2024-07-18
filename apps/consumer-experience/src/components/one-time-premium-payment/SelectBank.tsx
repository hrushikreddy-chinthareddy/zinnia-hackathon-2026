import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  Icon,
  IconType,
  SideSheet,
} from '@zinnia/bloom/components';
import { ChangeEvent, useState } from 'react';

import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { MOCK_EMPTY_BANK_DETAILS } from '@/utils/serverClientUtils';

import premiumStyles from './OneTimePremiumPayment.module.css';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';
import noDataStyles from '../no-data-available/NoDataAvailable.module.css';
import { AccountNumber } from '../pii/AccountNumber';
import { AccountType } from '../pii/AccountType';
import { BankName } from '../pii/BankName';

const getBankDetails = () => {
  const queryParams = new URLSearchParams(window.location.search);

  if (queryParams.get(MOCK_EMPTY_BANK_DETAILS)) {
    return [];
  }

  return [
  {
      bankId: 'Bank_1',
      appliesToPartyId: 'Party_PI_1',
      startDate: '2022-07-11',
      nameOnAccount: 'John Smith',
      accountStatus: 'ACTIVEBANKACCOUNT',
      accountType: 'CHECKING',
      accountNumber: '0854301265',
      routingNumber: '267014589',
      branchName: 'CITIZEN BANK',
      autopayEnabled: false,
    },
    {
      bankId: 'Bank_1',
      appliesToPartyId: 'Party_PI_1',
      startDate: '2022-07-11',
      nameOnAccount: 'John Smith',
      accountStatus: 'ACTIVEBANKACCOUNT',
      accountType: 'CHECKING',
      accountNumber: '0854301265',
      routingNumber: '267014589',
      branchName: 'CITI BANK',
      autopayEnabled: true,
    },
  ];
};

export const SelectBank = ({
  moveToNextStep,
}: {
  moveToNextStep?: () => void;
}) => {
  const bankDetails = getBankDetails();
  const [selectedBank, setSelectedBank] = useState<number | null>(
    bankDetails?.findIndex(bank => bank.autopayEnabled)
  );

  const { data: featureFlagData } = useFeatureFlags();

  const onBankSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedBank(Number(e.target.value));
  };

  return (
    <div>
      {!bankDetails ||
        (bankDetails.length === 0 && (
          <div className={noDataStyles.noBankDetails}>
            <NoDataAvailable iconType={IconType.BANK}>
              <p className="typography-content-body">Looks like you haven't added any banking information yet.</p>
            </NoDataAvailable>
          </div>
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
            <Button className={noDataStyles.noBankDetailsAddButton} mode="link" size="small">
              <Icon
                small
                type={IconType.ADD}
              />
              <span>Add another bank account</span>
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
