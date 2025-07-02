'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  CarrierAvatar,
  CarrierName,
  Icon,
  IconType,
} from '@zinnia/bloom/components';
import Cookies from 'js-cookie';
import { ChangeEvent, MouseEvent, useEffect, useMemo, useState } from 'react';

import useMock from '@/hooks/use-mock';
import { ROOT_URL_PATH } from '@/types';
import { isMockAllowed } from '@/utils';
import {
  MOCK_ANNUITY_COOKIE_KEY,
  MOCK_ERROR_COOKIE_KEY,
  MOCK_FARMERS_ECN_COOKIE_KEY,
  SHOW_TEST_POLICIES_COOKIE_KEY,
} from '@/utils/serverClientUtils';
import { zIndexOrder } from '@/utils/zIndexOrder';

import styles from './DevMenu.module.css';
import { MockApiErrors } from './MockApiErrors';
import { Link } from '../link/Link';

export const DevMenu = () => {
  const [open, setOpen] = useState(false);

  const [testPoliciesOn, setTestPoliciesOn] = useState(false);
  const [isAnnuityOn, setIsAnnuityOn] = useState(false);
  const [isMockFarmersECNOn, setIsMockFarmersECNOn] = useState(
    !!Cookies.get(MOCK_FARMERS_ECN_COOKIE_KEY)
  );

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
    window.location.href = `${window.location.origin}/${ROOT_URL_PATH}`;
  };

  const setMockFarmersECNCookie = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      Cookies.set(MOCK_FARMERS_ECN_COOKIE_KEY, 'on');
      setIsMockFarmersECNOn(true);
    } else {
      Cookies.remove(MOCK_FARMERS_ECN_COOKIE_KEY);
      setIsMockFarmersECNOn(false);
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
            <div>
              <h2 style={{ color: 'white' }}>App Experience</h2>
              <ul>
                <li>
                  <Link
                    isNativeAnchorTag
                    href="#"
                    onClick={setMock}
                    className={`${styles.navItem} typography-nav-nav-drawer`}
                  >
                    <span className={styles.firstItem}>
                      <Icon
                        type={IconType.DATABASE}
                        color="var(--color-nav-menu-icon-menu-icon-default-fill, #fff)"
                      />
                    </span>
                    <span>{mockText}</span>
                  </Link>
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
                  <MockApiErrors />
                </li>
                <li>
                  <button
                    onClick={setTestPoliciesCookie}
                    className={`${styles.navItem} typography-nav-nav-drawer`}
                  >
                    <span className={styles.firstItem}>
                      <Icon
                        type={IconType.DOCUMENT_DUPLICATE}
                        color="var(--color-nav-menu-icon-menu-icon-default-fill, #fff)"
                      />
                    </span>
                    <span>{`${testPoliciesOn ? 'Hide' : 'Show'} Test Policies`}</span>
                  </button>
                </li>
                <li>
                  <Link
                    isNativeAnchorTag
                    href="#"
                    onClick={removeDevMenu}
                    className={`${styles.navItem} typography-nav-nav-drawer`}
                  >
                    <span className={styles.firstItem}>
                      <Icon
                        type={IconType.TRASH}
                        color="var(--color-nav-menu-icon-menu-icon-default-fill, #fff)"
                      />
                    </span>
                    <span>Remove Dev Menu</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 style={{ color: 'white' }}>Carrier Experience</h2>
              <h3 className={styles.carrierHeader} style={{ color: 'white' }}>
                <CarrierAvatar carrier={CarrierName.FARMERS} />
                Farmers
              </h3>
              <ul>
                <li style={{ margin: '0 var(--measure-dimension-gap-lg)' }}>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      onChange={e => setMockFarmersECNCookie(e)}
                      checked={isMockFarmersECNOn}
                    />
                    <span className="ml-sm">
                      <strong>Use Farmers Mock ECN:</strong> use a hardcoded ECN
                      when logged in without SSO experience. (Refresh after
                      toggling)
                    </span>
                  </label>
                </li>
              </ul>
            </div>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
