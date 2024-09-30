'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import useMock from '@/hooks/use-mock';

import LogoImage from '@/app/styles/everly/everly-logo.svg';
import styles from './DesktopNav.module.css';
import { isMockAllowed } from '@/utils';
import { DevMenu } from '../dev-menu/DevMenu';
import Link from 'next/link';
import * as Popover from '@radix-ui/react-popover';

import { UserBadge } from '@/components/user-badge/UserBadge';
import { NavMenu } from '../nav-menu/NavMenu';

// TODO: add the active link style

export function DesktopNav({
  planCode,
  policyNumber,
  userName,
}: {
  planCode: string;
  policyNumber: string;
  userName: { firstName?: string; lastName?: string };
}) {
  const { isMockOn } = useMock();
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState<string>('');

  useEffect(() => {
    setActiveNav(pathname);
  }, [pathname]);

  return (
    <nav className={styles.container}>
      <div className={styles.logoContainer}>
        <DevMenu />
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
        <Link
          prefetch
          href="/"
          className="justify-self-start"
          aria-label="Home page"
        >
          <LogoImage alt="Everly Logo" className={styles.logo}></LogoImage>
        </Link>
      </div>

      <Popover.Root>
        <Popover.Trigger>
          <UserBadge
            firstName={userName?.firstName}
            lastName={userName?.lastName}
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className={styles.navMenuContainer}>
            <NavMenu />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </nav>
  );
}
