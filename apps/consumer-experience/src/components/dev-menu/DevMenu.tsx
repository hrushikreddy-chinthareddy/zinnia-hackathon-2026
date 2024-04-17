'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Icon, IconType } from '@zinnia/bloom/internal/components';
import Cookies from 'js-cookie';
import { MouseEvent, useEffect, useMemo, useState } from 'react';

import useMock from '@/hooks/use-mock';
import { isProd } from '@/utils';
import { MOCK_ERROR_COOKIE_KEY } from '@/utils/serverClientUtils';
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

  const { mockText, showDevMenu, setMock, removeDevMenu, isMockOn } = useMock();

  const devMenuActive = useMemo(() => {
    return !!Cookies.get(MOCK_ERROR_COOKIE_KEY) || isMockOn;
  }, [isMockOn]);

  useEffect(() => {
    if (Cookies.get(MOCK_ERROR_COOKIE_KEY)) {
      const mockErrors = Cookies.get(MOCK_ERROR_COOKIE_KEY) || '';
      setApiErrorSet(JSON.parse(mockErrors));
    }
  }, []);

  if (isProd() || !showDevMenu) {
    return null;
  }

  const setAPIErrorCookie = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (apiErrorSet && apiErrorSet.length > 0) {
      Cookies.set(MOCK_ERROR_COOKIE_KEY, JSON.stringify(apiErrorSet));
    } else {
      Cookies.remove(MOCK_ERROR_COOKIE_KEY);
    }

    const queryParams = new URLSearchParams(location.search);
    queryParams.delete(MOCK_ERROR_COOKIE_KEY);
    const params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    window.location.href = `${window.location.origin}/policies${params}`;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectAPIErrorType = (e: any) => {
    const item = e.target.value;

    if (apiErrorSet?.includes(item)) {
      const itemRemoved = apiErrorSet?.filter(apiType => apiType !== item);
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
          <Icon
            width={32}
            height={32}
            type={IconType.SETTINGS}
            color={
              devMenuActive
                ? 'var(--color-status-icon-status-error-icon)'
                : 'black'
            }
          />
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
              <li>
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
              <li
                className="typography-nav-nav-drawer"
                style={{ color: 'white' }}
              >
                <p className={`${styles.navItem} pl-lg `}>
                  <Icon
                    className="mr-md"
                    type={IconType.ALERT_EXCLAMATION}
                    color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                  />
                  <span className="ml-md">Mock API Errors</span>
                </p>
                <div className="ml-3xl mb-md pl-2xl">
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={PolicyEndpoints.POLICY}
                      onChange={selectAPIErrorType}
                      checked={apiErrorSet?.includes(PolicyEndpoints.POLICY)}
                    />
                    <span className="ml-sm">Policy</span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={PolicyEndpoints.METRICS}
                      onChange={selectAPIErrorType}
                      checked={apiErrorSet?.includes(PolicyEndpoints.METRICS)}
                    />
                    <span className="ml-sm">
                      Metrics (includes account value change)
                    </span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={PolicyEndpoints.TRANSACTIONS}
                      onChange={selectAPIErrorType}
                      checked={apiErrorSet?.includes(
                        PolicyEndpoints.TRANSACTIONS
                      )}
                    />
                    <span className="ml-sm">
                      Transactions (Displays history of payments)
                    </span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={PolicyEndpoints.POLICY_BY_CARRIERS}
                      onChange={selectAPIErrorType}
                      checked={apiErrorSet?.includes(
                        PolicyEndpoints.POLICY_BY_CARRIERS
                      )}
                    />
                    <span className="ml-sm">Policies by carrier</span>
                  </label>
                </div>
                <button
                  className="ml-3xl mb-md pl-3xl"
                  onClick={setAPIErrorCookie}
                  style={{
                    display: 'flex',
                    border: '2px solid white',
                    padding: '6px',
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ color: 'white' }}>Update mock error APIs</span>
                </button>
              </li>
              <li>
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
