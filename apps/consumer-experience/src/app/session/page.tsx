import { Icon, IconType } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import LogoImage from '@/app/styles/everly/everly-logo.svg'; // TODO: don't hardcode to everly

import styles from '../login/Login.module.css';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Session timeout',
};

export default async function Session() {
  return (
    <div className={styles.container}>
      <div className={styles.carrierMarketingImage} />
      <div className={styles.contentContainer}>
        <div className={styles.content}>
          <div className={styles.logoContainer}>
            <LogoImage alt="Company Logo" />
          </div>
          <div className={styles.details}>
            <div className={styles.headerContainer}>
              <Icon width={32} height={32} type={IconType.CLOCK} />
              <h1>Timed out</h1>
            </div>
            <p className="typography-content-body">
              You’ve been signed out due to inactivity.
            </p>
          </div>
          <div className={styles.actionContainer}>
            <a
              href="/login"
              className={`${styles.buttonLink} typography-buttons-button-lg`}
            >
              Back to login
            </a>
          </div>
          <div className={`typography-content-footer-legal ${styles.footer}`}>
            <p className="mb-lg">
              You are receiving this message to keep you updated on your Everly
              account. Together we are committed to designing tools that give
              you more control over your account details and preferences. Learn
              more about Zinnia at zinnia.com.
            </p>
            <p className="mb-lg">
              We care about your privacy. Learn more about the Everly privacy
              policy. To customize your notifications, you can manage your
              preferences or unsubscribe.
            </p>
            <p>© 2024 Zinnia 5801 SW Sixth Ave. Topeka, KS 66636</p>
          </div>
        </div>
      </div>
    </div>
  );
}
