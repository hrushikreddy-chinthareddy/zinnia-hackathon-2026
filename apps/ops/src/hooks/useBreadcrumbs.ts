import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useLayoutEffect, useState } from 'react';

import { getBreadcrumbText } from '@deps/helpers/routing.helpers';
import { storage } from '@deps/helpers/sessionStorage.helper';

export interface Breadcrumb {
    url: string;
    h1: string;
    text: string;
}

function useBreadcrumb() {
    const { t } = useTranslation();
    const [breadcrumb, setBreadcrumb] = useState<Breadcrumb | null>(null);
    const [currentPath, setCurrentPath] = useState<string | null>(null);
    const router = useRouter();

    useLayoutEffect(() => {
        const updatePaths = () => {
            const current = (storage.getItem('current') as any) || {};
            const pathHistory = (storage.getItem('pathHistory') as any) || [];

            const prev = pathHistory.length > 0 ? pathHistory[pathHistory.length - 1] : null;

            if (prev) {
                setBreadcrumb({
                    url: prev.url,
                    h1: prev.h1,
                    text: getBreadcrumbText(t, prev.h1, prev.url),
                });
            }

            if (current.url) {
                setCurrentPath(current.url);
            }
        };

        // this timeout helps retain breadcrumb on page refresh
        setTimeout(updatePaths, 100);

        router.events.on('routeChangeComplete', updatePaths);
        return () => {
            router.events.off('routeChangeComplete', updatePaths);
        };
    }, [router, t]);

    return { breadcrumb, currentPath };
}

export default useBreadcrumb;
