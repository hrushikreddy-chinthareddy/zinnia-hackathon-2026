import { Icon, IconType } from '@zinnia/bloom/components';
import { FC, ReactNode } from 'react';

import { Button } from '@/components/button/Button';

import styles from './Error.module.css';
interface ErrorProps {
  errorTitle: string;
  errorMessage: ReactNode;
  isServerError?: boolean;
  closeCallback: () => void;
}
export const Error: FC<ErrorProps> = ({
  errorTitle,
  errorMessage,
  isServerError,
  closeCallback,
}) => {
  return (
    <div className={styles.wrapper}>
      <Icon
        className={styles.errorIcon}
        width={50}
        height={50}
        type={isServerError ? IconType.COG : IconType.ALERT_EXCLAMATION}
      />
      <h3 className="typography-desktop-headline-3-d">{errorTitle}</h3>

      <p className="typography-content-body"> {errorMessage}</p>
      <Button onClick={closeCallback} className={styles.close}>
        Close
      </Button>
    </div>
  );
};
