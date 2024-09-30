'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import LogoImage from '@/app/styles/everly/everly-logo.svg';
import useMock from '@/hooks/use-mock';
import { isMockAllowed } from '@/utils';
import { zIndexOrder } from '@/utils/zIndexOrder';

import styles from './MobileNav.module.css';
import { DevMenu } from '../dev-menu/DevMenu';
import { UserBadge } from '../user-badge/UserBadge';
import { NavMenu } from '../nav-menu/NavMenu';

export const MobileNav = ({
  userName,
}: {
  userName: { firstName?: string; lastName?: string };
}) => {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();
  const params = useParams<{ planCode: string; policyNumber: string }>();
  const { isMockOn } = useMock();

  // This won't close the menu if user clicks the path they are currently on
  useEffect(() => {
    setOpen(false);
  }, [pathName, setOpen]);

  return (
    <nav className={styles.container}>
      <div style={{ display: 'flex' }}>
        <DevMenu />

        <Link href="/" className="justify-self-start" aria-label="Home page">
          {/* TODO: update alt text when this logo becomes dynamic */}
          <LogoImage alt="Everly Logo" className={styles.logo}></LogoImage>
        </Link>
        {isMockAllowed() && isMockOn && (
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
      {/* TODO: this isn't the right element, i think it should be a popover */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <UserBadge
            firstName={userName.firstName}
            lastName={userName.lastName}
          />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content
            onPointerDownOutside={e => e.preventDefault()}
            className={styles.content}
            style={{ zIndex: zIndexOrder.Dialog }}
          >
            <NavMenu />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </nav>
  );
};
