'use client';
import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  IconType,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

import { BankDetail } from '@/components/person-data/types';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import premiumStyles from './OneTimePremiumPayment.module.css';
import { AddEditBankSidesheet } from '../add-edit-bank/AddEditBankSidesheet';
import { FormMode } from '../add-edit-bank/shared-types';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';
import noDataStyles from '../no-data-available/NoDataAvailable.module.css';
import { AccountNumber } from '../pii/AccountNumber';
import { AccountType } from '../pii/AccountType';
import { BankName } from '../pii/BankName';
import { useOttp } from '../providers/one-time-premium-payment/OttpContext';
import { OttpAction } from '../providers/one-time-premium-payment/types';
import { CancelDialogLink } from '../transactions/CancelDialogLink';

// const getBankDetails = (): BankDetail[] => {
//   // TODO: this was causing error without use client...how was this even working?
//   // const queryParams = new URLSearchParams(window.location.search);

//   // if (queryParams.get(MOCK_EMPTY_BANK_DETAILS)) {
//   //   return [];
//   // }

//   return [
//     {
//       bankId: 'Bank_0',
//       appliesToPartyId: 'Party_PI_1',
//       startDate: '2022-07-11',
//       nameOnAccount: 'John Smith',
//       accountStatus: 'ACTIVEBANKACCOUNT',
//       accountType: 'CHECKING',
//       accountNumber: '0854301265',
//       routingNumber: '267014589',
//       branchName: 'CITIZEN BANK',
//       autopayEnabled: false,
//     } as BankDetail,
//     {
//       bankId: 'Bank_1',
//       appliesToPartyId: 'Party_PI_1',
//       startDate: '2022-07-11',
//       nameOnAccount: 'John Smith',
//       accountStatus: 'ACTIVEBANKACCOUNT',
//       accountType: 'CHECKING',
//       accountNumber: '0854301666',
//       routingNumber: '267014589',
//       branchName: 'US BANK',
//       autopayEnabled: true,
//     } as BankDetail,
//   ];
// };

export const SelectBank = ({
  planCode,
  policyNumber,
  activeBanks,
}: {
  planCode: string;
  policyNumber: string;
  activeBanks: BankDetail[];
}) => {
  const { state, dispatch } = useOttp();
  const { payorBank: statePayorBank } = state;

  const { control, handleSubmit, getValues } = useForm<{
    payorBank: string;
  }>({
    defaultValues: {
      payorBank:
        statePayorBank?.bankId ||
        activeBanks.find(bank => bank.autopayEnabled)?.bankId,
    },
  });
  const router = useRouter();
  const { data: featureFlagData } = useFeatureFlags();

  const handleBankSubmit = () => {
    const selectedBank = activeBanks.find(
      ({ bankId }) => bankId === getValues('payorBank')
    );
    dispatch({
      type: OttpAction.SET_PAYOR_BANK,
      payload: selectedBank,
    });
    router.push(
      `/policies/${planCode}/${policyNumber}/premium-payment/summary`
    );
  };

  return (
    <form onSubmit={handleSubmit(handleBankSubmit)}>
      {!activeBanks ||
        (activeBanks.length === 0 && (
          <div className={noDataStyles.noBankDetails}>
            <NoDataAvailable iconType={IconType.BANK}>
              <p className="typography-content-body">
                Looks like you haven't added any banking information yet.
              </p>
            </NoDataAvailable>
          </div>
        ))}
      {activeBanks?.length > 0 && (
        <div role="radiogroup" aria-label="select payment method">
          {activeBanks?.map((bankDetail, index) => {
            return (
              <Controller
                key={`${index}-${bankDetail.branchName}`}
                name="payorBank"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
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
                      {...field}
                      style={{ position: 'absolute', opacity: 0 }}
                      type="radio"
                      role="radio"
                      name="bank"
                      id={`${index}-${bankDetail.branchName}`}
                      value={bankDetail.bankId}
                      defaultChecked={
                        statePayorBank?.bankId
                          ? statePayorBank?.bankId === bankDetail.bankId
                          : bankDetail.autopayEnabled
                      }
                    />
                  </label>
                )}
              />
            );
          })}
        </div>
      )}
      {/* TODO: Unhide this

      {featureFlagData?.[FEATURE_FLAGS.ADD_EDIT_DELETE_BANK_ACCOUNT] && (

        <AddEditBankSidesheet mode={FormMode.ADD} />
      )} */}

      <div className={premiumStyles.buttonGroup}>
        {/* TODO: disabled if nothing selected */}
        <Button
          mode="primary"
          type="submit"
          disabled={activeBanks.length === 0}
        >
          Continue
        </Button>
        <CancelDialogLink planCode={planCode} policyNumber={policyNumber} />
      </div>
    </form>
  );
};
