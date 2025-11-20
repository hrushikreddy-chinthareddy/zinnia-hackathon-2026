'use client';
import {
  AssistiveText,
  AssistiveTextVariant,
  IconType,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import noDataStyles from '@/components/no-data-available/NoDataAvailable.module.css';
import { PaymentusAddPaymentMethod } from '@/components/paymentus/PaymentusAddPaymentMethod';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { BankName } from '@/components/pii/BankName';
import { SkeletonLoader } from '@/components/skeleton-loader/SkeletonLoader';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { PaymentMethod } from '@/types/payment';

import {
  SPSelectBankStepSchema,
  SystematicPremiumsAction,
} from '../provider/types';
import { useSystematicPremiums } from '../provider/useSystematicPremiums';
import { default as styles } from '../SystematicPremiums.module.css';

const AddBankInTransaction = ({
  addBankInlineEnabled,
  onAddPaymentMethod,
}: {
  addBankInlineEnabled: boolean;
  onAddPaymentMethod: () => void;
}) => {
  const router = useRouter();
  const { planCode, policyNumber, lineOfBusinessUrl } = usePolicyUrlInputs();
  const addBankUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/profile#addBankSection`;
  return (
    <div>
      {' '}
      {addBankInlineEnabled ? (
        <div className={styles.addBank}>
          <PaymentusAddPaymentMethod
            policyNumber={policyNumber}
            planCode={planCode}
            onAddPaymentMethod={onAddPaymentMethod}
          />
        </div>
      ) : (
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
            to add. If you're not seeing the account you want to pay with, give
            us a call at <CarrierPhoneNumber />.
          </p>
        </div>
      )}
    </div>
  );
};

export const SelectBank = ({
  activeBanks,
  addBankInlineEnabled = false,
  onAddPaymentMethod,
}: {
  activeBanks: PaymentMethod[];
  addBankInlineEnabled?: boolean;
  onAddPaymentMethod: () => void;
}) => {
  type SelectBankFormValues = {
    payorBank: string | undefined;
  };

  const { dispatch, state } = useSystematicPremiums();
  const { selectBankStep } = state;
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();

  const defaultSelectedBankId = useMemo(() => {
    return (
      selectBankStep.bankId ||
      activeBanks.find(bank => bank.autopayEnabled)?.bankId ||
      activeBanks[0]?.bankId
    );
  }, [activeBanks, selectBankStep?.bankId]);

  const form = useForm<SelectBankFormValues>({
    // this is why the zod definition was all optional, because no gaurantee about what we'regoing to get from API
    // but does this really make sense to use? I don't need to validate the bank object...
    // That's not really the point of this form?
    // resolver: zodResolver(selectBankStepSchema),
    defaultValues: {
      payorBank: defaultSelectedBankId,
    },
  });

  const onSubmit: SubmitHandler<SelectBankFormValues> = data => {
    const selectedBank = activeBanks.find(
      ({ bankId }) => bankId === data.payorBank
    );

    dispatch({
      type: SystematicPremiumsAction.SET_SYSTEMATIC_PREMIUM_DISTRIBUTION_METHOD_STEP,
      payload: {
        // TODO: fix this error
        selectBankStep: (selectedBank ||
          activeBanks[0]) as unknown as SPSelectBankStepSchema,
      },
    });

    router.push(stepInfo.nextStepUrl);
  };

  if (!activeBanks || activeBanks.length === 0) {
    return (
      <>
        <div className={noDataStyles.noBankDetails}>
          <NoDataAvailable iconType={IconType.BANK} correlationId={undefined}>
            <p className="typography-content-body">
              Looks like you haven't added any banking information yet.
            </p>
          </NoDataAvailable>
        </div>
        <AddBankInTransaction
          addBankInlineEnabled={addBankInlineEnabled}
          onAddPaymentMethod={onAddPaymentMethod}
        />
      </>
    );
  }

  return (
    <>
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
          {activeBanks?.length > 0 && (
            <div>
              <div
                id="active-banks"
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
                    <Controller
                      name="payorBank"
                      key={`${index}-${bankDetail.bankId}`}
                      control={form.control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <label className={styles.bankContainer}>
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
                  );
                })}
              </div>
              {/* TODO: what is this doing?? */}
              {/* {form.formState.errors.bank?.accountNumber?.message && (
              <AssistiveText
                text={form.formState.errors.bank.accountNumber.message}
                variant={AssistiveTextVariant.Error}
              ></AssistiveText>
            )} */}
            </div>
          )}
        </div>
      </form>
      <AddBankInTransaction
        addBankInlineEnabled={addBankInlineEnabled}
        onAddPaymentMethod={onAddPaymentMethod}
      />
    </>
  );
};
