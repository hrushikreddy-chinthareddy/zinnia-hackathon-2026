import { useEffect, useLayoutEffect, useState } from 'react';

import { debounce } from './useDebounce';

const WINDOW_VIEWPORT = 1250;

export const useWindowResize = (
  viewport = WINDOW_VIEWPORT,
  debounceTime = 200
) => {
  const isWindowDefined = typeof window !== 'undefined';
  const [windowWidth, setWindowWidth] = useState(
    isWindowDefined ? window.innerWidth : viewport
  );

  useEffect(() => {
    const isWindowDefined = typeof window !== 'undefined';

    const handleWindowResize = debounce(() => {
      if (typeof window !== 'undefined') {
        setWindowWidth(window.innerWidth);
      }
    }, debounceTime);

    if (isWindowDefined) {
      window.addEventListener('resize', handleWindowResize);
    }
    return () => {
      if (isWindowDefined) {
        window.removeEventListener('resize', handleWindowResize);
      }
    };
  }, [windowWidth]);

  return windowWidth;
};

export const useResize = (handleResize: () => void) => {
  useLayoutEffect(() => {
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
};
