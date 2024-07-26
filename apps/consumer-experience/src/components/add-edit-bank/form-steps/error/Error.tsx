import { Button, Icon, IconType } from '@zinnia/bloom/components';
import { FC, ReactNode } from 'react';

import styles from './Error.module.css';
interface ErrorProps {
  errorTitle: string;
  errorMessage: ReactNode;
  closeCallback: () => void;
}
export const Error: FC<ErrorProps> = ({
  errorTitle,
  errorMessage,
  closeCallback,
}) => {
  return (
    <div className={styles.wrapper}>
      <Icon
        className={styles.errorIcon}
        width={50}
        height={50}
        type={IconType.ALERT_EXCLAMATION}
      />
      <h3 className="typography-desktop-headline-3-d">{errorTitle}</h3>

      <p className="typography-content-body"> {errorMessage}</p>
      <Button onClick={closeCallback} className={styles.close}>
        Close
      </Button>
    </div>
  );
};
