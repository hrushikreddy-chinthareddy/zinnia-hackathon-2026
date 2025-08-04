'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DisbursementPaymentForm,
  PaymentForm,
} from '@xd/api-types/dist/generated-types/bpm';
import { Address as AddressType } from '@xd/api-types/dist/generated-types/sor';
import { toSentenceCase } from '@xd/utils';
import { countryCodeToName } from '@xd-components/utils/Adresses';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import {
  AssistiveText,
  AssistiveTextVariant,
  IconType,
  Radio,
  Label,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { FieldData } from '@/components/field-data/FieldData';
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
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { PolicyParty } from '@/types/policy';

import { default as styles } from '../Withdrawals.module.css';

export const SelectBank = ({
  activeAddresses,
  activeBanks,
  parties = [],
}: {
  parties?: PolicyParty[];
  activeAddresses: AddressType[];
  activeBanks: BankDetail[];
  lineOfBusiness: LineOfBusiness;
}) => {
  const { state, dispatch } = useWithdrawals();
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();
  const { planCode, policyNumber, lineOfBusinessUrl } = usePolicyUrlInputs();

  const defaultBank = activeBanks[0];
  const form = useForm<z.infer<typeof distributionMethodStepSchema>>({
    resolver: zodResolver(distributionMethodStepSchema),
    defaultValues: {
      distributionType: state.distributionMethodStep.distributionType || 'ACH',
    },
  });

  const addBankUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/profile#addBankSection`;
  const profileUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/profile`;

  const selectedPartyId = state.payeeStep?.payeePartyId;
  const selectedParty = parties.find(
    party => party.partyId === selectedPartyId
  );
  const defaultAddress = selectedParty?.addresses?.[0];

  useEffect(() => {
    if (!selectedParty) return;
    const payload = {
      distributionType: state.distributionMethodStep.distributionType,
      address: state.distributionMethodStep.address,
      bank: state.distributionMethodStep.bank,
    };

    const selectedAddress = payload.address?.addressId;
    const selectedBank = payload.bank?.accountNumber;

    if (selectedBank && selectedAddress) {
      return;
    }

    if (!selectedAddress) {
      const defaultAddress = activeAddresses[0];

      payload.address = {
        addressId: defaultAddress?.addressId,
        addrCountry: defaultAddress?.country,
        city: defaultAddress?.city,
        state: defaultAddress?.state,
        zipCode: defaultAddress?.zipCode,
        addrLine1: defaultAddress?.addressLine1,
        addrLine2: defaultAddress?.addressLine2,
        addrLine3: defaultAddress?.addressLine3,
        zipExt: defaultAddress?.zipCodeExtension,
      };
    }

    if (!selectedBank) {
      const defaultBank = activeBanks[0];
      payload.bank = {
        accountNumber: defaultBank?.accountNumber,
        bankId: defaultBank?.bankId,
        branchName: defaultBank?.branchName,
        accountType: defaultBank?.accountType,
        autopayEnabled: defaultBank?.autopayEnabled,
      };
    }

    dispatch({
      type: WithdrawalsAction.SET_WITHDRAWAL_DISTRIBUTION_METHOD_STEP,
      payload: {
        distributionMethodStep: payload,
      },
    });
  }, [
    activeAddresses,
    activeBanks,
    dispatch,
    selectedParty,
    state.distributionMethodStep.address,
    state.distributionMethodStep.bank,
    state.distributionMethodStep.bank?.accountNumber,
    state.distributionMethodStep.distributionType,
  ]);

  const distributionMethod = form.watch('distributionType');

  const onSubmit: SubmitHandler<
    z.infer<typeof distributionMethodStepSchema>
  > = data => {
    const selectedBank =
      activeBanks.find(
        bank => bank.accountNumber === data.bank?.accountNumber
      ) || defaultBank;

    const selectedAddress =
      activeAddresses.find(
        address => address.addressId === data.address?.addressId
      ) || defaultAddress;

    dispatch({
      type: WithdrawalsAction.SET_WITHDRAWAL_DISTRIBUTION_METHOD_STEP,
      payload: {
        distributionMethodStep: {
          distributionType: data.distributionType,
          bank: {
            accountNumber: selectedBank?.accountNumber,
            bankId: selectedBank?.bankId,
            branchName: selectedBank?.branchName,
            accountType: selectedBank?.accountType,
            autopayEnabled: selectedBank?.autopayEnabled,
          },
          address: {
            addressId: selectedAddress?.addressId,
            addrCountry: selectedAddress?.country,
            city: selectedAddress?.city,
            state: selectedAddress?.state,
            zipCode: selectedAddress?.zipCode,
            addrLine1: selectedAddress?.addressLine1,
            addrLine2: selectedAddress?.addressLine2,
            addrLine3: selectedAddress?.addressLine3,
            zipExt: selectedAddress?.zipCodeExtension,
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
      {distributionMethod === DisbursementPaymentForm.CHECK && (
        <div className={styles.banks}>
          <Label labelFor="payee-address">
            <span className="typography-titles-subtitle">Addresses</span>
          </Label>
          {activeBanks.length === 0 && (
            <div className={noDataStyles.noBankDetails}>
              <NoDataAvailable iconType={IconType.BANK}>
                <p className="typography-content-body">
                  Looks like you haven't added any banking information yet.
                </p>
              </NoDataAvailable>
            </div>
          )}
          {activeAddresses?.length > 0 && (
            <div>
              <div
                id="active-addresses"
                role="radiogroup"
                aria-label="select payment method"
                className={styles.banksContainer}
              >
                {activeAddresses.map((address, index) => (
                  <label
                    id={`${index}-${address.addressId}`}
                    key={`${index}-${address.addressId}`}
                    className={styles.bankContainer}
                  >
                    <FieldData
                      Label={
                        <Label labelFor={`${index}-${address.addressId}`}>
                          {toSentenceCase(address.addressType)}
                        </Label>
                      }
                    >
                      <Address
                        addrCountry={countryCodeToName(address.country)}
                        city={address.city}
                        state={address.state}
                        zipCode={address.zipCode}
                        addrLine1={address.addressLine1}
                        addrLine2={address.addressLine2}
                        addrLine3={address.addressLine3}
                        zipExt={address.zipCodeExtension}
                      />
                    </FieldData>
                    <input
                      style={{ position: 'absolute', opacity: 0 }}
                      value={address.addressId}
                      type="radio"
                      role="radio"
                      id={`${index}-${address.addressId}`}
                      {...form.register('address.addressId')}
                    />
                  </label>
                ))}
              </div>
              {!!form.formState.errors.distributionType?.message?.length && (
                <AssistiveText
                  text={form.formState.errors.distributionType?.message}
                />
              )}
            </div>
          )}
          <div className={`my-lg mb-none ${styles.disclaimer}`}>
            <p className="typography-content-body-sm">
              Want to send a check to another address? Go to{' '}
              <Link isInternal href={profileUrl}>
                Your Profile
              </Link>{' '}
              to add. If you&apos;re not seeing the address you want to mail to,
              give us a call at <CarrierPhoneNumber />.
            </p>
          </div>
        </div>
      )}
      {distributionMethod === DisbursementPaymentForm.ACH && (
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
          <div className={`my-lg mb-none ${styles.disclaimer}`}>
            <p className="typography-content-body-sm">
              Want to pay with another bank account? Go to to{' '}
              <ConfirmDialog
                confirmCallback={() => router.push(addBankUrl)}
                inline
                linkText="banking details"
                confirmDescription="Navigate to the profile page and open the add bank sidesheet"
                message="If you leave now, your withrawal won't be submitted and you will have to start over."
                cancelDescription="Stay on the withdrawal page"
                title="Leave withdrawal?"
              ></ConfirmDialog>{' '}
              to add. If you're not seeing the account you want to pay with,
              give us a call at <CarrierPhoneNumber />.
            </p>
          </div>
        </div>
      )}
    </form>
  );
};
