'use client';

import { useRouter } from 'next/navigation';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { PaymentusAddPaymentMethod } from '@/components/paymentus/PaymentusAddPaymentMethod';
import { lineOfBusinessUrlPath } from '@/utils/data';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import styles from './Selectable.module.css';

interface AddPaymentMethodProps {
  addBankInlineEnabled?: boolean;
  policyNumber: string;
  planCode: string;
  lineOfBusiness: LineOfBusiness;
  onAddPaymentMethod: () => void;
}

export const AddPaymentMethod = ({
  addBankInlineEnabled,
  policyNumber,
  planCode,
  lineOfBusiness,
  onAddPaymentMethod,
}: AddPaymentMethodProps) => {
  const router = useRouter();

  if (addBankInlineEnabled) {
    return (
      <div className={styles.addBank}>
        <PaymentusAddPaymentMethod
          policyNumber={policyNumber}
          planCode={planCode}
          onAddPaymentMethod={onAddPaymentMethod}
        />
      </div>
    );
  }

  return (
    <div className={`my-lg mb-none ${styles.disclaimer}`}>
      <p className="typography-content-body-sm">
        Want to pay with another bank account? Go to{' '}
        <ConfirmDialog
          confirmCallback={() =>
            router.push(
              `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/profile?addBank=true#addBankSection`
            )
          }
          inline
          linkText="banking details"
          confirmDescription="Navigate to the profile page and open the add bank sidesheet"
          message="If you leave now, your payment won't be submitted and you will have to start over."
          cancelDescription="Stay on the premium payment page"
          title="Leave payment?"
        />{' '}
        to add. If you're not seeing the account you want to pay with, give us a
        call at <CarrierPhoneNumber />.
      </p>
    </div>
  );
};
