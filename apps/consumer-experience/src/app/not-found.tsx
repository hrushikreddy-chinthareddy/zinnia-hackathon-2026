/* eslint-disable check-file/filename-naming-convention */
import { Icon, IconType, Link } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import styles from '@/components/generic-info-page/GenericInfoPage.module.css';
import { getSession } from '@/utils/auth';
import { ROOT_URL_PATH } from '@/types';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Not found',
};

export default async function NotFound() {
  const session = await getSession();
  const isAuthenticated = !!session;
  const route = isAuthenticated ? ROOT_URL_PATH : '/';
  const text = isAuthenticated ? 'Back to Overview' : 'Back to home';

  return (
    <GenericInfoPage
      title={
        <div className={styles.headerContainer}>
          <Icon width={32} height={32} type={IconType.FROWN} />
          <div>Page Not Found</div>
        </div>
      }
      description="Hm, looks like you took a wrong turn somewhere. Let’s get you back to your coverage."
      action={
        <Link
          variant="button"
          href={route}
          text={text}
          style={{ width: '100%' }}
        />
      }
      footer={<Footer style={{ marginTop: 0 }} />}
    />
  );
}
