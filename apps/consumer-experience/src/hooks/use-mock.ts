import Cookies from 'js-cookie';
import { MouseEvent, useEffect, useState } from 'react';

import {
  removeClientCookie,
  setClientCookie,
} from '@/utils/client-side-cookies';
import {
  MOCK_ANNUITY_COOKIE_KEY,
  MOCK_COOKIE_KEY,
  SHOW_DEV_MENU_COOKIE_KEY,
} from '@/utils/serverClientUtils';

const useMock = () => {
  const [isMockOn, setIsMockOn] = useState(false);
  const [isAnnuityOn, setIsAnnuityOn] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const mockText = isMockOn ? 'Turn Mocks Off' : 'Turn Mocks On';

  useEffect(() => {
    setIsMockOn(Cookies.get(MOCK_COOKIE_KEY) === 'on');
    setIsAnnuityOn(Cookies.get(MOCK_ANNUITY_COOKIE_KEY) === 'on');
    setShowDevMenu(Cookies.get(SHOW_DEV_MENU_COOKIE_KEY) === 'true');
  }, []);

  const setMock = () => {
    if (isMockOn) {
      removeClientCookie(MOCK_COOKIE_KEY);
      removeClientCookie(MOCK_ANNUITY_COOKIE_KEY);
    } else {
      setClientCookie(MOCK_COOKIE_KEY, 'on');
    }
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete(MOCK_COOKIE_KEY);
    const params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    window.location.href = `${window.location.origin}/policies${params}`;
  };

  const setAnnuityProducts = (bool: boolean) => {
    setIsAnnuityOn(bool);

    if (bool) {
      setClientCookie(MOCK_ANNUITY_COOKIE_KEY, 'on');
    } else {
      removeClientCookie(MOCK_ANNUITY_COOKIE_KEY);
    }

    const queryParams = new URLSearchParams(location.search);
    queryParams.delete(MOCK_ANNUITY_COOKIE_KEY);
    const params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    window.location.href = `${window.location.origin}/policies${params}`;
  };

  const removeDevMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    removeClientCookie(SHOW_DEV_MENU_COOKIE_KEY);
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete(SHOW_DEV_MENU_COOKIE_KEY);
    const params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    window.location.href = `${window.location.origin}/policies${params}`;
  };

  return {
    mockText,
    showDevMenu,
    isMockOn,
    setMock,
    setAnnuityProducts,
    isAnnuityOn,
    removeDevMenu,
  };
};

export default useMock;
