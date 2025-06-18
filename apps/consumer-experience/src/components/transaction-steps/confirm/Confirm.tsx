import { Icon, IconType } from '@zinnia/bloom/components';
import { FC } from 'react';

import { Button } from '@/components/button/Button';

import styles from './Confirm.module.css';
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
      <Icon
        width={50}
        height={50}
        className={styles.confirmIcon}
        type={IconType.CIRCLE_QUESTION}
      />
      <h3 className="typography-desktop-headline-3-d">{confirmTitle}</h3>
      {confirmMessage && (
        <p className="typography-content-body">{confirmMessage}</p>
      )}
      <Button
        expand={confirmExpand}
        onClick={confirmCallback}
        className={styles.confirmButton}
        mode="error"
        correlationId={correlationId}
      >
        {confirmButtonText}
      </Button>
      <Button onClick={denyCallback} className={styles.close} mode="link">
        Cancel
      </Button>
    </div>
  );
};
