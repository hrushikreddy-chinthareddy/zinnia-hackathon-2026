import Link from 'next/link';

import EverlyLogoImage from '@/app/styles/everly/everly-logo.svg';
import WellabeLogoImage from '@/app/styles/wellabe/assets/wellabe-logo.svg';
import { getMyPoliciesByCarrier } from '@/services';
import { getFeatureFlags } from '@/services/feature-flags';
import { CompanyName } from '@/types/carriers';
import { CarrierId } from '@/types/policy';
import { getCarrierListDetails } from '@/utils/carriers';
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
    const { data: policyData, error } = await getMyPoliciesByCarrier([
      CarrierId.ELIC,
      CarrierId.SBUL,
      'WELB',
    ]);

    if (!error && policyData) {
      carrierDetails = getCarrierListDetails(policyData);
    }
  }

  const carrierNavLogo = () => {
    if (themeCookie === CompanyName.EVERLY) {
      return (
        <EverlyLogoImage
          alt="Everly Logo"
          width="200px"
          height="32px"
          className={styles.logoEverly}
        />
      );
    }
    if (themeCookie === CompanyName.WELLABE) {
      return (
        <WellabeLogoImage
          alt="Everly Logo"
          width="auto"
          height="32px"
          color="var(--color-primary-color-primary)"
          fill="var(--color-primary-color-primary)"
        />
      );
    }

    return null;
  };

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
          {carrierNavLogo()}
        </Link>
      </div>
      <NavMenu userName={userName} carrierPolicyDetails={carrierDetails} />
    </nav>
  );
}
