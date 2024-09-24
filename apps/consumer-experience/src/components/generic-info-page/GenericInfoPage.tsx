import { ReactNode } from 'react';

import EverlyLogo from '@/app/styles/everly/everly-logo.svg'; // TODO: don't hardcode to everly

import styles from './GenericInfoPage.module.css';
import clsx from 'clsx';
import { CompanyName } from '@/types/carriers';
import { THEME_COOKIE } from '@/utils/serverClientUtils';
import { getCookie } from '@/utils/auth';

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
      return null;
    default:
      return null;
  }
};

// If there's a new company AND you have the branding available, add a key/value here
const themeClasses = {
  [CompanyName.EVERLY]: styles.everly,
  [CompanyName.WELLABE]: styles.wellabe,
};

export const GenericInfoPage = async ({
  title,
  description,
  action,
  footer,
}: Props) => {
  const themeCookie = await getCookie(THEME_COOKIE);
  // In most cases this won't matter since if the subdomain isn't set up, the whole site won't work
  // but there may be a case where there is a subdomain, but we don't have the branding for it, so only want to add the classes
  // if we have the available branding (in themeClasses above) otherwise show the generic page
  const showBranding =
    themeCookie &&
    Object.keys(themeClasses).includes(themeCookie as CompanyName);
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
            <div className={styles.logoContainer}>
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
