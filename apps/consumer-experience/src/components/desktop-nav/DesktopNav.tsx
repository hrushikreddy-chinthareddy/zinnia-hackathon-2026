'use client';

import { Icon, IconType } from '@zinnia/bloom/internal/components';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import LogoImage from '@/app/styles/everly/everly-logo.svg';
import useMock from '@/hooks/use-mock';
import { isMockAllowed } from '@/utils';
import { toTitleCase } from '@/utils/strings';

import styles from './DesktopNav.module.css';
import { DevMenu } from '../dev-menu/DevMenu';

const navLinks = [
  {
    url: `/policies`,
    icon: IconType.MATCHES,
    title: 'my policies',
  },
  {
    url: `/my-account`,
    icon: IconType.CIRCLE_USER,
    title: 'account',
  },
];

export function DesktopNav() {
  const { isMockOn } = useMock();
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState<string>('');

  useEffect(() => {
    console.log('PATH NAME +++++++');
    setActiveNav(pathname);
  }, [pathname]);

  return (
    <nav className={styles.container}>
      <div className={styles.logoContainer}>
        <DevMenu />
        <Link
          prefetch
          href="/"
          className="justify-self-start"
          aria-label="Home page"
        >
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
        {navLinks.map(({ url, icon, title }) => (
          <Link
            prefetch
            href={url}
            key={title}
            className={`${styles.navItem} ${clsx({ [styles.active as string]: url === activeNav })}`}
          >
            <Icon type={icon} color="var(--color-base-icon-icon-dark)" />
            {toTitleCase(title)}
          </Link>
        ))}
        <div className={styles.divider} aria-hidden />
        <a href="/api/logout" className={`${styles.navItem} ${styles.signOut}`}>
          Sign out
        </a>
      </div>
    </nav>
  );
}
