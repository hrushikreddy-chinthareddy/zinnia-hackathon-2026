'use client';

import { Icon, IconType } from '@zinnia/bloom/internal/components';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import LogoImage from '@/app/styles/everly/everly-logo.svg';
import useMock from '@/hooks/use-mock';
import { isProd } from '@/utils';

import styles from './DesktopNav.module.css';
import { DevMenu } from '../dev-menu/DevMenu';

export function DesktopNav() {
  const params = useParams<{ planCode: string; policyNumber: string }>();
  const { isMockOn } = useMock();

  return (
    <nav className={styles.container}>
      <div className={styles.logoContainer}>
        <DevMenu />
        <Link href="/" className="justify-self-start">
          <LogoImage alt="Company Logo" className={styles.logo}></LogoImage>
        </Link>
        {!isProd() && isMockOn && (
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
        {params.planCode && params.policyNumber && (
          <>
            <Link
              href={`/policies/${params.planCode}/${params.policyNumber}`}
              className={styles.navItem}
            >
              <Icon
                type={IconType.SHIELD_CHECKMARK}
                color="var(--color-base-icon-icon-dark)"
              />
              Policy Overview
            </Link>
            <Link
              href={`/policies/${params.planCode}/${params.policyNumber}/documents`}
              className={styles.navItem}
            >
              <Icon
                type={IconType.DOCUMENT_TEXT}
                color="var(--color-base-icon-icon-dark)"
              />
              Documents
            </Link>
            <Link
              href={`/policies/${params.planCode}/${params.policyNumber}/profile`}
              className={styles.navItem}
            >
              <Icon
                type={IconType.CIRCLE_USER}
                color="var(--color-base-icon-icon-dark)"
              />
              Profile
            </Link>
          </>
        )}
        <a
          href="/api/auth/logout"
          className={`${styles.navItem} ${styles.signOut} ${params.planCode && params.policyNumber ? styles.border : ''}`}
        >
          Sign out
        </a>
      </div>
    </nav>
  );
}
