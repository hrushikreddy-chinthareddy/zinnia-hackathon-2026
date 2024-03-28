/* eslint-disable check-file/filename-naming-convention */
import { Icon, IconType, Link } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import styles from '@/components/generic-info-page/GenericInfoPage.module.css';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Not found',
};

export default async function NotFound() {
  return (
    <GenericInfoPage
      title={
        <div className={styles.headerContainer}>
          <Icon width={32} height={32} type={IconType.FROWN} />
          <h1>Page Not Found</h1>
        </div>
      }
      description="Hm, looks like you took a wrong turn somewhere. Let’s get you backto your coverage."
      action={
        <Link
          variant="button"
          href="/policies"
          text="Back to Policy Overview"
          style={{ width: '100%' }}
        />
      }
      footer={<Footer showAction={false} style={{ marginTop: 0 }} />}
    />
  );
}
