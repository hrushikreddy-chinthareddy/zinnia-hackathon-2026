import clsx from 'clsx';
import { ReactNode } from 'react';

import EverlyLogo from '@/app/styles/everly/assets/everly-logo-new.svg';
import WellabeLogo from '@/app/styles/wellabe/assets/wellabe-logo.svg';
import { getFeatureFlags } from '@/services/feature-flags';
import { CompanyName } from '@/types/carriers';
import { getCookie } from '@/utils/auth';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { THEME_COOKIE } from '@/utils/serverClientUtils';

import styles from './GenericInfoPage.module.css';

interface Props {
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
  footer?: ReactNode;
}

const logo = (company: CompanyName) => {
  switch (company) {
    case CompanyName.EVERLY:
      return <EverlyLogo alt="Everly Logo" />;
    case CompanyName.WELLABE:
      return <WellabeLogo alt="Wellabe Logo" color="#ffc107" fill="#ffc107" />;
    default:
      return null;
  }
};

// If there's a new company AND you have the branding available, add a key/value here
const themeClasses = {
  [CompanyName.EVERLY]: styles.everly,
  [CompanyName.WELLABE]: styles.wellabe,
  [CompanyName.FARMERS]: styles.farmers,
};

export const GenericInfoPage = async ({
  title,
  description,
  action,
  footer,
}: Props) => {
  const featureFlagDecisions = await getFeatureFlags();
  let themeCookie = await getCookie(THEME_COOKIE);

  if (!featureFlagDecisions[FEATURE_FLAGS.ANNUITY_MODE]) {
    themeCookie = CompanyName.EVERLY;
  }
  // In most cases this won't matter since if the subdomain isn't set up, the whole site won't work
  // but there may be a case where there is a subdomain, but we don't have the branding for it, so only want to add the classes
  // if we have the available branding (in themeClasses above) otherwise show the generic page
  const showBranding =
    (themeCookie &&
      Object.keys(themeClasses).includes(themeCookie as CompanyName)) ||
    !featureFlagDecisions[FEATURE_FLAGS.ANNUITY_MODE];

  const brandingBannerClasses = clsx({
    [styles.banner as string]: showBranding,
    [themeClasses[themeCookie as CompanyName] as string]: showBranding,
  });

  return (
    <div className={styles.container}>
      {showBranding && <div className={brandingBannerClasses} />}
      <div className={styles.scrollContainer}>
        <div className={styles.content}>
          {showBranding && (
            <div
              className={clsx(
                styles.logoContainer,
                themeClasses[themeCookie as CompanyName]
              )}
            >
              {logo(themeCookie as CompanyName)}
            </div>
          )}
          <div className={styles.details}>
            <h1>{title}</h1>
            <p className="typography-content-body">{description}</p>
            <div className={styles.actionContainer}>{action}</div>
          </div>
          {footer && (
            <div className={`typography-content-footer-legal ${styles.footer}`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
