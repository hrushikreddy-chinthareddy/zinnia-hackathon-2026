import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const useMock = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMockOn, setIsMockOn] = useState(false);
  const [showMockLink, setShowMockLink] = useState(false);
  const mockText = isMockOn ? 'Mock is on' : 'Mock is off';
  const mockHref = isMockOn
    ? '/policies?..mock..=off'
    : '/policies?..mock..=on';

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setIsMockOn(window.document.cookie.includes('..mock..=on'));
    setShowMockLink(
      !window.document.cookie.includes('..show_mock_link..=false')
    );
    if (queryParams.has('..mock..')) {
      queryParams.delete('..mock..');
    }

    if (queryParams.has('..show_mock_link..')) {
      queryParams.delete('..show_mock_link..');
    }

    const path = queryParams.toString() ? `?${queryParams.toString()}` : '';
    router.replace(`${pathname}${path}`);
  }, [pathname, router]);

  return {
    mockText,
    mockHref,
    showMockLink,
  };
};

export default useMock;
