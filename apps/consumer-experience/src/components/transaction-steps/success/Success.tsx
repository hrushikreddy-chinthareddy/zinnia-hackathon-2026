import { Icon, IconType } from '@zinnia/bloom/components';
import { FC } from 'react';

import { Button } from '@/components/button/Button';

import styles from '../transaction-steps.module.css';
interface SuccessProps {
  successTitle: string;
  successMessage: string;
  closeCallback: () => void;
}

export const Success: FC<SuccessProps> = ({
  successTitle,
  successMessage,
  closeCallback,
}) => {
  const successHtml = { __html: `${successMessage}` };
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <Icon
            width={50}
            height={50}
            className={styles.success}
            type={IconType.CIRCLE_CHECKMARK}
          />
        </div>
        <h3 className="typography-desktop-headline-3-d">{successTitle}</h3>
      </div>
      <p className={styles.message} dangerouslySetInnerHTML={successHtml} />
      <Button expand onClick={closeCallback} className={styles.close}>
        Close
      </Button>
    </div>
  );
};
