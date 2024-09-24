'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Icon, IconType } from '@zinnia/bloom/components';
import Cookies from 'js-cookie';
import { MouseEvent, useEffect, useMemo, useState } from 'react';

import useMock from '@/hooks/use-mock';
import { isMockAllowed } from '@/utils';
import {
  MOCK_ANNUITY_COOKIE_KEY,
  MOCK_ERROR_COOKIE_KEY,
  SHOW_TEST_POLICIES_COOKIE_KEY,
} from '@/utils/serverClientUtils';
import { zIndexOrder } from '@/utils/zIndexOrder';

import styles from './DevMenu.module.css';
import { ApiEndpoints } from './types';
import { ROOT_URL_PATH } from '@/types';

export const DevMenu = () => {
  const [open, setOpen] = useState(false);
  const [apiErrorSet, setApiErrorSet] = useState<string[] | null>(null);
  const [testPoliciesOn, setTestPoliciesOn] = useState(false);
  const [isAnnuityOn, setIsAnnuityOn] = useState(false);

  const {
    mockText,
    showDevMenu,
    setMock,
    setAnnuityProducts,
    removeDevMenu,
    isMockOn,
  } = useMock();

  const devMenuActive = useMemo(() => {
    return !!Cookies.get(MOCK_ERROR_COOKIE_KEY) || isMockOn;
  }, [isMockOn]);

  useEffect(() => {
    if (Cookies.get(MOCK_ERROR_COOKIE_KEY)) {
      const mockErrors = Cookies.get(MOCK_ERROR_COOKIE_KEY) || '';
      setApiErrorSet(JSON.parse(mockErrors));
    }

    if (Cookies.get(SHOW_TEST_POLICIES_COOKIE_KEY) === 'on') {
      setTestPoliciesOn(true);
    }

    if (Cookies.get(MOCK_ANNUITY_COOKIE_KEY) === 'on') {
      setIsAnnuityOn(true);
    }
  }, []);

  if (!isMockAllowed() || !showDevMenu) {
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
    window.location.href = `${window.location.origin}/${ROOT_URL_PATH}${params}`;
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

  const setTestPoliciesCookie = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (testPoliciesOn) {
      Cookies.remove(SHOW_TEST_POLICIES_COOKIE_KEY);
    } else {
      Cookies.set(SHOW_TEST_POLICIES_COOKIE_KEY, 'on');
    }

    // const queryParams = new URLSearchParams(location.search);
    // queryParams.delete(SHOW_TEST_POLICIES_COOKIE_KEY);
    // const params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    window.location.href = `${window.location.origin}/policies`;
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
                {isMockOn && (
                  <div>
                    <div className={styles.radioItem}>
                      <input
                        type="radio"
                        id="policies"
                        name="mocks"
                        value="policy"
                        className={styles.radioInput}
                        checked={isMockOn && !isAnnuityOn}
                        onChange={() => {
                          setIsAnnuityOn(false);
                          setAnnuityProducts(false);
                        }}
                      />
                      <label
                        className={`${styles.navItem} typography-nav-nav-drawer`}
                        htmlFor="policies"
                      >
                        Mock Policy
                      </label>
                    </div>

                    <div className={styles.radioItem}>
                      <input
                        type="radio"
                        id="annuities"
                        name="mocks"
                        value="annuity"
                        className={styles.radioInput}
                        checked={isMockOn && isAnnuityOn}
                        onChange={() => {
                          setIsAnnuityOn(true);
                          setAnnuityProducts(true);
                        }}
                      />
                      <label
                        className={`${styles.navItem} typography-nav-nav-drawer`}
                        htmlFor="annuities"
                      >
                        Mock Annuity
                      </label>
                    </div>
                  </div>
                )}
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
                      value={ApiEndpoints.POLICY}
                      onChange={selectAPIErrorType}
                      checked={apiErrorSet?.includes(ApiEndpoints.POLICY)}
                    />
                    <span className="ml-sm">Policy</span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={ApiEndpoints.METRICS}
                      onChange={selectAPIErrorType}
                      checked={apiErrorSet?.includes(ApiEndpoints.METRICS)}
                    />
                    <span className="ml-sm">
                      Metrics (includes account value change)
                    </span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={ApiEndpoints.TRANSACTIONS}
                      onChange={selectAPIErrorType}
                      checked={apiErrorSet?.includes(ApiEndpoints.TRANSACTIONS)}
                    />
                    <span className="ml-sm">
                      Transactions (Displays history of payments)
                    </span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={ApiEndpoints.POLICY_BY_CARRIERS}
                      onChange={selectAPIErrorType}
                      checked={apiErrorSet?.includes(
                        ApiEndpoints.POLICY_BY_CARRIERS
                      )}
                    />
                    <span className="ml-sm">Policies by carrier</span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={ApiEndpoints.WITHDRAWAL_ELIGIBILITY}
                      onChange={selectAPIErrorType}
                      checked={apiErrorSet?.includes(
                        ApiEndpoints.WITHDRAWAL_ELIGIBILITY
                      )}
                    />
                    <span className="ml-sm">Withdrawal eligibility</span>
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={ApiEndpoints.ONE_TIME_PREMIUM_PAYMENT}
                      onChange={selectAPIErrorType}
                      checked={apiErrorSet?.includes(
                        ApiEndpoints.ONE_TIME_PREMIUM_PAYMENT
                      )}
                    />
                    <span className="ml-sm">One time premium payment</span>
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
                <button
                  onClick={setTestPoliciesCookie}
                  className={`${styles.navItem} typography-nav-nav-drawer`}
                >
                  <span className={styles.firstItem}>
                    <Icon
                      type={IconType.DOCUMENT_DUPLICATE}
                      color="var(--color-nav-menu-menu-icon-default-fill, #fff)"
                    />
                  </span>
                  <span>{`${testPoliciesOn ? 'Hide' : 'Show'} Test Policies`}</span>
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
