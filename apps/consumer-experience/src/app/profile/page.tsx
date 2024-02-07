import { getSession } from '@auth0/nextjs-auth0';
import Link from 'next/link';

import ChevronIcon from '@/app/styles/icons/icons_outlined/chevron-left.svg';

export default async function Profile() {
  const session = await getSession();

  if (!session) {
    // TODO:
  }
  const user = session?.user;

  console.log('my user', session);
  return (
    <>
      <div className="flex items-center my-4 gap-2">
        <Link href="/">
          <span className="sr-only">Back to</span>
          <ChevronIcon
            className="text-primary w-6"
            role="presentation"
          ></ChevronIcon>
        </Link>
        <h1 className="text-2xl text-primary">Profile</h1>
        <div className="flex grow justify-end items-end">
          <Link href="/api/auth/logout">Sign out</Link>
        </div>
      </div>

      <div className="rounded border bg-white">
        <div className="p-6 border-b-2">
          <p className="text-2xl">{user?.name}</p>
          <p className="font-medium text-xs text-gray-600">
            Insured & Policy Owner
          </p>
        </div>
        <div className="p-6 border-b-2">
          <p className="text-2xl">Ryan Olsen</p>
        </div>
        <div className="p-6 border-b-2">
          <p className="text-2xl">Ryan Olsen</p>
        </div>
      </div>
    </>
  );
}
