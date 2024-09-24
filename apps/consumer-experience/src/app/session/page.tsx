import { Icon, IconType, Link } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import styles from '@/components/generic-info-page/GenericInfoPage.module.css';
import { THEME_COOKIE } from '@/utils/serverClientUtils';
import { getCookie } from '@/utils/auth';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Session timeout',
};

export default async function Session() {
  const themeCookie = await getCookie(THEME_COOKIE);

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
      footer={<Footer />}
    />
  );
}
