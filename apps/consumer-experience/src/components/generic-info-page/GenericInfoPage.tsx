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
      <div className={styles.banner} />
      <div className={styles.scrollContainer}>
        <div className={styles.content}>
          <div className={styles.logoContainer}>
            {/* TODO: update alt text when this logo becomes dynamic */}
            <LogoImage alt="Everly Logo" />
          </div>
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
