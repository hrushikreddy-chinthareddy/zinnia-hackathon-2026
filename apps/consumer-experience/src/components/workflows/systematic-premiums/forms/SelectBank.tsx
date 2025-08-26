'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AssistiveText,
  AssistiveTextVariant,
  IconType,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';

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
import {
  selectBankStepSchema,
  SPSelectBankStepSchema,
  SystematicPremiumsAction,
} from '@/components/providers/systematic-premiums/types';
import { useSystematicPremiums } from '@/components/providers/systematic-premiums/useSystematicPremiums';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { PaymentMethod } from '@/types/payment';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { default as styles } from '../SystematicPremiums.module.css';

export const SelectBank = ({
  activeBanks,
  addBankEnabled = false,
  editBankEnabled = false,
  onAddPaymentMethod,
}: {
  activeBanks: PaymentMethod[];
  addBankEnabled?: boolean;
  editBankEnabled?: boolean;
  onAddPaymentMethod: () => void;
}) => {
  const { dispatch } = useSystematicPremiums();
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();
  const { planCode, policyNumber, lineOfBusinessUrl } = usePolicyUrlInputs();

  const defaultBank = activeBanks[0];
  const form = useForm<SPSelectBankStepSchema>({
    resolver: zodResolver(selectBankStepSchema),
    defaultValues: {
      bank: {
        accountNumber: defaultBank?.accountNumber,
        bankId: defaultBank?.bankId,
        branchName: defaultBank?.branchName,
        accountType: defaultBank?.accountType,
        autopayEnabled: defaultBank?.autopayEnabled,
      },
      payor: {
        payorName: defaultBank?.nameOnAccount,
        payorPartyId: defaultBank?.appliesToPartyId,
      },
    },
  });

  const addBankUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/profile#addBankSection`;

  const onSubmit: SubmitHandler<SPSelectBankStepSchema> = data => {
    const selectedBank =
      activeBanks.find(
        bank => bank.accountNumber === data.bank?.accountNumber
      ) || defaultBank;

    if (!selectedBank?.appliesToPartyId) {
      return;
    }

    if (!selectedBank?.nameOnAccount) {
      return;
    }

    dispatch({
      type: SystematicPremiumsAction.SET_SYSTEMATIC_PREMIUM_DISTRIBUTION_METHOD_STEP,
      payload: {
        selectBankStep: {
          bank: {
            accountNumber: selectedBank?.accountNumber,
            bankId: selectedBank?.bankId,
            branchName: selectedBank?.branchName,
            accountType: selectedBank?.accountType,
            autopayEnabled: selectedBank?.autopayEnabled,
          },
          payor: {
            payorName: selectedBank?.nameOnAccount,
            payorPartyId: selectedBank?.appliesToPartyId,
          },
        },
      },
    });

    router.push(stepInfo.nextStepUrl);
  };

  return (
    <form
      className={styles.form}
      id="submit-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {form.formState.errors.root?.message && (
        <AssistiveText
          text={form.formState.errors.root.message}
          variant={AssistiveTextVariant.Error}
        ></AssistiveText>
      )}

      <div className={styles.banks}>
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
          <div>
            <div
              id="active-banks"
              role="radiogroup"
              aria-label="select payment method"
              className={styles.banksContainer}
            >
              {activeBanks?.map((bankDetail, index) => {
                return (
                  <label
                    key={`${index}-${bankDetail.branchName}`}
                    className={styles.bankContainer}
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
                      {...form.register('bank.accountNumber')}
                      style={{ position: 'absolute', opacity: 0 }}
                      value={bankDetail.accountNumber}
                      type="radio"
                      role="radio"
                      id={`${index}-${bankDetail.branchName}`}
                      defaultChecked={
                        defaultBank?.accountNumber === bankDetail.accountNumber
                      }
                      onChange={e => {
                        const selectedBank = activeBanks.find(
                          bank => bank.accountNumber === e.target.value
                        );
                        if (!selectedBank) {
                          form.setError('bank.accountNumber', {
                            message: 'Bank account not found',
                          });
                        }
                        form.setValue('bank.accountNumber', e.target.value);
                        form.setValue('bank.bankId', selectedBank?.bankId);
                        form.setValue(
                          'bank.branchName',
                          selectedBank?.branchName
                        );
                        form.setValue(
                          'bank.accountType',
                          selectedBank?.accountType
                        );
                        form.setValue(
                          'bank.autopayEnabled',
                          selectedBank?.autopayEnabled
                        );
                      }}
                    />
                    {editBankEnabled && <EditBankSidesheet />}
                  </label>
                );
              })}
            </div>
            {form.formState.errors.bank?.accountNumber?.message && (
              <AssistiveText
                text={form.formState.errors.bank.accountNumber.message}
                variant={AssistiveTextVariant.Error}
              ></AssistiveText>
            )}
          </div>
        )}

        {addBankEnabled ? (
          <div className={styles.addBank}>
            <PaymentusAddPaymentMethod
              policyNumber={policyNumber}
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
                    confirmCallback={() => router.push(addBankUrl)}
                    inline
                    linkText="banking details"
                    linkClassName={styles.linkClassname}
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
      </div>
    </form>
  );
};
