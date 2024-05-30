import { GoogleAnalytics } from '@next/third-parties/google';
import localFont from 'next/font/local';
import Script from 'next/script';

import type { Metadata } from 'next';

import { DataDogInit } from '@/components/DataDogInit';
import { ScrollToTop } from '@/components/ScrollToTop';
import { isProd } from '@/utils';

import './styles/globals.css';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: {
    // TODO: eventually using whatever mechanism we decide to switch carriers, this carrier name will need to be dynamic
    template: '%s | Zinnia Tech',
    default: 'Login | Zinnia Tech',
  },
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
  preload: true,
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
  preload: true,
});

const MouseflowTrackingCode = () => {
  return (
    <Script id="mouse-flow-tracking" type="text/javascript">
      {`
          window._mfq = window._mfq || [];
          (function() {
            var mf = document.createElement("script");
            mf.type = "text/javascript"; mf.defer = true;
            mf.src = "//cdn.mouseflow.com/projects/55155137-cbba-44d3-8750-8d43ae890911.js";
            document.getElementsByTagName("head")[0].appendChild(mf);
          })();
        `}
    </Script>
  );
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${primaryFont.variable} ${secondaryFont.variable}`}
    >
      <body>
        {/* Next includes scroll to top functionality with the Link component HOWEVER, it's scroll to top
        of the current layout which is the inner component for us, not top of the page. This scrolls to the top of the page to include the nav */}
        <ScrollToTop />
        {children}
        <DataDogInit />
        <MouseflowTrackingCode />
        {isProd() && <GoogleAnalytics gaId="G-TZ4P6YJQ0K" />}
      </body>
    </html>
  );
}
