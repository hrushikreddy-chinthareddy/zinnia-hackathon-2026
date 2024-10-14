import { useTranslation } from 'next-i18next';
import React, { useEffect, useMemo, useState } from 'react';

import NavLink from '@deps/components/nav-element/nav-link/nav-link';
import NavText, { NavTextVariant } from '@deps/components/nav-text/nav-text';
import { useActive } from '@deps/hooks/useActive';
import { NestedNavDrawerTest } from '@deps/jest/constants/test-id-constants';

import { getNavItemClasses } from '../nested-nav-drawer.helper';
import { NestedNavParentItemProps } from '../nested-nav-drawer.types';
import { EndIcon } from '../nested-nav-end-icon/nested-nav-end-icon';
import { StartIcon } from '../nested-nav-start-icon/nested-nav-start-icon';

const NestedNavParentItem = ({ link, isExpanded, handleClick, isNavDrawerOpen = true, pathname }: NestedNavParentItemProps) => {
    const { t } = useTranslation();
    const { href, text, startIcon, subLinks } = link;
    const isActive = useActive(link);
    const isParent = (subLinks?.length && subLinks.length > 0) as boolean;
    const [isTransitioning, setIsTransitioning] = useState(false);
    const classes = getNavItemClasses(isActive, 'text-md !shadow-none');
    const linkTranslation = t(`sidenav.navButtons.${link.parentKey}`);

    useEffect(() => {
        if (!isNavDrawerOpen) {
            setIsTransitioning(false);
        }
    }, [isNavDrawerOpen]);

    const handleInternalClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (handleClick) {
            setIsTransitioning(true);
            handleClick(event);
        }
    };

    const startIconMemo = useMemo(() => <StartIcon icon={startIcon} isActive={isActive} isParent={true} />, [isActive, startIcon]);

    const innerLink = (
        <>
            {startIconMemo}
            {isNavDrawerOpen && (
                <>
                    <NavText
                        text={text}
                        variant={isActive ? NavTextVariant.NavDrawerSelected : NavTextVariant.NavDrawer}
                        className="ml-2 !text-white"
                    />

                    {isParent && <EndIcon classNames={isTransitioning ? 'simple-transition' : ''} isExpanded={isExpanded} />}
                </>
            )}
        </>
    );

    return isParent ? (
        <button
            onClick={handleInternalClick}
            className={classes}
            data-testid={NestedNavDrawerTest.NESTED_NAV_PARENT_ITEM}
            aria-label={`${isExpanded ? t('sidenav.collapse') : t('sidenav.expand')} ${linkTranslation}`}
        >
            {innerLink}
        </button>
    ) : (
        <NavLink
            href={href}
            onClick={handleClick}
            className={classes}
            data-testid={NestedNavDrawerTest.NESTED_NAV_PARENT_ITEM}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`${linkTranslation}`}
            pathname={pathname}
        >
            {innerLink}
        </NavLink>
    );
};

export default NestedNavParentItem;
