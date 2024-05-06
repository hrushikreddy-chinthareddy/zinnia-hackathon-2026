import { Icon, IconType, Link } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import styles from '@/components/generic-info-page/GenericInfoPage.module.css';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Session timeout',
};

export default async function Session() {
  return (
    <GenericInfoPage
      title={
        <div className={styles.headerContainer}>
          <Icon width={32} height={32} type={IconType.CLOCK} />
          <div>Timed out</div>
        </div>
      }
      description="You’ve been signed out due to inactivity."
      action={
        <Link expand variant="button" href="/login" text="Back to login" />
      }
      footer={
        <>
          <p className="mb-lg">
            You are receiving this message to keep you updated on your Everly
            account. Together we are committed to designing tools that give you
            more control over your account details and preferences. Learn more
            about Zinnia at zinnia.com.
          </p>
          <p className="mb-lg">
            We care about your privacy. Learn more about the Everly privacy
            policy. To customize your notifications, you can manage your
            preferences or unsubscribe.
          </p>
          <p>© 2024 Zinnia 600 Steamboat Road Greenwich, CT 06830</p>
        </>
      }
    />
  );
}
