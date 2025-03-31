import { Button, Icon, IconType } from '@zinnia/bloom/components';

import clsx from 'clsx';
import styles from './TransactionResponseCard.module.css';

export const TransactionResponseCard = ({
  message,
  action,
  onClose,
  icon,
  title,
}: {
  message: string;
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
}) => {
  return (
    <div className={clsx(`card-container`, styles.container)}>
      <div className={styles.message}>
        {icon}
        <h3>{title}</h3>
        <span>{message}</span>
      </div>
      <div className={styles.buttons}>
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

export const Error = ({
  message,
  onClose,
  action,
}: {
  message: string;
  onClose?: () => void;
  action?: React.ReactNode;
}) => (
  <TransactionResponseCard
    message={message}
    title="Error"
    icon={
      <Icon
        type={IconType.ALERT_EXCLAMATION}
        width={50}
        height={50}
        color="red"
      />
    }
    onClose={onClose}
    action={action}
  />
);

export const Success = ({
  message,
  onClose,
  action,
}: {
  message: string;
  onClose?: () => void;
  action?: React.ReactNode;
}) => (
  <TransactionResponseCard
    message={message}
    title="Success"
    icon={
      <Icon
        type={IconType.CIRCLE_CHECKMARK}
        width={50}
        height={50}
        color="green"
      />
    }
    onClose={onClose}
    action={action}
  />
);
