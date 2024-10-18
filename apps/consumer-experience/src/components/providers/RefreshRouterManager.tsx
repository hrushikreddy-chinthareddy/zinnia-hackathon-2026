'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import {
  getRefreshCookie,
  removeRefreshCookie,
} from '@/actions/cookie-actions';
import { ROOT_URL_PATH } from '@/types';

/**
 * NextJS caches route information client side so they can route quicker
 * If the user enters a friend url such as /riders and has multiple policies we send them to the policies index page first
 * after they select a policy we redirect them to the riders page.
 * The issue with that is NextJS stores a cache of data and routes on the client side
 * and if the URL is redirected it maps the original URL to the new url
 * for example if the user select /coverage/SBFIXUL1/AU22006467 and we redirect them to /coverage/SBFIXUL1/AU22006467/riders
 * NextJS will also router /coverage/SBFIXUL1/AU22006467 to /coverage/SBFIXUL1/AU22006467/riders because it a temporary redirect.
 * In order to correct this we set a refresh cookie that allows the frontend to clear the route cache in these scenarios
 * see middleware for how refresh router cookie is set
 */
const RefreshRouterManager = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === ROOT_URL_PATH) {
      return;
    }

    const refreshTheRouter = async () => {
      const refreshRouter = await getRefreshCookie(); // This needs to be awaited because its a server action but its just getting a cookie value quickly.
      if (refreshRouter === '1') {
        await removeRefreshCookie();
        router.refresh();
      }
    };

    refreshTheRouter();
  }, [pathname, router]);

  return <>{children}</>;
};

export { RefreshRouterManager };
