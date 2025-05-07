import { Icon, IconType } from '@zinnia/bloom/components';
import { FC } from 'react';

import { Button } from '@/components/button/Button';

import styles from './Success.module.css';
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
  return (
    <div className={styles.wrapper}>
      <Icon
        width={50}
        height={50}
        className={styles.successIcon}
        type={IconType.CIRCLE_CHECKMARK}
      />
      <h3 className="typography-desktop-headline-3-d">{successTitle}</h3>
      <p className="typography-content-body">{successMessage}</p>
      <Button onClick={closeCallback} className={styles.close}>
        Close
      </Button>
    </div>
  );
};
