'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { PartyRole } from '@xd/api-types/dist/generated-types/sor';
import {
  AssistiveText,
  AssistiveTextVariant,
  IconType,
  Label,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { Link } from '@/components/link/Link';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import noDataStyles from '@/components/no-data-available/NoDataAvailable.module.css';
import { BankDetail } from '@/components/person-data/types';
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
import { PolicyParty } from '@/types/policy';

import { default as styles } from '../SystematicPremiums.module.css';

export const SelectBank = ({
  activeBanks,
  parties,
}: {
  parties?: PolicyParty[];
  activeBanks: BankDetail[];
}) => {
  const { state, dispatch } = useSystematicPremiums();
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();
  const { planCode, policyNumber, lineOfBusinessUrl } = usePolicyUrlInputs();

  const defaultBank = activeBanks[0];
  const form = useForm<SPSelectBankStepSchema>({
    resolver: zodResolver(selectBankStepSchema),
    defaultValues: {
      bank: state.selectBankStep.bank,
      payor: state.selectBankStep.payor,
    },
  });

  const addBankUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/profile#addBankSection`;
  const payorParty = parties?.find(p =>
    p.partyRoles?.includes(PartyRole.PAYOR)
  );

  const onSubmit: SubmitHandler<SPSelectBankStepSchema> = data => {
    let payorName = '';
    const selectedBank =
      activeBanks.find(
        bank => bank.accountNumber === data.bank?.accountNumber
      ) || defaultBank;

    if (!payorParty) return;

    const { fullName, firstName, lastName, partyId } = payorParty;

    if (!partyId) return;

    if (!fullName) {
      payorName = `${firstName} ${lastName}`;
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
            payorName: payorName,
            payorPartyId: partyId,
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
        <div className={`my-lg mb-none ${styles.disclaimer}`}>
          <p className="typography-content-body-sm">
            Want to pay with another bank account? Go to to{' '}
            <Link href={addBankUrl} isInternal>
              banking details
            </Link>{' '}
            to add. If you're not seeing the account you want to pay with, give
            us a call at <CarrierPhoneNumber />.
          </p>
        </div>
      </div>
    </form>
  );
};
