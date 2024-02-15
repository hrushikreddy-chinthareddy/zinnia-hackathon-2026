import { Metadata } from 'next';
import Image from 'next/image';

import heroImage from '@/app/styles/everly/everly-hero-background.png'; // TODO: don't hardcode to everly
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
      <div className={styles.carrierMarketingImage}>
        <Image
          priority={true}
          width="346"
          height="168" // TODO: remove magic numbers
          className=""
          src={heroImage}
          alt="Company hero image"
        />
      </div>
      <div className={styles.content}>
        {/* TODO: move this to class */}
        <div style={{ width: '424px' }}>
          <div className={styles.logo}>
            <LogoImage alt="Company Logo" />
          </div>
          <h1>Let's get you signed in.</h1>
          <p>
            Access your coverage easily and securely by signing in with a
            verification code.
          </p>
          <a href="/api/auth/login">Get code</a>
          <div className="typography-content-footer-legal">
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
