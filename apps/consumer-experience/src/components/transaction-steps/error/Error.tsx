import { Icon, IconType } from '@zinnia/bloom/components';
import { FC, ReactNode } from 'react';

import { Button } from '@/components/button/Button';
import { CorrelationId } from '@/components/correlation-id/CorrelationId';

import styles from '../transaction-steps.module.css';
interface ErrorProps {
  errorTitle: string;
  errorMessage: ReactNode;
  isServerError?: boolean;
  closeCallback: () => void;
  correlationId?: string;
}
export const Error: FC<ErrorProps> = ({
  errorTitle,
  errorMessage,
  isServerError,
  closeCallback,
  correlationId,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Icon
          className={styles.error}
          width={50}
          height={50}
          type={isServerError ? IconType.COG : IconType.ALERT_EXCLAMATION}
        />
        <h3 className="typography-desktop-headline-3-d">{errorTitle}</h3>
      </div>
      <p className={styles.message}> {errorMessage}</p>
      <Button expand onClick={closeCallback} className={styles.close}>
        Close
      </Button>
      {correlationId && <CorrelationId id={correlationId} />}
    </div>
  );
};
