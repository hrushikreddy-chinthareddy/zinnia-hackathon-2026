import { Icon, IconType } from '@zinnia/bloom/components';
import { ApiEndpoints } from './types';
import styles from './DevMenu.module.css';
import { MouseEvent, useEffect, useState } from 'react';
import { MOCK_ERROR_COOKIE_KEY } from '@/utils/serverClientUtils';
import Cookies from 'js-cookie';
import { ROOT_URL_PATH } from '@/types';

export const MockApiErrors = () => {
  const [apiErrorSet, setApiErrorSet] = useState<string[] | null>(null);

  useEffect(() => {
    if (Cookies.get(MOCK_ERROR_COOKIE_KEY)) {
      const mockErrors = Cookies.get(MOCK_ERROR_COOKIE_KEY) || '';
      setApiErrorSet(JSON.parse(mockErrors));
    }
  }, []);

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

  return (
    <>
      <p className={`${styles.navItem} pl-lg `}>
        <Icon
          className="mr-md"
          type={IconType.ALERT_EXCLAMATION}
          color="var(--color-nav-menu-icon-menu-icon-default-fill, #fff)"
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
          <span className="ml-sm">Metrics (includes account value change)</span>
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
            checked={apiErrorSet?.includes(ApiEndpoints.POLICY_BY_CARRIERS)}
          />
          <span className="ml-sm">Policies by carrier</span>
        </label>
        <label style={{ display: 'block' }}>
          <input
            type="checkbox"
            value={ApiEndpoints.WITHDRAWAL_ELIGIBILITY}
            onChange={selectAPIErrorType}
            checked={apiErrorSet?.includes(ApiEndpoints.WITHDRAWAL_ELIGIBILITY)}
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
    </>
  );
};
