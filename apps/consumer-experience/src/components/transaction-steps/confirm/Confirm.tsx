import { Button, Icon, IconType } from '@zinnia/bloom/components';
import { FC } from 'react';

import { ButtonWithAnalytics } from '@/components/button-with-analytics/ButtonWithAnalytics';

import styles from './Confirm.module.css';
interface ConfirmProps {
  confirmTitle: string;
  confirmMessage?: string;
  confirmButtonText: string;
  confirmCallback: () => void;
  correlationId?: string;
  denyCallback: () => void;
}
export const Confirm: FC<ConfirmProps> = ({
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
      <ButtonWithAnalytics
        onClick={confirmCallback}
        className={styles.confirmButton}
        mode="error"
        correlationId={correlationId}
      >
        {confirmButtonText}
      </ButtonWithAnalytics>
      <Button onClick={denyCallback} className={styles.close} mode="link">
        Cancel
      </Button>
    </div>
  );
};
