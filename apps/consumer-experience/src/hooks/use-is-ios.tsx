import { useEffect, useState } from 'react';

import { useIsClient } from './use-is-client';

function iOS() {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
}

export const useIsIOS = () => {
  const [isIOS, setIsIOS] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      setIsIOS(iOS());
    }
  }, [isClient]);

  return isIOS;
};
