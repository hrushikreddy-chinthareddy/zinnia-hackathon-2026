import Cookies from 'js-cookie';
import { MouseEvent, useEffect, useState } from 'react';

import {
  MOCK_COOKIE_KEY,
  SHOW_DEV_MENU_COOKIE_KEY,
} from '@/utils/serverClientUtils';

const useMock = () => {
  const [isMockOn, setIsMockOn] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const mockText = isMockOn ? 'Turn Mocks Off' : 'Turn Mocks On';

  useEffect(() => {
    setIsMockOn(Cookies.get(MOCK_COOKIE_KEY) === 'on');
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
    showDevMenu,
    isMockOn,
    setMock,
    removeDevMenu,
  };
};

export default useMock;
