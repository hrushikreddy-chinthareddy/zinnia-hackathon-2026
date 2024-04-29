import localFont from 'next/font/local';
import Script from 'next/script';

import type { Metadata } from 'next';

import './styles/globals.css';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Consumer UI',
  description: 'Consumer UI',
};
const primaryFont = localFont({
  variable: '--font-family-primary',
  display: 'swap',
  src: [
    {
      path: './styles/everly/fonts/Poppins-ExtraLight.ttf',
      style: 'normal',
      weight: '200',
    },
    {
      path: './styles/everly/fonts/Poppins-Light.ttf',
      style: 'normal',
      weight: '300',
    },

    {
      path: './styles/everly/fonts/Poppins-Regular.ttf',
      style: 'normal',
      weight: '400',
    },

    {
      path: './styles/everly/fonts/Poppins-Medium.ttf',
      style: 'normal',
      weight: '500',
    },

    {
      path: './styles/everly/fonts/Poppins-SemiBold.ttf',
      style: 'normal',
      weight: '600',
    },
    {
      path: './styles/everly/fonts/Poppins-Bold.ttf',
      style: 'normal',
      weight: '700',
    },
  ], // TODO: 'everly' needs to be dynamic
});

const secondaryFont = localFont({
  variable: '--font-family-secondary',
  src: [
    {
      path: './styles/everly/fonts/Lato-Light.ttf',
      style: 'normal',
      weight: '300',
    },
    {
      path: './styles/everly/fonts/Lato-Regular.ttf',
      style: 'normal',
      weight: '400',
    },
    {
      path: './styles/everly/fonts/Lato-Bold.ttf',
      style: 'normal',
      weight: '700',
    },

    {
      path: './styles/everly/fonts/Lato-Black.ttf',
      style: 'normal',
      weight: '900',
    },
  ],
});

const Mouseflow = () => {
  return (
      <Script id="mouseflow" type="text/javascript">
          {`
              window._mfq = window._mfq || [];
              (function() {
                  var mf = document.createElement("script");
                  mf.type = "text/javascript"; mf.defer = true;
                  mf.src = "//cdn.mouseflow.com/projects/c75f7bc2-4a0f-4b04-aa9e-d235631ac76c.js";
                  document.getElementsByTagName("head")[0].appendChild(mf);
              })();
          `}
      </Script>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${primaryFont.variable} ${secondaryFont.variable}`}
      style={{ height: '100%' }}
    >
      <body style={{ height: '100%' }}>{children}</body>
      <Mouseflow />
    </html>
  );
}
