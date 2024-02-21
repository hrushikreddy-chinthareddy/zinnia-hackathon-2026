'use client';
import * as Dialog from '@radix-ui/react-dialog';
import styles from './MobileNav.module.css';
import Link from 'next/link';
import LogoImage from '@/app/styles/everly/everly-logo.svg';
import { zIndexOrder } from '@/utils/zIndexOrder';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon, IconType } from '@zinnia/bloom/components';

const navRoutes = [
  { url: '/', displayName: 'Policy overview', icon: IconType.DASHBOARD },
  { url: '/', displayName: 'Documents', icon: IconType.DOCUMENT_TEXT },
  { url: '/profile', displayName: 'Profile', icon: IconType.CIRCLE_USER },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();

  // THIS ONLY WORKS IF DONT WANT TO CLOSE NAV ON CLICK OF CURRENT ROUTE
  useEffect(() => {
    if (open) {
      console.log('you in here?');
      setOpen(false);
    }
  }, [pathName]);

  return (
    <div className={styles.container}>
      <Dialog.Root modal open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button>Button</button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content
            className={styles.content}
            style={{ zIndex: zIndexOrder.Dialog }}
          >
            <div className={styles.innerContent}>
              <ul>
                {navRoutes.map(route => {
                  return (
                    <li key={route.displayName}>
                      <Link href={route.url} className={styles.navItem}>
                        <Icon
                          type={route.icon}
                          color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                        />
                        {route.displayName}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className={styles.globalNavItems}>
                <a href="/api/auth/logout" className={styles.navItem}>
                  <Icon
                    type={IconType.LOGOUT}
                    color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                  />
                  Sign out
                </a>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Link href="/" className="justify-self-start">
        <LogoImage alt="Company Logo" className={styles.logo}></LogoImage>
      </Link>
    </div>
  );
};
