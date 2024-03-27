'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Icon, IconType } from '@zinnia/bloom/internal/components';
import { useState } from 'react';

import useMock from '@/hooks/use-mock';
import { isProd } from '@/utils';
import { zIndexOrder } from '@/utils/zIndexOrder';

import styles from './DevMenu.module.css';

export const DevMenu = () => {
  const [open, setOpen] = useState(false);
  const {
    mockText,
    mockErrorText,
    showDevMenu,
    setMock,
    removeDevMenu,
    setErrorMock,
  } = useMock();

  if (isProd()) {
    return null;
  }

  if (!showDevMenu) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={styles.menuTrigger}
          aria-label="Opens navigation menu. Press escape to close."
        >
          <Icon width={32} height={32} type={IconType.SETTINGS} />
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
              <li className={styles.navListItem}>
                <a
                  href="#"
                  onClick={setMock}
                  className={`${styles.navItem} typography-nav-nav-drawer`}
                >
                  <span className={styles.firstItem}>
                    <Icon
                      type={IconType.DATABASE}
                      color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                    />
                  </span>
                  <span>{mockText}</span>
                </a>
              </li>
              <li className={styles.navListItem}>
                <a
                  href="#"
                  onClick={setErrorMock}
                  className={`${styles.navItem} typography-nav-nav-drawer`}
                >
                  <span className={styles.firstItem}>
                    <Icon
                      type={IconType.ALERT_EXCLAMATION}
                      color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                    />
                  </span>
                  <span>{mockErrorText}</span>
                </a>
              </li>
              <li className={styles.navListItem}>
                <a
                  href="#"
                  onClick={removeDevMenu}
                  className={`${styles.navItem} typography-nav-nav-drawer`}
                >
                  <span className={styles.firstItem}>
                    <Icon
                      type={IconType.TRASH}
                      color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                    />
                  </span>
                  <span>Remove Dev Menu</span>
                </a>
              </li>
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
