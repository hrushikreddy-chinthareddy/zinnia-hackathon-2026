'use client';
import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  IconType,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import noDataStyles from '@/components/no-data-available/NoDataAvailable.module.css';
import { BankDetail } from '@/components/person-data/types';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { BankName } from '@/components/pii/BankName';

import styles from './SelectBank.module.css';
import { useOttp } from '../../providers/one-time-premium-payment/OttpContext';
import { OttpAction } from '../../providers/one-time-premium-payment/types';
import { CancelDialogLink } from '../CancelDialogLink';
import { FormStepWrapper } from '../FormStepWrapper';
import premiumStyles from '../OneTimePremiumPayment.module.css';
import { getStepInfo, Steps } from '../steps';

export const SelectBank = ({
  planCode,
  policyNumber,
  activeBanks,
}: {
  planCode: string;
  policyNumber: string;
  activeBanks: BankDetail[];
}) => {
  const router = useRouter();
  const { state, dispatch } = useOttp();
  const { payorBank: statePayorBank } = state;
  const currentStepInfo = getStepInfo({
    step: Steps.BANK,
    planCode,
    policyNumber,
  });

  const defaultSelectedBankId = useMemo(() => {
    return (
      statePayorBank?.bankId ||
      activeBanks.find(bank => bank.autopayEnabled)?.bankId ||
      activeBanks[0]?.bankId
    );
  }, [activeBanks, statePayorBank?.bankId]);

  const { control, handleSubmit, getValues } = useForm<{
    payorBank: string;
  }>({
    defaultValues: {
      payorBank: defaultSelectedBankId,
    },
  });

  const saveAndMove = () => {
    const nextStepUrl = currentStepInfo?.nextStepUrl;
    const selectedBank = activeBanks.find(
      ({ bankId }) => bankId === getValues('payorBank')
    );
    dispatch({
      type: OttpAction.SET_PAYOR_BANK,
      payload: selectedBank,
    });
    router.push(nextStepUrl || '');
  };

  return (
    <FormStepWrapper
      currentStep={Steps.BANK}
      planCode={planCode}
      policyNumber={policyNumber}
    >
      <form onSubmit={handleSubmit(saveAndMove)}>
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
          <div
            role="radiogroup"
            aria-label="select payment method"
            className={styles.banksContainer}
          >
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
                      className={styles.bankContainer}
                    >
                      <BankName
                        bankName={bankDetail.branchName}
                        className="typography-labels-label-lg"
                      />
                      <div
                        className={`${styles.bankDetail} typography-content-caption`}
                      >
                        <AccountType accountType={bankDetail.accountType} />{' '}
                        <span>account ending in</span>{' '}
                        <AccountNumber
                          accountNumber={bankDetail.accountNumber}
                        />
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
                          bankDetail?.bankId === defaultSelectedBankId
                        }
                      />
                    </label>
                  )}
                />
              );
            })}
          </div>
        )}

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
    </FormStepWrapper>
  );
};
