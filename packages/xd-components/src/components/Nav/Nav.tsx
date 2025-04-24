import { useState } from 'react';
import {
  FieldData,
  FieldSize,
  Tooltip,
  TooltipPlacement,
} from '@zinnia/bloom/components';
import styles from './Nav.module.css';
import clsx from 'clsx';
import { Icon, IconType } from '@zinnia/bloom/components';
import { NavLink } from './NavLink';
import { useWindowResize } from '../../hooks/useWindowResize';

export interface NavProps {
  containerClassName?: string;
  toggleMethod?: () => void;
  navGroups: NavGroup[];
  activeNavItem?: string;
}

export interface NavGroup {
  heading?: string;
  items: NavItem[];
  alignEnd?: boolean;
}
export interface NavItem {
  id: string;
  display: string;
  icon: IconType;
  href?: string;
  renderComponent?: React.ReactElement;
}

const NAV_CHANGE_WIDTH = 1024;

export const Nav = ({
  containerClassName,
  toggleMethod,
  navGroups,
  activeNavItem,
}: NavProps) => {
  const [isExpanded, setExpanded] = useState(true);
  const windowWidth = useWindowResize();
  const isLargeScreen = windowWidth >= NAV_CHANGE_WIDTH;

  // to do - translation here?
  const expandText = 'Expand navigation';
  const collapseText = 'Collapse navigation';

  const handleNavToggle = () => {
    if (!isLargeScreen && !!toggleMethod) {
      toggleMethod();
    } else {
      setExpanded(prevState => !prevState);
    }
  };

  return (
    <section
      className={clsx(
        styles.navContainer,
        isExpanded ? styles.expanded : styles.collapsed,
        containerClassName
      )}
    >
      <button
        className={clsx(styles.toggleTarget)}
        aria-label={isExpanded ? collapseText : expandText}
        onClick={() => setExpanded(prevState => !prevState)}
        style={isExpanded ? { cursor: 'w-resize' } : { cursor: 'e-resize' }}
      ></button>
      {isExpanded ? (
        <div className={styles.logoRow}>
          <div className={styles.zinniaLogo}>
            <img
              src="/logos/zinnia-logo.svg"
              // to do - translation here?
              alt={'Zinnia Logo'}
              height={24}
              width={90}
            />
          </div>
          <button className={styles.toggleButton} onClick={handleNavToggle}>
            <Icon
              type={IconType.CHEVRON_DOUBLE}
              height={16}
              width={16}
              color="#676767"
            />
          </button>
        </div>
      ) : (
        <button
          className={(styles.zinniaLogo, styles.logoSmall)}
          onClick={() => setExpanded(true)}
          aria-label={expandText}
        >
          <img
            src="/logos/zinnia-logo-icon-color.svg"
            alt={'Zinnia'}
            height={24}
            width={24}
          />
        </button>
      )}

      {isExpanded ? (
        <div className={styles.searchBar}>
          <FieldData
            fieldSize={FieldSize.Small}
            className={styles.searchInput}
            // to do - translation here?
            placeholder="Search..."
          />
        </div>
      ) : (
        <div className={clsx(styles.searchBar, styles.searchIcon)}>
          <Icon type={IconType.SEARCH} height={20} width={20} color="#676767" />
        </div>
      )}
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navGroups?.map((group, index) => {
            return (
              <li
                className={clsx(
                  styles.navSection,
                  group.alignEnd && styles.alignEnd
                )}
                key={`navSection-${index}`}
              >
                <section>
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
                    {group.items.map(navItem => {
                      return (
                        <li className={clsx(styles.listItem)} key={navItem.id}>
                          <Tooltip
                            placement={TooltipPlacement.CenterRight}
                            delayDuration={0}
                            tooltipClassName={clsx(
                              styles.tooltip,
                              !isExpanded && styles.visible
                            )}
                            triggerClassName={styles.tooltipTrigger}
                            trigger={
                              <NavLink
                                renderComponent={
                                  navItem.renderComponent
                                    ? navItem.renderComponent
                                    : undefined
                                }
                                href={navItem.href ? navItem.href : undefined}
                                aria-current={
                                  navItem.id === activeNavItem
                                    ? 'page'
                                    : undefined
                                }
                                className={clsx(
                                  styles.listItem__link,
                                  'typography-content-body color-base-text-text-secondary'
                                )}
                              >
                                <>
                                  {navItem?.icon && (
                                    <div
                                      style={{ height: '20px', width: '20px' }}
                                    >
                                      <Icon
                                        type={navItem.icon}
                                        className={styles.listItem__icon}
                                        height={20}
                                        width={20}
                                      />
                                    </div>
                                  )}
                                  <span
                                    className={clsx(
                                      !isExpanded && styles.hidden
                                    )}
                                  >
                                    {navItem.display}
                                  </span>
                                </>
                              </NavLink>
                            }
                          >
                            {navItem.display}
                          </Tooltip>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
};
