import { FC, PropsWithChildren, useState } from 'react';

import {
  Button,
  CarrierLogo,
  CarrierName,
  Icon,
  IconType,
  SideSheet,
  SideSheetLocation,
} from '@zinnia/bloom/components';
import { Nav, NavGroup } from '../Nav/Nav';
import { SkipLink } from '../SkipLink/SkipLink';
import styles from './Layout.module.css';
import zinniaLogo from '../../styles/icons/zinnia-logo.svg';
import clsx from 'clsx';

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
  const imageAlt = 'Zinnia Logo';
  const sidesheetHeaderLabel = 'Site navigation';

  const handleCloseSidesheet = () => {
    setOpen(false);
    onNavigationToggle?.(false);
  };

  const handleOpenSidesheet = () => {
    setOpen(true);
    onNavigationToggle?.(true);
  };

  const Logo = () => {
    switch (theme) {
      case 'farmers':
        return (
          <div style={{ minWidth: '127px' }}>
            <CarrierLogo
              carrier={CarrierName.FARMERS}
              height={24}
              width={127}
            />
          </div>
        );
      default:
        return <img src={zinniaLogo} alt={imageAlt} height={24} width={90} />;
    }
  };

  return (
    <div className={styles.container} id="__layout" tabIndex={-1}>
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
        <Logo />
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
