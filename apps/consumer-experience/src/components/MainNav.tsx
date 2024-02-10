import Link from 'next/link';

import LogoImage from '@/app/styles/everly/everly-logo.svg';

import { Icon, IconType } from './icon/Icon';

export function MainNav() {
  return (
    <div className="hidden items-center bg-white p-4 sm:flex">
      <div className="justify-self-start">
        <LogoImage
          alt="Company Logo"
          className="w-24 shrink-0 self-center text-primary"
        ></LogoImage>
      </div>

      <div className="flex grow items-center justify-end gap-4">
        <Link href="#" className="flex items-center gap-1 text-sm font-medium">
          <Icon type={IconType.DOCUMENT_TEXT} className="w-6 text-primary" />
          Documents
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-1 text-sm font-medium"
        >
          <Icon type={IconType.CIRCLE_USER} className="w-6 text-primary" />
          Profile
        </Link>
        <span className="text-gray-200">|</span>
        <a href="/api/auth/logout" className="text-sm font-medium">
          Sign out
        </a>
      </div>
    </div>
  );
}
