import { Metadata } from 'next';
import Image from 'next/image';

import heroImage from '@/app/styles/everly/everly-hero-background.png'; // TODO: don't hardcode to everly
import LogoImage from '@/app/styles/everly/everly-logo.svg'; // TODO: don't hardcode to everly

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Login page',
};

export default function Login() {
  return (
    <div className="h-full bg-white">
      <div className="h-full">
        <div className="flex min-h-full flex-1 flex-col justify-center">
          <div className="h-40 bg-background-accent">
            <div className="h-full  flex flex-1 pl-8">
              <div className="flex-1 flex">
                <LogoImage className="self-center w-32" alt="Company Logo" />
              </div>
              <div className="flex flex-1 justify-start md:justify-end overflow-hidden">
                <div className="flex shrink-0">
                  <Image
                    priority={true}
                    width="346"
                    height="168" // TODO: remove magic numbers
                    className=""
                    src={heroImage}
                    alt="Company hero image"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Login
              </h2>
              <div className="py-6">
                <a
                  href="/api/auth/login"
                  className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Get verification code
                </a>
              </div>

              <p className="text-center text-sm text-gray-500">
                <a
                  href="#"
                  className="font-semibold leading-6 text-primary hover:text-primary-light"
                >
                  Need help signing in?
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
