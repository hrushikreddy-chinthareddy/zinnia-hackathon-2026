'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Icon, IconType } from '@zinnia/bloom/internal/components';
import clsx from 'clsx';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import LogoImage from '@/app/styles/everly/everly-logo.svg';
import useMock from '@/hooks/use-mock';
import { isProd } from '@/utils';
import { zIndexOrder } from '@/utils/zIndexOrder';

import styles from './MobileNav.module.css';
import { DevMenu } from '../dev-menu/DevMenu';

const navRoutes = [
  {
    url: '/policies/${planCode}/${policyNumber}',
    displayName: 'Policy overview',
    icon: IconType.SHIELD_CHECKMARK,
    requiresPolicy: true,
  },
  {
    url: '/policies/${planCode}/${policyNumber}/documents',
    displayName: 'Documents',
    icon: IconType.DOCUMENT_TEXT,
    requiresPolicy: true,
  },
  {
    url: '/policies/${planCode}/${policyNumber}/profile',
    displayName: 'Profile',
    icon: IconType.CIRCLE_USER,
    requiresPolicy: true,
  },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();
  const params = useParams<{ planCode: string; policyNumber: string }>();
  const { isMockOn } = useMock();

  // This won't close the menu if user clicks the path they are currently on
  useEffect(() => {
    setOpen(false);
  }, [pathName, setOpen]);

  return (
    <div className={styles.container}>
      <DevMenu />

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            className={styles.menuTrigger}
            aria-label="Opens navigation menu. Press escape to close."
          >
            <svg viewBox="0 0 100 100" className={styles.hamburgerMenu}>
              <rect
                className={`${styles.line} ${styles.top}`}
                x={0}
                y={15}
                rx="5"
              />
              <rect
                className={`${styles.line} ${styles.middle}`}
                x={0}
                y={45}
                rx="5"
              />
              <rect
                className={`${styles.line} ${styles.bottom}`}
                x={0}
                y={75}
                rx="5"
              />
            </svg>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content
            onPointerDownOutside={e => e.preventDefault()}
            className={styles.content}
            style={{ zIndex: zIndexOrder.Dialog }}
          >
            <nav className={styles.innerContent}>
              <ul>
                {navRoutes.map(route => {
                  if (
                    (!params.planCode || !params.policyNumber) &&
                    route.requiresPolicy
                  ) {
                    return null;
                  }
                  const url = route.url
                    .replace('${planCode}', params.planCode)
                    .replace('${policyNumber}', params.planCode);
                  const isCurrentPath = pathName === url;
                  return (
                    <li key={route.displayName} className={styles.navListItem}>
                      <Link
                        href={url}
                        className={clsx(
                          `${styles.navItem} typography-nav-nav-drawer`,
                          { [styles.selected as string]: isCurrentPath }
                        )}
                      >
                        <span className={styles.firstItem}>
                          <Icon
                            type={route.icon}
                            color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                          />
                        </span>
                        <span>{route.displayName}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className={styles.globalNavItems}>
                <div className={styles.navListItem}>
                  <a
                    href="/api/auth/logout"
                    className={`${styles.navItem} typography-nav-nav-drawer`}
                  >
                    <span className={styles.firstItem}>
                      <Icon
                        type={IconType.LOGOUT}
                        color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                      />
                    </span>
                    <span>Sign out</span>
                  </a>
                </div>
              </div>
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Link href="/" className="justify-self-start">
        <LogoImage alt="Company Logo" className={styles.logo}></LogoImage>
      </Link>
      {!isProd() && isMockOn && (
        <span
          className={`${styles.navItem} ml-lg`}
          style={{
            color: 'var(--color-status-text-status-error-text',
            fontWeight: 'bold',
          }}
        >
          Mock is on
        </span>
      )}
    </div>
  );
};
