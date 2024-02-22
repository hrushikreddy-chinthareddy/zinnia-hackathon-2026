'use client';

import { useWindowSize } from 'react-use';

import { DesktopNav } from '@/components/desktop-nav/DesktopNav';
import { MobileNav } from '@/components/mobile-nav/MobileNav';

export const Nav = () => {
  const { width } = useWindowSize();
  if (width < 500) {
    return <MobileNav />;
  }

  return <DesktopNav />;
};
