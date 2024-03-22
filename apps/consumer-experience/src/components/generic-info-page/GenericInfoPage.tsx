import { ReactNode } from 'react';

import LogoImage from '@/app/styles/everly/everly-logo.svg'; // TODO: don't hardcode to everly

import styles from './GenericInfoPage.module.css';

interface Props {
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
  footer?: ReactNode;
}

export const GenericInfoPage = ({
  title,
  description,
  action,
  footer,
}: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.carrierMarketingImage} />
      <div className={styles.contentContainer}>
        <div className={styles.content}>
          <div className={styles.logoContainer}>
            <LogoImage alt="Company Logo" />
          </div>
          <div className={styles.details}>
            <h1 className="mb-lg">{title}</h1>
            <p className="typography-content-body">{description}</p>
          </div>
          <div className={styles.actionContainer}>{action}</div>
          <div className={`typography-content-footer-legal ${styles.footer}`}>
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
};
