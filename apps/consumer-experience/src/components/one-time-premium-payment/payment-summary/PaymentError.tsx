import { Icon, IconType } from '@zinnia/bloom/components';

import styles from '../OneTimePremiumPayment.module.css';
import { Link } from '@/components/link/Link';

export const PaymentError = ({ goToUrl }: { goToUrl: string }) => {
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
          Services are down, so we couldn’t submit your payment. Please try
          again later.
        </p>
        <Link className="mt-2xl" variant="button" text="Close" href={goToUrl} />
      </div>
    </div>
  );
};
