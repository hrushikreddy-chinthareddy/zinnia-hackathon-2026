'use client';

import { Icon, IconType } from '@zinnia/bloom/internal/components';
import Link from 'next/link';

import LogoImage from '@/app/styles/everly/everly-logo.svg';
import useMock from '@/hooks/use-mock';
import { isMockAllowed } from '@/utils';

import styles from './DesktopNav.module.css';
import { DevMenu } from '../dev-menu/DevMenu';

export function DesktopNav() {
  const { isMockOn } = useMock();

  return (
    <nav className={styles.container}>
      <div className={styles.logoContainer}>
        <DevMenu />
        <Link href="/" className="justify-self-start" aria-label="Home page">
          <LogoImage alt="Everly Logo" className={styles.logo}></LogoImage>
        </Link>
        {isMockAllowed() && isMockOn && (
          <span
            className={styles.navItem}
            style={{
              color: 'var(--color-status-text-status-error-text',
              fontWeight: 'bold',
            }}
          >
            Mock is on
          </span>
        )}
      </div>

      <div className={`${styles.navItemsContainer} typography-nav-links-sm`}>
        <>
          <Link href={`/policies`} className={styles.navItem}>
            <Icon
              type={IconType.MATCHES}
              color="var(--color-base-icon-icon-dark)"
            />
            My Policies
          </Link>
        </>
        <Link href={`/my-account`} className={styles.navItem}>
          <Icon
            type={IconType.CIRCLE_USER}
            color="var(--color-base-icon-icon-dark)"
          />
          Account
        </Link>
        <a href="/api/logout" className={`${styles.navItem} ${styles.signOut}`}>
          Sign out
        </a>
      </div>
    </nav>
  );
}
