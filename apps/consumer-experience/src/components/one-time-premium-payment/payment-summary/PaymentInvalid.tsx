import { Icon, IconType, Link } from '@zinnia/bloom/components';

import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';

import styles from '../OneTimePremiumPayment.module.css';

export const PaymentInvalid = ({ goToUrl }: { goToUrl: string }) => {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className={styles.errorMessageContainer}>
        <Icon
          width={50}
          height={50}
          type={IconType.ALERT_EXCLAMATION}
          color="var(--color-status-icon-status-error-icon)"
        />
        <h3 className="typography-desktop-headline-3-d mb-lg">
          Sorry, that didn't work
        </h3>

        <p className="typography-content-body">
          The payment you are trying to make is invalid. Please contact support
          at{' '}
          <a href={`tel:${EVERLY_CONTACT_PHONE_NUMBER}`}>
            {EVERLY_CONTACT_PHONE_NUMBER}
          </a>{' '}
          for more information.
        </p>
        <Link className="mt-2xl" variant="button" text="Close" href={goToUrl} />
      </div>
    </div>
  );
};
