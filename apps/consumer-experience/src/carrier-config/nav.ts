import { CarrierLogos, CarrierName } from '@zinnia/bloom/components';

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
  [CarrierName.EVERLY]: {
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
  [CarrierName.WELLABE]: {
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
  [CarrierName.FARMERS]: {
    homePageHref: `${process.env.SSO_FARMERS_REDIRECT_BASE_URL}/policysummary`,
    hrefAriaLabel: 'Go back to Farmers or w/e',
    image: CarrierLogos[CarrierName.FARMERS],
    logoProps: {
      title: 'Farmers Logo',
      height: '32px',
    },
  },
};
