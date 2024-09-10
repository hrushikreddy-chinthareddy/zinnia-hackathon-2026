import { useMemo } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import NavElement, { NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { storage } from '@deps/helpers/sessionStorage.helper';
import { useActive } from '@deps/hooks/useActive';

import { getNavItemClasses } from '../nested-nav-drawer.helper';
import { NestedNavActionItemProps } from '../nested-nav-drawer.types';
import { StartIcon } from '../nested-nav-start-icon/nested-nav-start-icon';

const NestedNavActionItem = ({ isNavDrawerOpen = true, link, tabIndex, toggleNavDrawer }: NestedNavActionItemProps) => {
    const { href, startIcon, text } = link;
    const isActive = useActive(link);

    const classes = getNavItemClasses(isActive);

    const startIconMemo = useMemo(() => <StartIcon icon={startIcon} isActive={isActive} />, [isActive, startIcon]);

    const handleClick = () => {
        !storage.getItem('NAV_DRAWER_IS_OPEN') && toggleNavDrawer();
    };

    return (
        <NavElement
            type={NavElementType.Link}
            href={href ? href : '#'}
            className={`${classes} whitespace-nowrap`}
            variant={NavElementVariant.Text}
            tabIndex={tabIndex}
            onClick={handleClick}
            aria-current={isActive ? 'page' : undefined}
        >
            <div className="flex items-center">
                {startIconMemo}
                {isNavDrawerOpen && (
                    <Content
                        details={text}
                        variant={isActive ? ContentVariant.CaptionSelected : ContentVariant.Caption}
                        className="!text-white"
                    />
                )}
            </div>
        </NavElement>
    );
};

export default NestedNavActionItem;
