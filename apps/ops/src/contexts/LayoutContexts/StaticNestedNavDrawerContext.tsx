import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ParentKeys } from '@deps/config/nav.config';
import { shouldNavbarOverlay } from '@deps/helpers/page-layout';
import { storage } from '@deps/helpers/sessionStorage.helper';
import { SCREEN_BREAKPOINTS } from '@deps/types/constants';
import { debounce } from '@deps/utils/useDebounce';

interface NestedNavDrawerContextProps {
    isNavDrawerOpen: boolean;
    shouldOverlay: boolean;
    setIsOpenOverride: (open: boolean) => void;
    setOverrideAndStorage: (open: boolean) => void;
    selectedParentKey: ParentKeys | null;
    setSelectedParentKey: (key: ParentKeys | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const NestedNavBarContext = createContext<NestedNavDrawerContextProps>({
    isNavDrawerOpen: false,
    shouldOverlay: false,
    setIsOpenOverride: noop,
    setOverrideAndStorage: noop,
    selectedParentKey: null,
    setSelectedParentKey: noop,
});

export const useStaticNestedNavDrawerContext = () => {
    return useContext(NestedNavBarContext);
};

export const StaticNestedNavDrawerProvider = ({ children }: PropsWithChildren) => {
    const [isLargeScreen, setIsLargeScreen] = useState(false); // isLargeScreen true means screen width is >= 1025
    const isStorageOverride = storage.getItem('NAV_DRAWER_IS_OPEN') as boolean;
    const [isOpenOverride, setIsOpenOverride] = useState<null | boolean>(
        typeof isStorageOverride === 'undefined' ? null : isStorageOverride
    );
    const [selectedParentKey, setSelectedParentKey] = useState<ParentKeys | null>(null);

    const handleScreenSetSize = () => {
        if (window.innerWidth >= SCREEN_BREAKPOINTS.lg) {
            setIsLargeScreen(true);
        } else {
            setIsLargeScreen(false);
            setIsOpenOverride(false);
        }
    };

    const setOverrideAndStorage = (isOpen: boolean) => {
        storage.setItem('NAV_DRAWER_IS_OPEN', isOpen);
        setIsOpenOverride(isOpen);
    };

    // Set state on mount
    // Set state on resize
    useEffect(() => {
        handleScreenSetSize();
        storage.setItem('NAV_DRAWER_IS_OPEN', storage.getItem('NAV_DRAWER_IS_OPEN') ?? window.innerWidth >= SCREEN_BREAKPOINTS.lg);

        const handleResize = debounce(() => {
            handleScreenSetSize();
        }, 50);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // If the user has manually opened or closed the nav drawer, we want to override the default behavior
    const isNavDrawerOpen = useMemo(() => {
        return isLargeScreen ? isOpenOverride ?? isLargeScreen : isOpenOverride ?? false;
    }, [isOpenOverride, isLargeScreen]);

    // On small screen sizes where the user has manually opened the nav drawer, do NOT overlay.
    const shouldOverlay = useMemo(() => {
        return shouldNavbarOverlay(isLargeScreen, isOpenOverride);
    }, [isLargeScreen, isOpenOverride]);

    return (
        <NestedNavBarContext.Provider
            value={{ isNavDrawerOpen, shouldOverlay, setIsOpenOverride, setOverrideAndStorage, selectedParentKey, setSelectedParentKey }}
        >
            {children}
        </NestedNavBarContext.Provider>
    );
};
