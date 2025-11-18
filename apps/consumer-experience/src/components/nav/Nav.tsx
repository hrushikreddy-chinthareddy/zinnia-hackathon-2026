import { navCarrierConfig } from '@/carrier-config/nav';
import { Link } from '@/components/link/Link';
import { getFeatureFlags } from '@/services/feature-flags';
import { CompanyName } from '@/types/carriers';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import styles from './Nav.module.css';
import { NotificationIcon } from './NotificationIcon';
import { DevMenu } from '../dev-menu/DevMenu';
import { NavMenu } from '../nav-menu/NavMenu';
import { NotificationAlert } from '../notification-alert/NotificationAlert';

export async function Nav({
  planCode: _,
  policyNumber: __,
  themeCookie,
  userName,
}: {
  planCode: string;
  policyNumber: string;
  userName: { firstName?: string; lastName?: string };
  themeCookie: CompanyName;
}) {
  const flags = await getFeatureFlags();
  const carrierConfig =
    navCarrierConfig[themeCookie] ?? navCarrierConfig[CompanyName.ZINNIA];

  const CarrierLogo = carrierConfig.image;

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.logoContainer}>
          <DevMenu />
          <Link
            isInternal
            prefetch
            href={carrierConfig.homePageHref}
            className="justify-self-start"
            aria-label={carrierConfig.hrefAriaLabel}
          >
            <CarrierLogo {...carrierConfig.logoProps} data-testid="nav-logo" />
          </Link>
        </div>
        <div className={styles.account}>
          <NotificationIcon />
          <NavMenu userName={userName} />
        </div>
      </nav>
      {flags[FEATURE_FLAGS.NOTIFICATION_ALERT_BANNER] && (
        <div className={styles.notificationAlertContainer}>
          <NotificationAlert />
        </div>
      )}
    </>
  );
}
