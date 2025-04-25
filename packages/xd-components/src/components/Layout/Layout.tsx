import { PropsWithChildren, useState } from 'react';

import {
  Button,
  Icon,
  IconType,
  SideSheet,
  SideSheetLocation,
} from '@zinnia/bloom/components';
import { Nav, NavGroup } from '../Nav/Nav';
import styles from './Layout.module.css';
import { useWindowResize } from '../../hooks/useWindowResize';
import zinniaLogo from '../../styles/icons/zinnia-logo.svg';

interface LayoutType extends PropsWithChildren {
  navGroups: NavGroup[];
  activeNavItem?: string;
}

export const Layout = ({ navGroups, activeNavItem, children }: LayoutType) => {
  const [open, setOpen] = useState(false);
  const windowWidth = useWindowResize();
  const navChangeWidth = 1024;
  const isLargeScreen = windowWidth >= navChangeWidth;

  // to do - translation here?
  const navMenuLabel = 'Open navigation menu';
  const imageAlt = 'Zinnia Logo';
  const sidesheetHeaderLabel = 'Site navigation';

  return (
    <div className={styles.container}>
      {isLargeScreen ? (
        // Above 1024px
        <>
          <Nav navGroups={navGroups} activeNavItem={activeNavItem} />
          <main>{children}</main>
        </>
      ) : (
        // Below 1024px
        <>
          <SideSheet
            overrideOpen={open}
            closeCallback={() => setOpen(false)}
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
              toggleMethod={() => setOpen(false)}
              activeNavItem={activeNavItem}
            />
          </SideSheet>
          <>
            <section className={styles.layoutHeader}>
              <Button
                className={styles.navMenuButton}
                size="small"
                mode="link"
                onClick={() => setOpen(true)}
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
              <div className={styles.zinniaLogo}>
                <img src={zinniaLogo} alt={imageAlt} height={24} width={90} />
              </div>
            </section>
            <main>{children}</main>
          </>
        </>
      )}
    </div>
  );
};
