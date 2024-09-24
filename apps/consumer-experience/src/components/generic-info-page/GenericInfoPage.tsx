import { ReactNode } from 'react';

import EverlyLogo from '@/app/styles/everly/everly-logo.svg'; // TODO: don't hardcode to everly

import styles from './GenericInfoPage.module.css';
import clsx from 'clsx';
import { Brand } from '@/types/carriers';
import { THEME_COOKIE } from '@/utils/serverClientUtils';
import { getCookie } from '@/utils/auth';

interface Props {
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
  footer?: ReactNode;
}

const logo = (brand: Brand) => {
  switch (brand) {
    case Brand.EVERLY:
      return <EverlyLogo alt="Everly Logo" />;
    case Brand.WELLABE:
      return null;
    default:
      return null;
  }
};

export const GenericInfoPage = async ({
  title,
  description,
  action,
  footer,
}: Props) => {
  const themeCookie = (await getCookie(THEME_COOKIE)) as Brand | undefined;
  const brandingBannerClasses = clsx(styles.banner, {
    [styles.everly as string]: themeCookie === Brand.EVERLY,
    [styles.wellabe as string]: themeCookie === Brand.WELLABE,
  });

  return (
    <div className={styles.container}>
      {themeCookie && <div className={brandingBannerClasses} />}
      <div className={styles.scrollContainer}>
        <div className={styles.content}>
          {themeCookie && (
            <div className={styles.logoContainer}>{logo(themeCookie)}</div>
          )}
          <div className={styles.details}>
            <h1>{title}</h1>
            <p className="typography-content-body">{description}</p>
            {/* TODO: figure out a way to make this black always */}
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
