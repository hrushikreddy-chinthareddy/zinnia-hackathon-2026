'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DisbursementPaymentForm,
  PaymentForm,
} from '@xd/api-types/dist/generated-types/bpm';
import { Address } from '@xd/api-types/dist/generated-types/sor';
import { toSentenceCase } from '@xd/utils/dist';
import { countryCodeToName } from '@xd/xd-components/src/utils/Adresses';
import {
  AssistiveText,
  AssistiveTextVariant,
  IconType,
  Radio,
  Label,
  Address as AddressComponent,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { EditBankSidesheet } from '@/components/edit-bank/EditBankSidesheet';
import { FieldData } from '@/components/field-data/FieldData';
import { Link } from '@/components/link/Link';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import noDataStyles from '@/components/no-data-available/NoDataAvailable.module.css';
import { PaymentusAddPaymentMethod } from '@/components/paymentus/PaymentusAddPaymentMethod';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { BankName } from '@/components/pii/BankName';
import { SkeletonLoader } from '@/components/skeleton-loader/SkeletonLoader';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import {
  distributionMethodStepSchema,
  SurrenderAction,
} from '@/components/stepped-workflow/workflows/surrender/provider/types';
import { useSurrender } from '@/components/stepped-workflow/workflows/surrender/provider/useSurrender';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { PaymentMethod } from '@/types/payment';

import { default as styles } from '../Surrender.module.css';

export const SelectBank = ({
  activeBanks,
  activeAddresses,
  addBankEnabled = false,
  editBankEnabled = false,
  onAddPaymentMethod,
}: {
  activeBanks: PaymentMethod[];
  activeAddresses: Address[];
  addBankEnabled?: boolean;
  editBankEnabled?: boolean;
  onAddPaymentMethod: () => void;
}) => {
  const { state, dispatch } = useSurrender();
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();
  const { planCode, policyNumber, lineOfBusinessUrl } = usePolicyUrlInputs();

  const defaultBank = activeBanks[0];
  const defaultAddress = activeAddresses[0];
  const form = useForm<z.infer<typeof distributionMethodStepSchema>>({
    resolver: zodResolver(distributionMethodStepSchema),
    defaultValues: {
      distributionType: state.distributionMethodStep.distributionType || 'ACH',
    },
  });
  const distributionMethod = form.watch('distributionType');

  const addBankUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/profile#addBankSection`;
  const ownerProfileUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/profile`;

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
      type: SurrenderAction.SET_SURRENDER_DISTRIBUTION_METHOD_STEP,
      payload: {
        distributionMethodStep: {
          distributionType: data.distributionType,
          bank: selectedBank,
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
        <Label labelFor="payee">How should the payment be sent?</Label>
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
              <NoDataAvailable
                iconType={IconType.BANK}
                correlationId={undefined}
              >
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
                      <AddressComponent
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
              <Link isInternal href={ownerProfileUrl}>
                Owner Profile
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
                <NoDataAvailable
                  iconType={IconType.BANK}
                  correlationId={undefined}
                >
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
                        {...form.register('bank.accountNumber')}
                        style={{ position: 'absolute', opacity: 0 }}
                        value={bankDetail.accountNumber}
                        type="radio"
                        role="radio"
                        id={`${index}-${bankDetail.branchName}`}
                        defaultChecked={
                          defaultBank?.accountNumber ===
                          bankDetail.accountNumber
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
                planCode={planCode}
                onAddPaymentMethod={onAddPaymentMethod}
              />
            </div>
          ) : (
            <div className={`my-lg mb-none ${styles.disclaimer}`}>
              <p className="typography-content-body-sm">
                Want to pay with another bank account? Go to to{' '}
                <Link href={addBankUrl} isInternal>
                  banking details
                </Link>{' '}
                to add. If you're not seeing the account you want to pay with,
                give us a call at <CarrierPhoneNumber />.
              </p>
            </div>
          )}
        </div>
      )}
    </form>
  );
};
