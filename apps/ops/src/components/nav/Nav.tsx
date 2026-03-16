import {
    FieldData,
    FieldSize,
    Tooltip,
    TooltipPlacement,
    Icon,
    IconType,
    CarrierName,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useState } from 'react';

import { useTheme } from '@deps/hooks/useTheme';
import { useWindowResize } from '@deps/hooks/useWindowResize';

import { CollapsedLogo } from './CollapsedLogo';
import { ExpandedLogo } from './ExpandedLogo';
import styles from './Nav.module.css';
import { NavLink } from './NavLink';
import { ZinniaLogo } from './ZinniaLogo';

export interface NavProps {
    containerClassName?: string;
    toggleMethod?: () => void;
    navGroups: NavGroup[];
    activeNavItem?: string;
    displaySearch?: boolean;
    onNavigationToggle?: (isExpanded: boolean) => void;
    theme?: string;
}
export interface NavGroup {
    heading?: string;
    items: NavItem[];
    alignEnd?: boolean;
}

export type NavItem =
    | {
          id: string;
          display: string;
          icon: IconType;
          href: string;
          renderComponent?: never;
      }
    | {
          id: string;
          display: string;
          icon: IconType;
          href?: never;
          renderComponent: React.ReactElement;
      };

const NAV_CHANGE_WIDTH = 1024;

/**
 * You must provide **either** `href` or `renderComponent`, but **not both**.
 *
 * This ensures each item is either a link or a rendered component, but not both at once.
 *
 * In most use cases renderComponent will need to receive something like NextLink or a React Routing Link
 *
 * In the case of wanting a vanilla HTML anchor element, just an href is needed
 */
export const Nav = ({
    containerClassName,
    toggleMethod,
    navGroups,
    activeNavItem,
    displaySearch = true,
    onNavigationToggle,
}: NavProps) => {
    const [isExpanded, setExpanded] = useState(true);
    const { carrierName } = useTheme();
    const windowWidth = useWindowResize();
    const isLargeScreen = windowWidth >= NAV_CHANGE_WIDTH;

    // to do - translation here?
    const expandText = 'Expand navigation';
    const collapseText = 'Collapse navigation';
    const searchText = 'Search...';

    const handleNavToggle = () => {
        if (!isLargeScreen && !!toggleMethod) {
            toggleMethod();
        } else {
            setExpanded((prevState) => {
                onNavigationToggle?.(!prevState);
                return !prevState;
            });
        }
    };

    const handleLogoClick = () => {
        setExpanded(true);
        onNavigationToggle?.(true);
    };

    return (
        <section
            className={clsx(
                styles.navContainer,
                isExpanded ? styles.expanded : styles.collapsed,
                containerClassName
            )}
        >
            <div className={styles.navOverflowContainer}>
                <button
                    className={clsx(styles.toggleTarget)}
                    aria-label={isExpanded ? collapseText : expandText}
                    onClick={handleNavToggle}
                    style={
                        isExpanded
                            ? { cursor: 'w-resize' }
                            : { cursor: 'e-resize' }
                    }
                ></button>
                <div className={styles.logoRow}>
                    <div className={styles.logo}>
                        {/* If the theme is Zinnia - just load in the logo component */}
                        {carrierName === CarrierName.ZINNIA ? (
                            <ZinniaLogo
                                handleLogoClick={handleLogoClick}
                                isExpanded={false}
                                expandText=""
                            />
                        ) : // Otherwise check for expanded state to toggle between the two types of logos
                        isExpanded ? (
                            <ExpandedLogo
                                activeCarrier={carrierName}
                                handleLogoClick={handleLogoClick}
                                isExpanded={isExpanded}
                                expandText={expandText}
                            />
                        ) : (
                            <button
                                onClick={handleLogoClick}
                                aria-label={expandText}
                            >
                                <CollapsedLogo
                                    activeCarrier={carrierName}
                                    handleLogoClick={handleLogoClick}
                                    isExpanded={isExpanded}
                                    expandText={expandText}
                                />
                            </button>
                        )}
                    </div>
                    <button
                        className={styles.toggleButton}
                        onClick={handleNavToggle}
                        aria-label={isExpanded ? collapseText : expandText}
                        tabIndex={isExpanded ? undefined : -1}
                    >
                        <Icon
                            type={IconType.CHEVRON_DOUBLE}
                            height={16}
                            width={16}
                            color="#676767"
                        />
                    </button>
                </div>

                {displaySearch &&
                    (isExpanded ? (
                        <div className={styles.searchBar}>
                            <FieldData
                                fieldSize={FieldSize.Small}
                                className={styles.searchInput}
                                placeholder={searchText}
                            />
                        </div>
                    ) : (
                        <div
                            className={clsx(
                                styles.searchBar,
                                styles.searchIcon
                            )}
                        >
                            <Icon
                                type={IconType.SEARCH}
                                height={20}
                                width={20}
                                color="#676767"
                            />
                        </div>
                    ))}

                <nav className={styles.nav}>
                    <div className={styles.navList}>
                        {navGroups?.map((group, index) => {
                            if (group.items.length === 0) return null;

                            return (
                                <div
                                    className={clsx(
                                        styles.navSection,
                                        group.alignEnd && styles.alignEnd
                                    )}
                                    key={`navSection-${index}`}
                                >
                                    {group.heading && (
                                        <h3
                                            className={clsx(
                                                styles.navSection__heading,
                                                'typography-labels-label-sm',
                                                !isExpanded && styles.hidden
                                            )}
                                        >
                                            {group.heading}
                                        </h3>
                                    )}
                                    <ul>
                                        {group.items.map((navItem) => {
                                            // Normalizes the root nav route to be a string so it can be compared
                                            const activeNavItemString =
                                                activeNavItem?.split('/')[1];
                                            return (
                                                <Tooltip
                                                    key={navItem.id}
                                                    placement={
                                                        TooltipPlacement.CenterRight
                                                    }
                                                    delayDuration={0}
                                                    tooltipClassName={clsx(
                                                        styles.tooltip,
                                                        !isExpanded &&
                                                            styles.visible
                                                    )}
                                                    triggerClassName={
                                                        styles.tooltipTrigger
                                                    }
                                                    trigger={
                                                        // NavLink is not an actual element so we have to wrap it in this li
                                                        // so that the tooltip will have an element to attach to for proper location.
                                                        // Yes, this not the best solution but it works until all the circular excessive
                                                        // navlink stuff is fixed between here and ops.
                                                        <li
                                                            className={clsx(
                                                                styles.listItem
                                                            )}
                                                            key={navItem.id}
                                                        >
                                                            <NavLink
                                                                renderComponent={
                                                                    navItem.renderComponent
                                                                        ? navItem.renderComponent
                                                                        : undefined
                                                                }
                                                                href={
                                                                    navItem.href
                                                                        ? navItem.href
                                                                        : undefined
                                                                }
                                                                aria-current={
                                                                    activeNavItem ===
                                                                        navItem.id ||
                                                                    navItem.id ===
                                                                        activeNavItemString
                                                                        ? 'page'
                                                                        : undefined
                                                                }
                                                                className={clsx(
                                                                    styles.listItem__link,
                                                                    'typography-content-body color-base-text-secondary'
                                                                )}
                                                            >
                                                                <>
                                                                    {navItem?.icon && (
                                                                        <div
                                                                            className={
                                                                                styles.listItem__iconContainer
                                                                            }
                                                                        >
                                                                            <Icon
                                                                                type={
                                                                                    navItem.icon
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                                width={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <span>
                                                                        {
                                                                            navItem.display
                                                                        }
                                                                    </span>
                                                                </>
                                                            </NavLink>
                                                        </li>
                                                    }
                                                >
                                                    {navItem.display}
                                                </Tooltip>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </section>
    );
};
