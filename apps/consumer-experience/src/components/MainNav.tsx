import Link from 'next/link';

import LogoImage from '@/app/styles/everly/everly-logo.svg';

import { Icon, IconType } from './icon/Icon';

export function MainNav() {
  return (
    <div className="bg-white hidden sm:flex p-4 items-center">
      <div className="justify-self-start">
        <LogoImage alt="Company Logo" className="shrink-0 self-center text-primary w-24"></LogoImage>
      </div>

      <div className="flex gap-4 grow justify-end items-center">
        <Link href="#" className="font-medium text-sm flex items-center gap-1">
          {/* <DocumentIcon className="text-primary w-6" aria-hidden="true"></DocumentIcon> */}
          <Icon type={IconType.DOCUMENT_TEXT} className="text-primary w-6" />
          Documents
        </Link>
        <Link href="/profile" className="font-medium text-sm flex items-center gap-1">
          {/* <UserIcon className="text-primary w-6" alt="User Icon" aria-hidden="true" /> */}
          <Icon type={IconType.CIRCLE_USER} className="text-primary w-6" />
          Profile
        </Link>
        <span className="text-gray-200">|</span>
        <a href="/api/auth/logout" className="font-medium text-sm">
          Sign out
        </a>
      </div>
    </div>
  );
}
