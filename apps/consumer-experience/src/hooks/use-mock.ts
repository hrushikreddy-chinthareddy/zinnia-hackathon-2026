import Cookies from 'js-cookie';
import { MouseEvent, useEffect, useState } from 'react';

import {
  MOCK_COOKIE_KEY,
  MOCK_ERROR_COOKIE_KEY,
  SHOW_DEV_MENU_COOKIE_KEY,
} from '@/utils/serverClientUtils';

const useMock = () => {
  const [isMockOn, setIsMockOn] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [isMockErroOn, setIsMockErrorOn] = useState(false);
  const mockText = isMockOn ? 'Turn Mocks Off' : 'Turn Mocks On';
  const mockErrorText = isMockErroOn ? 'Turn Error Off' : 'Turn Error On';

  useEffect(() => {
    console.log('COOOOKIE', Cookies.get(MOCK_ERROR_COOKIE_KEY));

    setIsMockOn(Cookies.get(MOCK_COOKIE_KEY) === 'on');
    setIsMockErrorOn(Cookies.get(MOCK_ERROR_COOKIE_KEY) === 'on');
    setShowDevMenu(Cookies.get(SHOW_DEV_MENU_COOKIE_KEY) === 'true');
  }, []);

  const setMock = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isMockOn) {
      Cookies.remove(MOCK_COOKIE_KEY);
    } else {
      Cookies.set(MOCK_COOKIE_KEY, 'on');
    }
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete(MOCK_COOKIE_KEY);
    const params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    window.location.href = `${window.location.origin}/policies${params}`;
  };

  const setErrorMock =
    (errorSet: string[] | null) => (event: MouseEvent<HTMLButtonElement>) => {
      console.log('SET ERROR', errorSet);

      event.preventDefault();
      if (isMockErroOn) {
        Cookies.remove(MOCK_ERROR_COOKIE_KEY);
      } else {
        Cookies.set(MOCK_ERROR_COOKIE_KEY, JSON.stringify(errorSet));
      }
      const queryParams = new URLSearchParams(location.search);
      queryParams.delete(MOCK_ERROR_COOKIE_KEY);
      const params = queryParams.toString() ? `?${queryParams.toString()}` : '';
      window.location.href = `${window.location.origin}/policies${params}`;
    };

  const removeDevMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    Cookies.remove(SHOW_DEV_MENU_COOKIE_KEY);
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete(SHOW_DEV_MENU_COOKIE_KEY);
    const params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    window.location.href = `${window.location.origin}/policies${params}`;
  };

  return {
    mockText,
    mockErrorText,
    showDevMenu,
    isMockErroOn,
    isMockOn,
    setMock,
    removeDevMenu,
    setErrorMock,
  };
};

export default useMock;
