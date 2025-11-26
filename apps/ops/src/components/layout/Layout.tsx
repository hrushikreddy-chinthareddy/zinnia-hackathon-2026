import {
    Button,
    Icon,
    IconType,
    SideSheet,
    SideSheetLocation,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { FC, PropsWithChildren, useState } from 'react';

import styles from './Layout.module.css';
import { Logo } from './Logo';
import { Nav, NavGroup } from '../nav/Nav';
import { SkipLink } from '../skip-link/SkipLink';

interface LayoutType extends PropsWithChildren {
    navGroups: NavGroup[];
    activeNavItem?: string;
    displaySearch?: boolean;
    onNavigationToggle?: (isExpanded: boolean) => void;
    theme?: string;
    className?: string;
}

export const Layout: FC<LayoutType> = ({
    navGroups,
    activeNavItem,
    displaySearch = true,
    onNavigationToggle,
    theme,
    className,
    children,
}) => {
    const [open, setOpen] = useState(false);

    // to do - translation here?
    const navMenuLabel = 'Open navigation menu';
    const sidesheetHeaderLabel = 'Site navigation';

    const handleCloseSidesheet = () => {
        setOpen(false);
        onNavigationToggle?.(false);
    };

    const handleOpenSidesheet = () => {
        setOpen(true);
        onNavigationToggle?.(true);
    };

    return (
        <div className={styles.container} id="main-layout" tabIndex={-1}>
            <SkipLink />
            {/* visible only below 1024px */}
            <SideSheet
                overrideOpen={open}
                closeCallback={handleCloseSidesheet}
                location={SideSheetLocation.Left}
                contentClassName={styles.sidesheetContent}
                overlayClassName={styles.sidesheetOverlay}
                descriptionClassName={styles.sidesheetDescription}
                preventCloseOnOutsideClick={false}
                header={sidesheetHeaderLabel}
                visuallyHideHeader={true}
                trigger={<></>}
            >
                <Nav
                    navGroups={navGroups}
                    containerClassName={styles.layoutNav}
                    toggleMethod={handleCloseSidesheet}
                    activeNavItem={activeNavItem}
                    displaySearch={displaySearch}
                    onNavigationToggle={onNavigationToggle}
                    theme={theme}
                />
            </SideSheet>
            <section className={styles.layoutHeader}>
                <Button
                    className={styles.navMenuButton}
                    size="small"
                    mode="link"
                    onClick={handleOpenSidesheet}
                    aria-label={navMenuLabel}
                >
                    <Icon
                        small
                        type={IconType.MENU}
                        color="#212121"
                        height={24}
                        width={24}
                    />
                </Button>
                <Logo theme={theme} />
            </section>
            {/*  */}

            {/* visible only above 1024px */}
            <Nav
                navGroups={navGroups}
                containerClassName={styles.sidebarNav}
                activeNavItem={activeNavItem}
                displaySearch={displaySearch}
                onNavigationToggle={onNavigationToggle}
                theme={theme}
            />
            {/*  */}

            <main className={clsx(styles.layoutMain, className)} id="main">
                {children}
            </main>
        </div>
    );
};
