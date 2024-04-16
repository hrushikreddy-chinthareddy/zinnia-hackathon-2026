'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Icon, IconType } from '@zinnia/bloom/internal/components';
import { useState } from 'react';

import useMock from '@/hooks/use-mock';
import { isProd } from '@/utils';
import { zIndexOrder } from '@/utils/zIndexOrder';

import styles from './DevMenu.module.css';

enum PolicyEndpoints {
  METRICS = 'metrics',
  TRANSACTIONS = 'transactions',
  POLICY = 'policy',
  POLICY_BY_CARRIERS = 'policy_by_carriers',
}

export const DevMenu = () => {
  const [open, setOpen] = useState(false);
  const [apiErrorSet, setApiErrorSet] = useState<string[] | null>(null);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectAPIErrorType = (e: any) => {
    console.log(e.target.value);
    const item = e.target.value;

    if (apiErrorSet?.includes(item)) {
      const itemRemoved = apiErrorSet.filter(apiType => apiType !== item);
      setApiErrorSet(itemRemoved);
    } else {
      setApiErrorSet([...(apiErrorSet || []), item]);
    }
  };

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
                <div style={{ color: 'white' }}>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={PolicyEndpoints.POLICY}
                      onChange={selectAPIErrorType}
                    />
                    <span className="ml-sm">Policy</span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input type="checkbox" value={PolicyEndpoints.METRICS} />
                    <span className="ml-sm">
                      Metrics (includes account value change)
                    </span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={PolicyEndpoints.TRANSACTIONS}
                    />
                    <span className="ml-sm">
                      Transactions (Displays history of payments)
                    </span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={PolicyEndpoints.POLICY_BY_CARRIERS}
                    />
                    <span className="ml-sm">Policies by carrier</span>
                  </label>
                </div>
                <button
                  onClick={setErrorMock(apiErrorSet)}
                  style={{
                    display: 'flex',
                    border: '2px solid white',
                    padding: '6px',
                    borderRadius: '4px',
                  }}
                >
                  <span className={styles.firstItem}>
                    <Icon
                      type={IconType.ALERT_EXCLAMATION}
                      color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                    />
                  </span>
                  <span style={{ color: 'white' }}>{mockErrorText}</span>
                </button>

                {/* <a
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
                </a> */}
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
