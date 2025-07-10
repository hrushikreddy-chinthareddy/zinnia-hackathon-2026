import { Icon, IconType } from '@zinnia/bloom/components';
import { FC } from 'react';

import { Button } from '@/components/button/Button';

import styles from '../transaction-steps.module.css';
interface ConfirmProps {
  confirmTitle: string;
  confirmExpand?: boolean;
  confirmMessage?: string | React.ReactNode;
  confirmButtonText: string;
  confirmCallback: () => void;
  correlationId?: string;
  denyCallback: () => void;
}
export const Confirm: FC<ConfirmProps> = ({
  confirmExpand = false,
  confirmTitle,
  confirmMessage,
  confirmButtonText,
  confirmCallback,
  correlationId,
  denyCallback,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <Icon
            width={50}
            height={50}
            className={styles.info}
            type={IconType.CIRCLE_QUESTION}
          />
        </div>
        <h3 className="typography-desktop-headline-3-d">{confirmTitle}</h3>
      </div>
      {confirmMessage && <p className={styles.message}>{confirmMessage}</p>}
      <Button
        expand={confirmExpand}
        onClick={confirmCallback}
        mode="error"
        correlationId={correlationId}
      >
        {confirmButtonText}
      </Button>
      <Button onClick={denyCallback} mode="link">
        Cancel
      </Button>
    </div>
  );
};
