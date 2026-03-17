import { useRouter } from 'next/router';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import ErrorBoundary from '@deps/components/error-boundary/error-boundary';
import { LayoutWrapper } from '@deps/containers/layout-wrapper/layout-wrapper';
import { storage } from '@deps/helpers/sessionStorage.helpers';

import ModalProvider from './ModalContext';
import { OptimizelyProvider } from './OptimizelyContext';
import { PermissionsProvider } from './PermissionsContext';
import { PolicySearchFiltersProvider } from './PolicySearchFilters';
import { SearchBarProvider } from './SearchBarContext';
import { SideSheetProviderLegacy } from './SideSheetContext';

interface ApplicationData {
    pageProps: any;
}

const ApplicationDataContext = createContext<ApplicationData>({
    pageProps: undefined,
});

export const useApplication = () => {
    return useContext(ApplicationDataContext);
};

interface ApplicationDataProviderProps {
    children: React.ReactNode;
    pageProps: any;
}

const ApplicationComponentWrapper = ({
    children,
}: Omit<ApplicationDataProviderProps, 'pageProps'>) => {
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const managePathHistory = useCallback((url: string) => {
        let pathHistory = (storage.getItem('pathHistory') as any) || [];

        if (
            pathHistory.length > 0 &&
            url === pathHistory[pathHistory.length - 1].url
        ) {
            // Backward navigation
            pathHistory = pathHistory.slice(0, -1);
        } else {
            const current = (storage.getItem('current') as any) || {};

            if (current.url && current.url !== url) {
                // Forward navigation
                pathHistory.push({ url: current.url, h1: current.h1 });
            }
        }

        storage.setItem('pathHistory', pathHistory);

        return pathHistory;
    }, []);

    const setCurrentSessionStorage = useCallback((url: string, h1: string) => {
        storage.setItem('current', { url, h1 });
    }, []);

    useEffect(() => {
        if (isMounted) {
            let checkCurrent = (storage.getItem('current') as any) || {};

            if (
                Object.keys(checkCurrent).length === 0 ||
                checkCurrent.url !== router.asPath
            ) {
                checkCurrent = {
                    url: router.asPath,
                    h1: document.querySelector('h1')?.textContent,
                };

                setCurrentSessionStorage(checkCurrent.url, checkCurrent.h1);
                managePathHistory(router.asPath);
            }

            const handleRouteChangeComplete = (url: string) => {
                managePathHistory(url);
                // This checks to see if the page is still loading for policies before setting a breadcrumb title.  Not ideal, but it gets this working with the current implementation
                const checkH1 = setInterval(() => {
                    const header = document.querySelector('h1');
                    if (header?.textContent !== 'loading policy') {
                        setCurrentSessionStorage(
                            url,
                            header?.textContent || ''
                        );
                        clearInterval(checkH1);
                    }
                }, 500);
            };

            router.events.on('routeChangeComplete', handleRouteChangeComplete);

            return () => {
                router.events.off(
                    'routeChangeComplete',
                    handleRouteChangeComplete
                );
            };
        }
    }, [isMounted]);

    return <>{children}</>;
};

export const ApplicationDataProvider: React.FC<
    ApplicationDataProviderProps
> = ({ children, pageProps }) => {
    return (
        <ApplicationDataContext.Provider value={{ pageProps }}>
            <OptimizelyProvider>
                <PermissionsProvider>
                    <ErrorBoundary>
                        <SideSheetProviderLegacy>
                            <SearchBarProvider>
                                <PolicySearchFiltersProvider>
                                    <ModalProvider>
                                        <ApplicationComponentWrapper>
                                            <LayoutWrapper>
                                                {children}
                                            </LayoutWrapper>
                                        </ApplicationComponentWrapper>
                                    </ModalProvider>
                                </PolicySearchFiltersProvider>
                            </SearchBarProvider>
                        </SideSheetProviderLegacy>
                    </ErrorBoundary>
                </PermissionsProvider>
            </OptimizelyProvider>
        </ApplicationDataContext.Provider>
    );
};
