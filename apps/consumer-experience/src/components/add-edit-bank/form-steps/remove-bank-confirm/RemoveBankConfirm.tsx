import { Button, Icon, IconType } from '@zinnia/bloom/components';
import { FC } from 'react';

import { AccountNumber } from '@/components/pii/AccountNumber';

import styles from './RemoveBankConfirm.module.css';

interface RemoveBankConfirmProps {
  bankNickname?: string;
  accountNumber?: string;
  cancelCallback: () => void;
  confirmCallback: () => void;
}

export const RemoveBankConfirm: FC<RemoveBankConfirmProps> = ({
  bankNickname,
  accountNumber,
  confirmCallback,
  cancelCallback,
}) => {
  return (
    <div className={styles.wrapper}>
      <Icon
        type={IconType.CIRCLE_QUESTION}
        className={styles.infoIcon}
        width={50}
        height={50}
      />
      <h3 className="typography-desktop-headline-3-d">Remove account?</h3>
      <p className="typography-content-body">
        You will not longer be able to use{' '}
        <span className="typography-content-body-bold">
          {bankNickname} ending in{' '}
          <AccountNumber accountNumber={accountNumber} />
        </span>{' '}
        for payments.
      </p>
      <div className={styles.buttonContainer}>
        <Button
          onClick={confirmCallback}
          className={styles.remove}
          mode="error"
        >
          Remove account
        </Button>
        <Button onClick={cancelCallback} className={styles.cancel} mode="link">
          Cancel
        </Button>
      </div>
    </div>
  );
};
