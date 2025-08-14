import { CarrierLogo, CarrierName } from '@zinnia/bloom/components';
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

interface CarrierConfig {
  logo: ReactNode;
  theme?: string;
  showBranding: boolean;
}

const getCarrierConfig = (carrier: CompanyName): CarrierConfig => {
  switch (carrier) {
    case CompanyName.EVERLY:
      return {
        logo: <EverlyLogo alt="Everly Logo" />,
        theme: styles.everly,
        showBranding: true,
      };
    case CompanyName.WELLABE:
      return {
        logo: <WellabeLogo alt="Wellabe Logo" color="#ffc107" fill="#ffc107" />,
        theme: styles.wellabe,
        showBranding: true,
      };
    case CompanyName.FARMERS:
      return {
        logo: (
          <CarrierLogo carrier={CarrierName.FARMERS} width={334} height={63} />
        ),
        theme: styles.farmers,
        showBranding: true,
      };
    case CompanyName.SECURITY_BENEFIT:
      return {
        logo: (
          <CarrierLogo
            carrier={CarrierName.SECURITY_BENEFIT}
            width={334}
            height={63}
          />
        ),
        theme: styles.securityBenefit,
        showBranding: true,
      };
    case CompanyName.EVERGLADES:
      return {
        logo: (
          <CarrierLogo
            carrier={CarrierName.EVERGLADES}
            width={334}
            height={63}
          />
        ),
        theme: styles.everglades,
        showBranding: true,
      };
    default:
      return {
        logo: null,
        theme: styles.zinnia,
        showBranding: false,
      };
  }
};

export const GenericInfoPage = async ({
  title,
  description,
  action,
  footer,
}: Props) => {
  const featureFlagDecisions = await getFeatureFlags();
  let themeCookie = (await getCookie(THEME_COOKIE)) as CompanyName;

  if (!featureFlagDecisions[FEATURE_FLAGS.ANNUITY_MODE]) {
    themeCookie = CompanyName.EVERLY;
  }

  const currentCarrierConfig = getCarrierConfig(themeCookie);

  // In most cases this won't matter since if the subdomain isn't set up, the whole site won't work
  // but there may be a case where there is a subdomain, but we don't have the branding for it, so only want to add the classes
  // if we have the available branding (in themeClasses above) otherwise show the generic page
  const showBranding =
    (themeCookie &&
      currentCarrierConfig &&
      currentCarrierConfig.showBranding) ||
    !featureFlagDecisions[FEATURE_FLAGS.ANNUITY_MODE];

  const brandingBannerClasses = clsx(
    showBranding &&
      currentCarrierConfig.theme && [styles.banner, currentCarrierConfig.theme],
    {
      [styles.banner as string]: showBranding && !!currentCarrierConfig.theme,
      [currentCarrierConfig.theme as string]:
        showBranding && !!currentCarrierConfig.theme,
    }
  );

  return (
    <div className={styles.container}>
      {showBranding && <div className={brandingBannerClasses} />}
      <div className={styles.scrollContainer}>
        <div className={styles.content}>
          {showBranding && (
            <div
              className={clsx(styles.logoContainer, currentCarrierConfig.theme)}
            >
              {currentCarrierConfig.logo}
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
