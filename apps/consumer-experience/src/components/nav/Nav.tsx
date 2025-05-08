import { navCarrierConfig } from '@/carrier-config/nav';
import { Link } from '@/components/link/Link';
import { getMyPoliciesByCarrier } from '@/services';
import { getFeatureFlags } from '@/services/feature-flags';
import { CompanyName } from '@/types/carriers';
import {
  baseExperienceCarriers,
  getCarrierListDetails,
} from '@/utils/carriers';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import styles from './Nav.module.css';
import { DevMenu } from '../dev-menu/DevMenu';
import { NavMenu } from '../nav-menu/NavMenu';

export async function Nav({
  userName,
  themeCookie,
}: {
  planCode: string;
  policyNumber: string;
  userName: { firstName?: string; lastName?: string };
  themeCookie: CompanyName;
}) {
  const featureFlagDecisions = await getFeatureFlags();
  let carrierDetails;
  if (featureFlagDecisions?.[FEATURE_FLAGS.ANNUITY_MODE]) {
    const { data: policyData, error } = await getMyPoliciesByCarrier(
      baseExperienceCarriers
    );

    if (!error && policyData) {
      carrierDetails = getCarrierListDetails(policyData);
    }
  }

  const carrierConfig =
    navCarrierConfig[themeCookie] ?? navCarrierConfig[CompanyName.ZINNIA];

  const CarrierLogo = carrierConfig.image;

  return (
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
      <NavMenu userName={userName} carrierPolicyDetails={carrierDetails} />
    </nav>
  );
}
