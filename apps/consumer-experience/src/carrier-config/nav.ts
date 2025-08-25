import { CarrierLogos, CarrierName } from '@zinnia/bloom/components';

import { CARRIER_REDIRECT_URLS } from '@/carrier-config/urls';
import styles from '@/components/nav/Nav.module.css';
import { CompanyName } from '@/types/carriers';

type NavCarrierConfig = {
  homePageHref: string;
  hrefAriaLabel: string;
  image:
    | React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    | React.FunctionComponent<React.SVGProps<SVGImageElement>>
    | React.FunctionComponent<React.ImgHTMLAttributes<HTMLImageElement>>;
  logoProps: {
    className?: string;
    width?: string;
    height?: string;
    color?: string;
    fill?: string;
    title?: string;
  };
};

export const navCarrierConfig: Record<CompanyName, NavCarrierConfig> = {
  [CompanyName.ZINNIA]: {
    homePageHref: '/',
    hrefAriaLabel: 'Home Page',
    image: CarrierLogos[CarrierName.ZINNIA],
    logoProps: {
      title: 'Zinnia Logo',
      height: '32px',
      width: '115px',
      className: styles.logoZinnia,
    },
  },
  [CompanyName.EVERLY]: {
    homePageHref: '/',
    hrefAriaLabel: 'Home Page',
    image: CarrierLogos[CarrierName.EVERLY_ALT],
    logoProps: {
      title: 'Everly Logo',
      height: '32px',
      width: '115px',
      className: styles.logoEverly,
    },
  },
  [CompanyName.SECURITY_BENEFIT]: {
    homePageHref: '/',
    hrefAriaLabel: 'Home Page',
    image: CarrierLogos[CarrierName.SECURITY_BENEFIT],
    logoProps: {
      title: 'Security Benefit Logo',
      height: '32px',
    },
  },
  [CompanyName.WELLABE]: {
    homePageHref: '/',
    hrefAriaLabel: 'Home Page',
    image: CarrierLogos[CarrierName.WELLABE],
    logoProps: {
      title: 'Wellabe Logo',
      height: '32px',
      color: 'var(--color-primary-color-primary)',
      fill: 'var(--color-primary-color-primary)',
    },
  },
  [CompanyName.FARMERS]: {
    homePageHref: CARRIER_REDIRECT_URLS[CarrierName.FARMERS].POLICY_SUMMARY,
    hrefAriaLabel: 'Return to all Farmers policies',
    image: CarrierLogos[CarrierName.FARMERS],
    logoProps: {
      title: 'Farmers Logo',
      height: '32px',
    },
  },
  [CompanyName.EVERGLADES]: {
    homePageHref: '/',
    hrefAriaLabel: 'Go back to home',
    image: CarrierLogos[CarrierName.EVERGLADES],
    logoProps: {
      title: 'Everglades Logo',
      height: '32px',
    },
  },
};
