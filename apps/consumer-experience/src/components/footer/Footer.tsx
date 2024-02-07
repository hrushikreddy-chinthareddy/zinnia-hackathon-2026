import clsx from 'clsx';
import './footer.css';

export interface Props {
  hasBorder?: boolean;
}

export const Footer = ({ hasBorder }: Props) => {
  return (
    <div
      className={clsx('consumer-footer', {
        'consumer-footer--border': hasBorder,
      })}
    >
      <p className="typographyContentFooterLegal">
        This data is provided for informational purposes only, and is not
        intended to provide advice, nor should it be construed as an offer to
        sell, a solicitation of an offer to buy, or a recommendation for
        financial products.
      </p>
      <p className="typographyContentFooterLegal">
        Copyright <span>{new Date().getFullYear()}</span>. All Rights Reserved.
      </p>
      <p className="typographyContentFooterLegal">
        By using this website, you agree to the terms and conditions outlined in
        our{' '}
        <a href="#" className="consumer-footer__link">
          Terms of Use
        </a>{' '}
        and{' '}
        <a href="#" className="consumer-footer__link">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};
