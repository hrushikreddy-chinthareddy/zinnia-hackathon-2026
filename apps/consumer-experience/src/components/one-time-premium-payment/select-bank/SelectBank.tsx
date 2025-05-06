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

import { Button } from '@/components/button/Button';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { FeatureFlagComponent } from '@/components/FeatureFlagComponent';
import { Link } from '@/components/link/Link';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import noDataStyles from '@/components/no-data-available/NoDataAvailable.module.css';
import { BankDetail } from '@/components/person-data/types';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { BankName } from '@/components/pii/BankName';
import {
  EVERLY_CONTACT_PHONE_NUMBER,
  lineOfBusinessUrlPath,
} from '@/utils/data';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

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
  lineOfBusiness,
}: {
  planCode: string;
  policyNumber: string;
  activeBanks: BankDetail[];
  lineOfBusiness: LineOfBusiness;
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
                  linkText="banking details"
                  linkClassName={styles.linkClassname}
                  confirmDescription="Navigate to the profile page and open the add bank sidesheet"
                  message="If you leave now, your payment won't be submitted and you will have to start over."
                  cancelDescription="Stay on the premium payment page"
                  title="Leave payment?"
                />{' '}
                to add. If you're not seeing the account you want to pay with,
                give us a call at{' '}
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
          }
        />

        <div className={premiumStyles.buttonGroup}>
          {/* TODO: disabled if nothing selected */}
          <Button
            mode="primary"
            type="submit"
            disabled={activeBanks.length === 0}
          >
            Continue
          </Button>
          <CancelDialogLink
            planCode={planCode}
            policyNumber={policyNumber}
            lineOfBusiness={lineOfBusiness}
          />
        </div>
      </form>
    </FormStepWrapper>
  );
};
