'use client';

import { Icon, IconType } from '@zinnia/bloom/internal/components';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import LogoImage from '@/app/styles/everly/everly-logo.svg';

import styles from './DesktopNav.module.css';
import { DevMenu } from '../dev-menu/DevMenu';

export function DesktopNav() {
  const params = useParams<{ planCode: string; policyNumber: string }>();

  return (
    <nav className={styles.container}>
      <div className={styles.logoContainer}>
        <DevMenu />
        <Link href="/" className="justify-self-start">
          <LogoImage alt="Company Logo" className={styles.logo}></LogoImage>
        </Link>
      </div>

      <div className={`${styles.navItemsContainer} typography-nav-links-sm`}>
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
