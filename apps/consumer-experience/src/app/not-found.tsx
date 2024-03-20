/* eslint-disable check-file/filename-naming-convention */
import { Icon, IconType } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import LogoImage from '@/app/styles/everly/everly-logo.svg'; // TODO: don't hardcode to everly

import styles from './login/Login.module.css';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Not found',
};

export default async function NotFound() {
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
              <Icon width={32} height={32} type={IconType.FROWN} />
              <h1>Page Not Found</h1>
            </div>
            <p className="typography-content-body">
              Hm, looks like you took a wrong turn somewhere. Let’s get you back
              to your coverage.
            </p>
          </div>
          <div className={styles.actionContainer}>
            <a
              href="/policies"
              className={`${styles.buttonLink} typography-buttons-button-lg`}
            >
              Back to Policy Overview
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
