'use client';
import { Icon, IconType } from '@zinnia/bloom/internal/components';
import Link from 'next/link';

import LogoImage from '@/app/styles/everly/everly-logo.svg';

import styles from './DesktopNav.module.css';

export function DesktopNav() {
  return (
    <nav className={styles.container}>
      <Link href="/" className="justify-self-start">
        <LogoImage alt="Company Logo" className={styles.logo}></LogoImage>
      </Link>

      <div className={`${styles.navItemsContainer} typography-nav-links-sm`}>
        <Link href="#" className={styles.navItem}>
          <Icon type={IconType.DOCUMENT_TEXT} />
          Documents
        </Link>
        <Link href="/profile" className={styles.navItem}>
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
