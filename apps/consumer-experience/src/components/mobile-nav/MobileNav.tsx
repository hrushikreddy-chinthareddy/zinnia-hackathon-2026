'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Icon, IconType } from '@zinnia/bloom/internal/components';
import clsx from 'clsx';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import LogoImage from '@/app/styles/everly/everly-logo.svg';
import useMock from '@/hooks/use-mock';
import { zIndexOrder } from '@/utils/zIndexOrder';

import styles from './MobileNav.module.css';

const navRoutes = [
  { url: '/', displayName: 'Policy overview', icon: IconType.DASHBOARD },
  { url: '/documents', displayName: 'Documents', icon: IconType.DOCUMENT_TEXT },
  {
    url: '/policies/${planCode}/policy/${policyNumber}/profile',
    displayName: 'Profile',
    icon: IconType.CIRCLE_USER,
  },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();
  const params = useParams<{ planCode: string; policyNumber: string }>();
  const { mockHref, mockText, showMockLink } = useMock();

  // This won't close the menu if user clicks the path they are currently on
  useEffect(() => {
    setOpen(false);
  }, [pathName, setOpen]);

  return (
    <div className={styles.container}>
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
                <li className={styles.navListItem}>
                  {showMockLink && (
                    <a
                      href={mockHref}
                      className={`${styles.navItem} typography-nav-nav-drawer`}
                    >
                      <span className={styles.firstItem}>
                        <Icon
                          type={IconType.ALERT_EXCLAMATION}
                          color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                        />
                      </span>
                      <span>{mockText}</span>
                    </a>
                  )}
                </li>
                {navRoutes.map(route => {
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
    </div>
  );
};
