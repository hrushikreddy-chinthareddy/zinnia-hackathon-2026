import { Icon, IconType } from '@zinnia/bloom/components';
import { FC, ReactNode } from 'react';

import { Button } from '@/components/button/Button';

import styles from './PaymentusSuccess.module.css';
import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';

interface SuccessProps {
  successTitle: string;
  successMessage: ReactNode;
  closeCallback: () => void;
}
export const PaymentusSuccess: FC<SuccessProps> = ({
  successTitle,
  successMessage,
  closeCallback,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className="flex-center stacked">
        <Icon
          width={50}
          height={50}
          className={styles.successIcon}
          type={IconType.CIRCLE_CHECKMARK}
        />
        <h3 className="typography-desktop-headline-3-d">{successTitle}</h3>
        <p>{successMessage}</p>
      </div>
      <div>
        <p>
          If you need assistance to make an immediate payment, call us at{' '}
          <CarrierPhoneNumber />
        </p>
      </div>
      <Button onClick={closeCallback} className={styles.close}>
        Close
      </Button>
    </div>
  );
};
