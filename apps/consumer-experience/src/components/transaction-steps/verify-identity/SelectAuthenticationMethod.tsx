'use client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@zinnia/bloom/components';
import {
  Controller,
  FieldValues,
  SubmitHandler,
  useForm,
} from 'react-hook-form';

import Loading from '@/app/loading';
import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { postLoginSendMfaChallenge } from '@/components/mfa/mfa-actions';
import { MfaPhoneNumber } from '@/components/mfa/phone-number/MfaPhoneNumber';
import { QueryKeys } from '@/queries/query-keys';
import { getUserAuthenticationMethods } from '@/queries/user-queries';
import { MfaVerificationType } from '@/types/auth';

import styles from './VerifyIdentity.module.css';

export const SelectAuthenticationMethod = ({
  transactionDescription,
  moveToNextStep,
  closeCallback,
}: {
  transactionDescription?: string;
  moveToNextStep: (selectedMethodId: string) => void;
  closeCallback: () => void;
}) => {
  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
    reset,
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
    await postLoginSendMfaChallenge(data);

    // TODO: I think we just move to the next step here regardless of above?
    // if sending mfa challenge fails...then it fails but user
    // should still see the enter code step
    moveToNextStep(getValues()?.verificationType);
  };

  const onCancel = () => {
    reset();
    closeCallback();
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
      <Controller
        name="verificationType"
        control={control}
        rules={{ required: true }}
        defaultValue={userAuthentication?.defaultAuthentication}
        render={({ field }) => (
          <div className={styles.authenticationOptions}>
            {/* <Radio
              id="radio-account-type"
              onValueChange={field.onChange}
              defaultValue={userAuthentication?.defaultAuthentication}
              options={userAuthentication?.authenticationMethods || []}
            /> */}
          </div>
        )}
      />
      <p className="typography-nav-links-sm-inline my-xl">
        If you no longer have access to this number, please give us a call at{' '}
        <CarrierPhoneNumber /> for assistance.
      </p>
      <div className={styles.buttonContainer}>
        <Button type="submit">Send code</Button>
        <Button onClick={onCancel} mode="link">
          Cancel
        </Button>
      </div>
    </form>
  );
};
