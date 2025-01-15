import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useMemo, useRef } from 'react';

import NestedNavParentContainer from '@deps/components/nested-nav-drawer/nested-nav-parent/nested-nav-parent-container';
import { NestedSubLink } from '@deps/config/nav.config';
import { useStaticNestedNavDrawerContext } from '@deps/contexts/LayoutContexts/StaticNestedNavDrawerContext';
import { useOutsideClick } from '@deps/hooks/useOutsideClick';
import { DrawerDetailsTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as ArrowMd } from '@deps/styles/elements/icons/arrow/arrow-md.svg';

export interface NestedNavDrawerProps {
    loading?: boolean;
    navLinks?: NestedSubLink[];
    isFullHeight?: boolean;
    pathname?: string;
}

export default function NestedNavDrawer({ navLinks, isFullHeight, pathname }: NestedNavDrawerProps) {
    const { t } = useTranslation();
    const ref = useRef<HTMLElement>(null);

    const { isNavDrawerOpen, setIsOpenOverride, setOverrideAndStorage, shouldOverlay } = useStaticNestedNavDrawerContext();

    const links = useMemo(() => {
        return navLinks?.length ? navLinks : [];
    }, [navLinks, t]);

    // Only close on outside click while in overlay mode and the the nav drawer is open.
    // Also called when clicking items in the nav drawer while its open and shouldOverlay is true
    const handleOverlayClose = () => {
        if (shouldOverlay && isNavDrawerOpen) {
            setIsOpenOverride(false);
        }
    };

    useOutsideClick(ref, isNavDrawerOpen as boolean, handleOverlayClose);

    const semanticNavWindowClasses = clsx(
        `${isFullHeight ? 'h-screen' : 'height-adjusted'} absolute z-20 bg-gray-900 transition-width duration-300`,
        {
            'w-[240px]': isNavDrawerOpen,
            'w-[52px]': !isNavDrawerOpen,
        }
    );
    const navAsBtnClasses = 'relative flex flex-col justify-between bg-gray-900';
    const toggleButtonClass = clsx(
        'absolute flex h-[24px] w-[24px] cursor-pointer items-center justify-center bg-gray-800 p-0 text-white transition duration-[310ms] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-semantic-focus',
        {
            'translate-x-216 rounded-bl': isNavDrawerOpen,
            'translate-x-[14px] rounded-b': !isNavDrawerOpen,
        }
    );
    const minizedListItemClasses = clsx('mb-4 list-none transition-width duration-300', {
        'w-[240px]': isNavDrawerOpen,
        'w-[52px] overflow-hidden': !isNavDrawerOpen,
    });
    return (
        <nav className={semanticNavWindowClasses} ref={ref}>
            <div className={navAsBtnClasses} data-testid={DrawerDetailsTest.DRAWER}>
                <div>
                    <button
                        onClick={() => setOverrideAndStorage(!isNavDrawerOpen)}
                        className={toggleButtonClass}
                        aria-label={`${isNavDrawerOpen ? t('sidenav.ariaLabels.collapse') : t('sidenav.ariaLabels.expand')}`}
                        aria-expanded={isNavDrawerOpen}
                    >
                        <ArrowMd width={9.6} height={8} className={`${isNavDrawerOpen ? '' : 'flip180'}`} role="presentation" />
                    </button>
                    <ul className="mt-[40px]">
                        {links.map(link => (
                            <li className={minizedListItemClasses} key={`nested-nav-parent-${link.parentKey}`}>
                                <NestedNavParentContainer
                                    isNavDrawerOpen={isNavDrawerOpen}
                                    parentLink={link}
                                    toggleNavDrawer={() => setIsOpenOverride(!isNavDrawerOpen)}
                                    pathname={pathname}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
