import { Icon, IconType } from '@zinnia/bloom/components';

import { Link } from '@/components/link/Link';

import styles from './Styles.module.css';

type PaymentErrorProps = {
  goToUrl: string;
  transactionType: string;
};

export const TransactionError = ({
  goToUrl,
  transactionType,
}: PaymentErrorProps) => {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className={styles.errorMessageContainer}>
        <Icon
          width={50}
          height={50}
          type={IconType.COG}
          color="var(--color-status-icon-status-error-icon)"
        />
        <h3 className="typography-desktop-headline-3-d">
          Sorry, that didn't work
        </h3>

        <p className="typography-content-body">
          Services are down, so we couldn’t submit your {transactionType}.
          Please try again later.
        </p>
        <Link
          className="mt-2xl"
          variant="button"
          text="Back to contract overview"
          href={goToUrl}
        />
      </div>
    </div>
  );
};
