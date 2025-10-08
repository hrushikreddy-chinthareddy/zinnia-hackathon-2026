import { Icon, IconType } from '@zinnia/bloom/components';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { CorrelationId } from '@/components/correlation-id/CorrelationId';
import { Link } from '@/components/link/Link';
import styles from '@/components/one-time-premium-payment/OneTimePremiumPayment.module.css';

export const TransactionInvalid = ({
  goToUrl,
  message = 'The transaction you are trying to make is invalid.',
  correlationId,
}: {
  goToUrl: string;
  message?: string;
  correlationId?: string;
}) => {
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

        <p>{message}</p>
        <p>
          Please contact support at <CarrierPhoneNumber /> for more information.
        </p>
        <Link
          className="mt-2xl"
          variant="button"
          text="Back to overview"
          href={goToUrl}
        />
        {correlationId && <CorrelationId id={correlationId} />}
      </div>
    </div>
  );
};
