'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaymentForm } from '@xd/api-types/dist/generated-types/bpm';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import {
  AssistiveText,
  AssistiveTextVariant,
  IconType,
  Radio,
  Label,
} from '@zinnia/bloom/components';
import { useParams, useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { Link } from '@/components/link/Link';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import noDataStyles from '@/components/no-data-available/NoDataAvailable.module.css';
import { BankDetail } from '@/components/person-data/types';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { Address } from '@/components/pii/Address';
import { BankName } from '@/components/pii/BankName';
import {
  distributionMethodStepSchema,
  WithdrawalsAction,
} from '@/components/providers/withdrawals/types';
import { useWithdrawals } from '@/components/providers/withdrawals/useWithdrawals';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { PolicyParty } from '@/types/policy';
import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';

import { WithdrawalSteps } from '../types';
import { getNextUrl } from '../utils';
import { default as styles } from '../Withdrawals.module.css';

export const SelectBank = ({
  // planCode,
  // policyNumber,
  activeBanks,
  // lineOfBusiness,
  parties = [],
}: {
  planCode: string;
  policyNumber: string;
  parties?: PolicyParty[];
  activeBanks: BankDetail[];
  lineOfBusiness: LineOfBusiness;
}) => {
  const { setPrimaryButtonDisabled } = useSteppedWorkflowContext();
  const { state, dispatch } = useWithdrawals();
  const router = useRouter();
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const nextUrl = getNextUrl({
    step: WithdrawalSteps.DISTRIBUTION,
    planCode,
    policyNumber,
  });
  const defaultBank = activeBanks[0];
  const form = useForm<z.infer<typeof distributionMethodStepSchema>>({
    resolver: zodResolver(distributionMethodStepSchema),
    defaultValues: {
      distributionType: state.distributionMethodStep.distributionType || 'ACH',
    },
  });

  const selectedPartyId = state.payeeStep?.payeePartyId;
  const selectedParty = parties.find(
    party => party.partyId === selectedPartyId
  );
  const defaultAddress = selectedParty?.addresses?.[0];

  const distributionMethod = form.watch('distributionType');

  const onSubmit: SubmitHandler<
    z.infer<typeof distributionMethodStepSchema>
  > = async data => {
    if (data.distributionType === PaymentForm.CHECK) {
      const address = defaultAddress;
      data.address = {
        addressId: address?.addressId || '',
        addrCountry: address?.country || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.zipCode || '',
        addrLine1: address?.addressLine1 || '',
        addrLine2: address?.addressLine2 || '',
        addrLine3: address?.addressLine3 || '',
        zipExt: address?.zipCodeExtension || '',
      };
    }
    if (data.distributionType === 'ACH') {
      const accountNumber = data.bank?.accountNumber;
      const selectedBank = activeBanks.find(
        bank => bank.accountNumber === accountNumber
      );
      data.bank = {
        accountNumber: selectedBank?.accountNumber || '',
        bankId: selectedBank?.bankId || '',
        branchName: selectedBank?.branchName || '',

        accountType: selectedBank?.accountType || '',
        autopayEnabled: selectedBank?.autopayEnabled || false,
      };
    }
    dispatch({
      type: WithdrawalsAction.SET_WITHDRAWAL_DISTRIBUTION_METHOD_STEP,
      payload: data,
    });

    router.push(nextUrl);
  };
  setPrimaryButtonDisabled(
    !form.formState.isValid || form.formState.isSubmitting
  );

  return (
    <form
      className={styles.form}
      id="submit-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div radioGroup="payee" className={styles.radioGroup}>
        <Label
          interactiveElements={[
            <LabelPopover key="info" title="popover title">
              this is some very Who info
            </LabelPopover>,
          ]}
          labelFor="payee"
        >
          How should the withdrawal be sent?
        </Label>
        <Controller
          control={form.control}
          name="distributionType"
          render={({ field }) => (
            <Radio
              id="distribution-method"
              defaultValue={field.value}
              onValueChange={field.onChange}
              options={[
                {
                  key: PaymentForm.ACH,
                  label: 'Direct deposit (ACH)',
                  ariaLabel: 'Direct deposit (ACH)',
                  value: PaymentForm.ACH,
                },
                {
                  disabled: !defaultAddress?.addressLine1?.length,
                  key: PaymentForm.CHECK,
                  label: 'Paper check (mailed to your address)',
                  ariaLabel: 'Paper check (mailed to your address)',
                  value: PaymentForm.CHECK,
                },
              ]}
            />
          )}
        />
      </div>
      {distributionMethod === PaymentForm.CHECK && (
        <div className={styles.addressContainer}>
          <Label labelFor="payee-address">
            <span className="typography-titles-subtitle">Address</span>
          </Label>
          <Address
            addrCountry={defaultAddress?.country}
            city={defaultAddress?.city}
            state={defaultAddress?.state}
            zipCode={defaultAddress?.zipCode}
            addrLine1={defaultAddress?.addressLine1}
            addrLine2={defaultAddress?.addressLine2}
            addrLine3={defaultAddress?.addressLine3}
            zipExt={defaultAddress?.zipCodeExtension}
          />
          {distributionMethod === PaymentForm.CHECK &&
            !!form.formState.errors.distributionType?.message?.length && (
              <AssistiveText
                text={form.formState.errors.distributionType?.message}
              />
            )}
        </div>
      )}
      {distributionMethod === PaymentForm.ACH && (
        <div className={styles.banks}>
          <Label labelFor="active-banks">
            <span className="typography-titles-subtitle">Bank Accounts</span>
          </Label>
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
                        style={{ position: 'absolute', opacity: 0 }}
                        value={bankDetail.accountNumber}
                        type="radio"
                        role="radio"
                        id={`${index}-${bankDetail.branchName}`}
                        defaultChecked={
                          defaultBank?.accountNumber ===
                          bankDetail.accountNumber
                        }
                        {...form.register('bank.accountNumber')}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          {/* <FeatureFlagComponent
          flagKey={FEATURE_FLAGS.ADD_EDIT_DELETE_BANK_ACCOUNT}
          enabledComponent={ */}
          <div className={`my-lg mb-none ${styles.disclaimer}`}>
            <p className="typography-content-body-sm">
              Want to pay with another bank account? Go to to add. If you're not
              seeing the account you want to pay with, give us a call at{' '}
              <Link
                isNativeAnchorTag
                className="typography-nav-links-sm-inline"
                href={`tel:+${EVERLY_CONTACT_PHONE_NUMBER}`}
              >
                {EVERLY_CONTACT_PHONE_NUMBER}
              </Link>
              .
            </p>
          </div>
        </div>
      )}
    </form>
  );
};
