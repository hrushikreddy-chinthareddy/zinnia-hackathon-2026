import { Metadata } from 'next';

import LogoImage from '@/app/styles/everly/everly-logo.svg'; // TODO: don't hardcode to everly

import styles from './Login.module.css';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Login page',
};

export default function Login() {
  return (
    <div className={styles.container}>
      <div className={styles.carrierMarketingImage} />
      <div className={styles.contentContainer}>
        <div className={styles.content}>
          <div className={styles.logoContainer}>
            <LogoImage alt="Company Logo" />
          </div>
          <div className={styles.details}>
            <h1 className="mb-lg">Let's get you signed in.</h1>
            <p className="typography-content-body">
              Access your coverage easily and securely by signing in with a
              verification code.
            </p>
          </div>
          <div className={styles.actionContainer}>
            <a
              href="/api/auth/login"
              className={`${styles.buttonLink} typography-buttons-button-lg`}
            >
              Get code
            </a>
          </div>
          <div className={`typography-content-footer-legal ${styles.footer}`}>
            <p>
              You are receiving this message to keep you updated on your Everly
              account. Together we are committed to designing tools that give
              you more control over your account details and preferences. Learn
              more about Zinnia at zinnia.com. We care about your privacy. Learn
              more about the Everly privacy policy. To customize your
              notifications, you can manage your preferences or unsubscribe.
            </p>
            <p>© 2024 Zinnia 5801 SW Sixth Ave. Topeka, KS 66636</p>
          </div>
        </div>
      </div>
    </div>
  );
}
