import clsx from 'clsx';
import './footer.css';

export interface Props {
  hasBorder?: boolean;
}

export const Footer = ({ hasBorder }: Props) => {
  const phone = 18002322222;
  return (
    <div
      className={clsx('consumer-footer', {
        'consumer-footer--border': hasBorder,
      })}
    >
      <p
        className="typography-content-body-bold"
        style={{ color: 'var(--Base-Text-text-primary, #212121)' }}
      >
        Call {/* TODO: create function to format this */}
        <a href={`tel:+${phone}`} className="typography-nav-links-inline">
          1-800-232-2222
        </a>{' '}
        to add or make changes
      </p>
      <p className="typography-content-footer-legal">
        This data is provided for informational purposes only, and is not
        intended to provide advice, nor should it be construed as an offer to
        sell, a solicitation of an offer to buy, or a recommendation for
        financial products.
      </p>
      <p className="typography-content-footer-legal">
        Copyright <span>{new Date().getFullYear()}</span>. All Rights Reserved.
      </p>
      <p className="typography-content-footer-legal">
        By using this website, you agree to the terms and conditions outlined in
        our{' '}
        <a
          href="https://zinnia.com/terms-of-use/"
          className="consumer-footer__link"
        >
          Terms of Use
        </a>{' '}
        and{' '}
        <a
          href="https://zinnia.com/privacy-policy/"
          className="consumer-footer__link"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};
