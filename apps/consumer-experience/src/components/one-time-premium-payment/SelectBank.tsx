import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  IconType,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';

import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { MOCK_EMPTY_BANK_DETAILS } from '@/utils/serverClientUtils';

import premiumStyles from './OneTimePremiumPayment.module.css';
import { AddEditBankSidesheet } from '../add-edit-bank/AddEditBankSidesheet';
import { FormMode } from '../add-edit-bank/shared-types';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';
import noDataStyles from '../no-data-available/NoDataAvailable.module.css';
import { AccountNumber } from '../pii/AccountNumber';
import { AccountType } from '../pii/AccountType';
import { BankName } from '../pii/BankName';
import { CancelDialogLink } from '../transactions/CancelDialogLink';

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
  planCode,
  policyNumber,
}: {
  moveToNextStep?: () => void;
  planCode: string;
  policyNumber: string;
}) => {
  const router = useRouter();
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
              <p className="typography-content-body">
                Looks like you haven't added any banking information yet.
              </p>
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
        <AddEditBankSidesheet mode={FormMode.ADD} />
      )}

      <div className={premiumStyles.buttonGroup}>
        <Button
          mode="primary"
          onClick={moveToNextStep}
          disabled={selectedBank === -1}
        >
          Continue
        </Button>
        <CancelDialogLink
          planCode={planCode}
          policyNumber={policyNumber}
          router={router}
        />
      </div>
    </div>
  );
};
