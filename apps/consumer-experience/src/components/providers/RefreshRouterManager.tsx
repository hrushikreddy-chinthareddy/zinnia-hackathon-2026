'use client';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ROOT_URL_PATH } from '@/types';
import { REFRESH_ROUTER_COOKIE_KEY } from '@/utils/serverClientUtils';

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
    const refreshRouter = Cookies.get(REFRESH_ROUTER_COOKIE_KEY) === '1';
    if (refreshRouter) {
      Cookies.remove(REFRESH_ROUTER_COOKIE_KEY);
      router.refresh();
    }
  }, [pathname, router]);

  return <>{children}</>;
};

export { RefreshRouterManager };
