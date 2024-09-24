import { ReactNode } from 'react';

import EverlyLogo from '@/app/styles/everly/everly-logo.svg'; // TODO: don't hardcode to everly

import styles from './GenericInfoPage.module.css';
import everlyBanner from '@/app/styles/everly/assets/everly-hero-background.png';

export enum Brand {
  EVERLY = 'everly',
  WELLABE = 'wellabe',
}

interface Props {
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
  footer?: ReactNode;
  branding?: Brand;
}

interface Banner {
  img?: string;
  color?: string;
}

const brandingBanner: { [key in Brand]?: Banner } = {
  [Brand.EVERLY]: {
    img: `url(${everlyBanner})`,
    color: '#a9c7ff',
  },
  [Brand.WELLABE]: {
    img: undefined,
    color: '#EFC416',
  },
};

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

export const GenericInfoPage = ({
  title,
  description,
  action,
  footer,
  branding,
}: Props) => {
  const brandDetails = branding && brandingBanner[branding];
  const showBranding = branding && brandDetails?.img;

  return (
    <div className={styles.container}>
      {showBranding && (
        <div
          className={styles.banner}
          style={{
            backgroundImage: brandingBanner[branding]?.img,
            backgroundColor: brandingBanner[branding]?.color,
          }}
        />
      )}
      <div className={styles.scrollContainer}>
        <div className={styles.content}>
          {showBranding && (
            <div className={styles.logoContainer}>{logo(branding)}</div>
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
