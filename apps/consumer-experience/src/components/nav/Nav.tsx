import Link from 'next/link';

import LogoImage from '@/app/styles/everly/everly-logo.svg';
import { getMyPoliciesByCarrier } from '@/services';
import { getFeatureFlags } from '@/services/feature-flags';
import { CarrierId } from '@/types/policy';
import { getCarrierListDetails } from '@/utils/carriers';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import styles from './Nav.module.css';
import { DevMenu } from '../dev-menu/DevMenu';
import { NavMenu } from '../nav-menu/NavMenu';

export async function Nav({
  userName,
}: {
  planCode: string;
  policyNumber: string;
  userName: { firstName?: string; lastName?: string };
}) {
  const featureFlagDecisions = await getFeatureFlags();
  let carrierDetails;
  if (featureFlagDecisions?.[FEATURE_FLAGS.ANNUITY_MODE]) {
    const { data: policyData, error } = await getMyPoliciesByCarrier([
      CarrierId.ELIC,
      CarrierId.SBUL,
      'WELB',
    ]);

    if (!error && policyData) {
      carrierDetails = getCarrierListDetails(policyData);
    }
  }

  return (
    <nav className={styles.container}>
      <div className={styles.logoContainer}>
        <DevMenu />

        <Link
          prefetch
          href="/"
          className="justify-self-start"
          aria-label="Home page"
        >
          <LogoImage alt="Everly Logo" className={styles.logo}></LogoImage>
        </Link>
      </div>
      <NavMenu userName={userName} carrierPolicyDetails={carrierDetails} />
    </nav>
  );
}
