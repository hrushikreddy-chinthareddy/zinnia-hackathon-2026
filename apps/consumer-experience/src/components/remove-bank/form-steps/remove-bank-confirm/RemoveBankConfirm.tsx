import { Icon, IconType } from '@zinnia/bloom/components';
import { FC } from 'react';

import { AccountNumber } from '@/components/pii/AccountNumber';

import styles from './RemoveBankConfirm.module.css';
import { Button } from '@/components/button/Button';

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
        color="var(--color-semantics-color-semantic-information, #005fed)"
      />
      <h3 className="typography-desktop-headline-3-d">Remove account?</h3>
      <p>
        You will not longer be able to use{' '}
        <span className="typography-content-body-sm-bold">
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
