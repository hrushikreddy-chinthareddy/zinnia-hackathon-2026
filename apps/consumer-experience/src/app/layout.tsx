import { UserProvider } from '@auth0/nextjs-auth0/client';
import localFont from 'next/font/local';

import type { Metadata } from 'next';

import { MainNav } from '@/components/MainNav';

import './globals.css';

export const metadata: Metadata = {
  title: 'Cosnumer UI',
  description: 'Cosnumer UI',
};

const myFont = localFont({
  src: './styles/everly/fonts/Poppins-Regular.ttf', // TODO: 'everly' needs to be dynamic
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={myFont.className}>
      <UserProvider>
        <body className="bg-background">
          <MainNav></MainNav>
          <div className="flex justify-center">
            <div className="mx-2 my-4 min-w-[344px] sm:w-[680px] md:m-8">
              {children}
            </div>
          </div>
        </body>
      </UserProvider>
    </html>
  );
}
