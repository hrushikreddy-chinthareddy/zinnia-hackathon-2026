'use client';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import {
  AssistiveText,
  AssistiveTextVariant,
  IconType,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { EditBankSidesheet } from '@/components/edit-bank/EditBankSidesheet';
import { FeatureFlagComponent } from '@/components/FeatureFlagComponent';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import noDataStyles from '@/components/no-data-available/NoDataAvailable.module.css';
import { PaymentusAddPaymentMethod } from '@/components/paymentus/PaymentusAddPaymentMethod';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { BankName } from '@/components/pii/BankName';
import { SkeletonLoader } from '@/components/skeleton-loader/SkeletonLoader';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { PaymentMethod } from '@/types/payment';
import { lineOfBusinessUrlPath } from '@/utils/data';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import styles from './SelectBank.module.css';
import { useOttp } from '../../provider/OttpContext';
import { OttpAction } from '../../provider/types';

interface SelectBankProps {
  planCode: string;
  policyNumber: string;
  activeBanks: PaymentMethod[];
  lineOfBusiness: LineOfBusiness;
  editBankEnabled?: boolean;
  addBankEnabled?: boolean;
  onAddPaymentMethod?: () => void;
}

export const SelectBank = ({
  planCode,
  policyNumber,
  activeBanks,
  lineOfBusiness,
  editBankEnabled = false,
  addBankEnabled = false,
  onAddPaymentMethod,
}: SelectBankProps) => {
  const router = useRouter();
  const { state, dispatch } = useOttp();
  const { payorBank: statePayorBank } = state;
  const { stepInfo: currentStepInfo } = useSteppedWorkflowContext();

  const defaultSelectedBankId = useMemo(() => {
    return (
      statePayorBank.bankId ||
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
    <form id="submit-form" onSubmit={handleSubmit(saveAndMove)}>
      {activeBanks.length === 0 && (
        <div className={noDataStyles.noBankDetails}>
          <NoDataAvailable iconType={IconType.BANK} correlationId={undefined}>
            <p className="typography-content-body">
              Looks like you haven't added any banking information yet.
            </p>
          </NoDataAvailable>
        </div>
      )}
      {activeBanks.length > 0 && (
        <div
          role="radiogroup"
          aria-label="select payment method"
          className={styles.banksContainer}
        >
          {activeBanks?.map((bankDetail, index) => {
            if (bankDetail.pending) {
              return (
                <SkeletonLoader
                  className={styles.bankContainer}
                  key={index}
                  width={'100%'}
                  height={'75px'}
                />
              );
            }
            return (
              <div
                key={`${index}-${bankDetail.branchName}`}
                className={styles.bankContainer}
              >
                <Controller
                  name="payorBank"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <label
                      key={`${index}-${bankDetail.branchName}`}
                      className={styles.radioCard}
                    >
                      <BankName
                        bankName={bankDetail.branchName}
                        accountType={bankDetail.accountType}
                        className="typography-labels-label-lg"
                      />
                      <div
                        className={`${styles.bankDetail} typography-content-caption`}
                      >
                        <AccountType accountType={bankDetail.accountType} />{' '}
                        <span>
                          {bankDetail.accountType?.includes('Checking') ||
                          bankDetail.accountType?.includes('Savings')
                            ? 'account ending in'
                            : 'ending in'}
                        </span>{' '}
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
                {editBankEnabled && (
                  <div className={styles.editPayment}>
                    <EditBankSidesheet />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {addBankEnabled ? (
        <div className={styles.addBank}>
          <PaymentusAddPaymentMethod
            policyNumber={policyNumber}
            planCode={planCode}
            onAddPaymentMethod={onAddPaymentMethod}
          />
        </div>
      ) : (
        <FeatureFlagComponent
          flagKey={FEATURE_FLAGS.ADD_EDIT_DELETE_BANK_ACCOUNT}
          enabledComponent={
            <div className={`my-lg mb-none ${styles.disclaimer}`}>
              <p className="typography-content-body-sm">
                Want to pay with another bank account? Go to{' '}
                <ConfirmDialog
                  confirmCallback={() =>
                    router.push(
                      `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/profile?addBank=true#addBankSection`
                    )
                  }
                  inline
                  linkText="banking details"
                  confirmDescription="Navigate to the profile page and open the add bank sidesheet"
                  message="If you leave now, your payment won't be submitted and you will have to start over."
                  cancelDescription="Stay on the premium payment page"
                  title="Leave payment?"
                />{' '}
                to add. If you're not seeing the account you want to pay with,
                give us a call at <CarrierPhoneNumber />.
              </p>
            </div>
          }
        />
      )}
    </form>
  );
};
