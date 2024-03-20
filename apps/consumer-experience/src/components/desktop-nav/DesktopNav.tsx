'use client';
import { Icon, IconType } from '@zinnia/bloom/internal/components';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import LogoImage from '@/app/styles/everly/everly-logo.svg';
import useMock from '@/hooks/use-mock';

import styles from './DesktopNav.module.css';

export function DesktopNav() {
  const params = useParams<{ planCode: string; policyNumber: string }>();
  const { mockHref, mockText, showMockLink } = useMock();

  return (
    <nav className={styles.container}>
      <Link href="/" className="justify-self-start">
        <LogoImage alt="Company Logo" className={styles.logo}></LogoImage>
      </Link>

      <div className={`${styles.navItemsContainer} typography-nav-links-sm`}>
        {showMockLink && (
          <a href={mockHref} className={styles.navItem}>
            <Icon type={IconType.ALERT_EXCLAMATION} />
            {mockText}
          </a>
        )}
        <Link href="#" className={styles.navItem}>
          <Icon type={IconType.DOCUMENT_TEXT} />
          Documents
        </Link>
        <Link
          href={`/policies/${params.planCode}/policy/${params.policyNumber}/profile`}
          className={styles.navItem}
        >
          <Icon type={IconType.CIRCLE_USER} />
          Profile
        </Link>
        <a
          href="/api/auth/logout"
          className={`${styles.navItem} ${styles.signOut}`}
        >
          Sign out
        </a>
      </div>
    </nav>
  );
}
