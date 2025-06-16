'use client';
import { useQueryClient } from '@tanstack/react-query';
import { Icon, IconType, SideSheet } from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';

import { FormSteps } from '@/types/transactions';

import { AddPaymentMethod } from './AddPaymentMethod';
import { PaymentusSuccess } from './PaymentusSuccess';
import { Button } from '../button/Button';

// TODO: is there a util for this?
const removeStars = (str: string) => str.replace(/\*/g, '');

// Test Credit Cards: https://www.paypalobjects.com/en_GB/vhelp/paypalmanager_help/credit_card_numbers.htm
export const PaymentusAddPaymentMethod = ({
  policyNumber,
}: {
  policyNumber: string;
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [step, setStep] = useState<FormSteps | undefined>();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only respond to postMessages from farmers paymentus API
      if (event.origin !== process.env.NEXT_PUBLIC_FARMERS_API_BASE_URL) {
        return;
      }

      // Successful payment submission return looks like this
      // "pmDetails:{\"Token\":\"4355A958DFCCF94D09423F28354713CBB120FF1F\",\"Type\":\"MC\",\"MaskedAccountNumber\":\"************4444\",\"CardHolderName\":\"mac clarkson\",\"ExpiryDate\":\"06/2026\",\"ZipCode\":\"12345\",\"Default\":\"false\",\"zipCode\":\"12345\"}"
      const message =
        typeof event.data === 'string' && event.data.includes('pmDetails:')
          ? JSON.parse(event.data.replace('pmDetails:', ''))
          : event.data;

      if (message.Token) {
        setSuccessMessage(
          // TODO: update the message.Type to use accountType in paymentus utils once CUI-820 is merged
          `${message.BankName || message.Type} ${removeStars(message.MaskedAccountNumber)} is being added. `
        );
        setStep(FormSteps.SUCCESS);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup to remove event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });

  const onClose = () => {
    setOpen(false);
    setStep(undefined);
    queryClient.invalidateQueries({
      queryKey: ['paymentusAddCCToken'],
    });
  };

  return (
    <SideSheet
      header="Add New Payment Method"
      closeCallback={onClose}
      overrideOpen={open}
      trigger={
        <Button size="small" mode="link" onClick={() => setOpen(true)}>
          <Icon small type={IconType.ADD} />
          Add a payment method
        </Button>
      }
    >
      {!step && <AddPaymentMethod policyNumber={policyNumber} />}

      {step === FormSteps.SUCCESS && (
        <PaymentusSuccess
          successTitle="Thanks!"
          successMessage={successMessage}
          closeCallback={onClose}
        />
      )}
    </SideSheet>
  );
};

// TODO:
// does edit already disable certain fields?
// paymentus has CC and DC as options to create the token -> but the ui doesn't have the option of debit or credit....do i need to send that, like there's going to be a loading state between radio buttons?
// include the option to not save the payment method? -> i don't think we can do this? or we could but this will be an additional feature
