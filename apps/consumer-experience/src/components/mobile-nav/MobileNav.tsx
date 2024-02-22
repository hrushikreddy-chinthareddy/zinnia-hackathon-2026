'use client';
import * as Dialog from '@radix-ui/react-dialog';
import styles from './MobileNav.module.css';
import Link from 'next/link';
import LogoImage from '@/app/styles/everly/everly-logo.svg';
import { zIndexOrder } from '@/utils/zIndexOrder';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';

const navRoutes = [
  { url: '/', displayName: 'Policy overview', icon: IconType.DASHBOARD },
  { url: '/documents', displayName: 'Documents', icon: IconType.DOCUMENT_TEXT },
  { url: '/profile', displayName: 'Profile', icon: IconType.CIRCLE_USER },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();

  // THIS ONLY WORKS IF DONT WANT TO CLOSE NAV ON CLICK OF CURRENT ROUTE
  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [pathName]);

  return (
    <div className={styles.navbar}>
      <Dialog.Root modal open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            style={{
              width: '24px',
              height: '24px',
              marginRight: '0.5rem',
            }}
            className={styles.menuTrigger}
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
            className={styles.content}
            style={{ zIndex: zIndexOrder.Dialog }}
          >
            <nav className={styles.innerContent}>
              <ul>
                {navRoutes.map(route => {
                  const isCurrentPath = pathName === route.url;
                  return (
                    <li key={route.displayName} className={styles.navListItem}>
                      <Link
                        href={route.url}
                        className={clsx(
                          `${styles.navItem} typography-nav-nav-drawer`,
                          { [styles.selected]: isCurrentPath }
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
