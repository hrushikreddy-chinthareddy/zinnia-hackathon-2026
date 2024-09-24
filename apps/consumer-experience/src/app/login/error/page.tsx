import { Icon, IconType, Link } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { Footer } from '@/components/footer/Footer';
import {
  Brand,
  GenericInfoPage,
} from '@/components/generic-info-page/GenericInfoPage';
import styles from '@/components/generic-info-page/GenericInfoPage.module.css';
import { THEME_COOKIE } from '@/utils/serverClientUtils';
import { getCookie } from '@/utils/auth';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Error',
};

export default async function ErrorPage() {
  const themeCookie = await getCookie(THEME_COOKIE);

  return (
    <GenericInfoPage
      title={
        <div className={styles.headerContainer}>
          <Icon width={32} height={32} type={IconType.COG} />
          <div>That didn't work.</div>
        </div>
      }
      description="We couldn't sign you in. Please try again."
      action={
        <>
          <div className="mb-3xl">
            <CallForAssistance
              callToAction="Still not working?"
              customInstruction="to get help."
            />
          </div>
          <Link expand variant="button" href="/login" text="Back to login" />
        </>
      }
      footer={<Footer />}
      branding={themeCookie as Brand}
    />
  );
}
