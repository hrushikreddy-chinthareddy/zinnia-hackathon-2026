'use client';

import { useWindowSize } from 'react-use';
import { MobileNav } from '@/components/mobile-nav/MobileNav';
import { DesktopNav } from '@/components/desktop-nav/DesktopNav';

export const Nav = () => {
  const { width } = useWindowSize();
  // SIWTCHING DYNAMICALLY IS CAUSING HYDRATION ERROR BECAUSE SERVER, CLIENT MISTMATch
  return <MobileNav />;
};
