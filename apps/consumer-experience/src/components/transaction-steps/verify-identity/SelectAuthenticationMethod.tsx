'use client';
import { useQuery } from '@tanstack/react-query';
import { Button, Radio } from '@zinnia/bloom/components';
import {
  Controller,
  FieldValues,
  SubmitHandler,
  useForm,
} from 'react-hook-form';

import Loading from '@/app/loading';
import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { MfaPhoneNumber } from '@/components/mfa/phone-number/MfaPhoneNumber';
import { QueryKeys } from '@/queries/query-keys';
import { getUserAuthenticationMethods } from '@/queries/user-queries';
import { MfaVerificationType } from '@/types/auth';

import { verifyTransactionMfa } from './transaction-mfa-actions';
import styles from './VerifyIdentity.module.css';

export const SelectAuthenticationMethod = ({
  transactionDescription,
  moveToNextStep,
  closeCallback,
}: {
  transactionDescription?: string;
  moveToNextStep: () => void;
  closeCallback: () => void;
}) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const { data: userAuthentication, isLoading } = useQuery({
    queryKey: [QueryKeys.USER_AUTHENTICATION_METHODS],
    queryFn: () => getUserAuthenticationMethods(),
    select: response => {
      const phone = response.data?.find(method => method.type === 'phone');
      return {
        phoneNumber: phone?.phone_number,
        authenticationMethods: phone?.authentication_methods.map(method => ({
          label:
            method.type === MfaVerificationType.SMS ? 'Text' : 'Phone call',
          value: method.id,
          ariaLabel: method.type,
          type: method.type,
        })),
        defaultAuthentication: phone?.authentication_methods.find(
          m => m.type === MfaVerificationType.SMS
        )?.id,
      };
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async data => {
    await verifyTransactionMfa(data);

    // TODO: when to set this?
    // may not even need to wait for success from verifyTransaction?
    // i guess unless apis are down, we could return an error
    moveToNextStep();
  };

  if (isLoading || isSubmitting) {
    return <Loading />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className="typography-mobile-headline-3-m mb-xl">
        Verify your identity
      </h3>
      <p>
        For your security, we're sending a one-time code to the phone number
        associated with your account.
        {transactionDescription && (
          <span>This helps us confirm it's you {transactionDescription}</span>
        )}
      </p>
      <div className="my-lg">
        <p className="typography-labels-field-label">Mobile phone</p>
        {/* TODO: add real phone number */}
        <MfaPhoneNumber
          phoneNumber={
            // this is making the assumption that there is only one phone object
            // if a user updates their phone number (once that is possible) will
            // they have multiple objects for phone or does it only save the current
            // phone being used?
            userAuthentication?.phoneNumber || ''
          }
        />
      </div>
      {/* <MfaOptions className="mb-xl" /> */}
      <Controller
        name="verificationType"
        control={control}
        rules={{ required: true }}
        defaultValue={userAuthentication?.defaultAuthentication}
        render={({ field }) => (
          <div className={styles.authenticationOptions}>
            <Radio
              id="radio-account-type"
              onValueChange={field.onChange}
              defaultValue={userAuthentication?.defaultAuthentication}
              options={userAuthentication?.authenticationMethods || []}
            />
          </div>
        )}
      />
      <p className="typography-nav-links-sm-inline my-xl">
        If you no longer have access to this number, please give us a call at{' '}
        <CarrierPhoneNumber /> for assistance.
      </p>
      <div className={styles.buttonContainer}>
        <Button type="submit">Send code</Button>
        <Button onClick={closeCallback} mode="link">
          Cancel
        </Button>
      </div>
    </form>
  );
};
