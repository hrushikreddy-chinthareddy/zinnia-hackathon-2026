import { Button } from '@zinnia/bloom/components';

import { Icon } from '@zinnia/bloom/components';

import { IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import styles from './Success.module.css';

export const Success = ({
  message,
  action,
  onClose,
}: {
  message: string;
  action?: React.ReactNode;
  onClose?: () => void;
}) => {
  return (
    <div className={clsx(`card-container`, styles.successContainer)}>
      <div className={styles.successMessage}>
        <Icon
          type={IconType.CIRCLE_CHECKMARK}
          width={50}
          height={50}
          color="green"
        />
        <h3>Submitted!</h3>
        <span>{message}</span>
      </div>
      <div className={styles.successButtons}>
        {action}
        {onClose && (
          <Button mode="link" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </div>
  );
};
