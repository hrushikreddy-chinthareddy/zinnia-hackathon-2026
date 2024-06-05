import { Icon, IconType } from '@zinnia/bloom/internal/components';
import clsx from 'clsx';

import styles from './Footer.module.css';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  hasBorder?: boolean;
}

export const Footer = ({ hasBorder, style, className }: Props) => {
  const legalLink = (text: string, url: string) => {
    return (
      <a
        href={url}
        className={`${styles.link} mx-xs`}
        target="_blank"
        rel="noreferrer"
        style={{ display: 'inline-block' }}
      >
        <span className="sr-only">Link will open in a new window</span>
        <span className="flex-center" style={{ gap: '2px' }}>
          {text}
          <Icon type={IconType.EXTERNAL_LINK} small />
        </span>
      </a>
    );
  };

  return (
    <div
      className={clsx(
        styles.consumerFooter,
        {
          [styles.border as string]: hasBorder,
        },
        className
      )}
      style={style}
    >
      <p className="typography-content-footer-legal">
        This data is provided for informational purposes only, and is not
        intended to provide advice, nor should it be construed as an offer to
        sell, a solicitation of an offer to buy, or a recommendation for
        financial products.
      </p>
      <p className="typography-content-footer-legal">
        &copy; <span>{new Date().getFullYear()}</span> Zinnia Tech Solutions
        LLC. All Rights Reserved.
      </p>
      <p className="typography-content-footer-legal">
        By using this website, you agree to the terms and conditions outlined in
        our{legalLink('Terms of Use', 'https://zinnia.com/terms-of-use/')}and
        {legalLink('Privacy Policy', 'https://zinnia.com/privacy/')}.
      </p>
    </div>
  );
};
