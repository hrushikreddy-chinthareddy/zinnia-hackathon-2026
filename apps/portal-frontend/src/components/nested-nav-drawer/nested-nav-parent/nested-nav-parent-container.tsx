import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

import NestedNavActionItem from '@deps/components/nested-nav-drawer/nested-nav-action-item/nested-nav-action-item';
import NestedNavParentItem from '@deps/components/nested-nav-drawer/nested-nav-parent/nested-nav-parent-item';
import { NestedSubLink, ParentKeys } from '@deps/config/nav.config';
import { useStaticNestedNavDrawerContext } from '@deps/contexts/LayoutContexts/StaticNestedNavDrawerContext';
import { useActive } from '@deps/hooks/useActive';

// for transition- 24px height + 8px gap- will need to be updated if designs change
const LIST_ITEM_HEIGHT = 32;

interface NestedNavParentContainerProps {
    isNavDrawerOpen?: boolean;
    parentLink: NestedSubLink;
    toggleNavDrawer: () => void;
}

const NestedNavParentContainer = ({ isNavDrawerOpen, parentLink, toggleNavDrawer }: NestedNavParentContainerProps) => {
    const isActive = useActive(parentLink);
    const [inTransition, setInTransition] = useState(false);
    const containerRef = useRef<HTMLUListElement>(null);
    const { selectedParentKey, setSelectedParentKey } = useStaticNestedNavDrawerContext();
    const isSelectedParentKey = selectedParentKey === parentLink.parentKey;
    const [isExpanded, setIsExpanded] = useState(isSelectedParentKey);

    useEffect(() => {
        if (!selectedParentKey) {
            isActive && setSelectedParentKey(parentLink.parentKey as ParentKeys);
        }
    }, [isActive, parentLink.parentKey, selectedParentKey, setSelectedParentKey]);

    // listener to retain 'overflow-hidden' during entire transition
    useEffect(() => {
        const onTransitionEnd = () => {
            setInTransition(false);
        };

        if (containerRef?.current) {
            const currentRef = containerRef.current;
            currentRef?.addEventListener('transitionend', onTransitionEnd);
            return () => {
                currentRef?.removeEventListener('transitionend', onTransitionEnd);
            };
        }
    }, [containerRef]);

    useEffect(() => {
        if (!isNavDrawerOpen) {
            // when closing nav drawer- reset state
            setInTransition(false);
            setIsExpanded(false);
            setSelectedParentKey(null);
        }

        if (isNavDrawerOpen) {
            // when opening nav drawer and while nav drawer is open
            if (isActive && !selectedParentKey) {
                // if active container and no user interactions- set as expanded also reset selectedParentKey
                setIsExpanded(true);
                setSelectedParentKey(parentLink.parentKey as ParentKeys);
            } else if (!isSelectedParentKey) {
                // if user clicked another container- set as unexpanded
                setInTransition(true);
                setIsExpanded(false);
            } else if (isSelectedParentKey) {
                setIsExpanded(true);
            }
        }
    }, [isActive, isNavDrawerOpen, isSelectedParentKey, parentLink.parentKey, selectedParentKey, setSelectedParentKey]);

    const handleClick = () => {
        setSelectedParentKey(parentLink.parentKey as ParentKeys);

        if (!isNavDrawerOpen) {
            // if nav drawer is closed- open nav and set container as expanded
            setIsExpanded(true);
            parentLink.subLinks && toggleNavDrawer();
        }

        if (isNavDrawerOpen) {
            // if nav drawer is open- toggle container expanded state
            setInTransition(true);
            setIsExpanded(!isExpanded);
        }
    };

    const containerListClasses = clsx('flex list-none flex-col gap-2', {
        'h-[var(--nav-parent-container-height)]': isExpanded,
        'h-0': !isExpanded,
        'transition-height duration-700': inTransition,
        'overflow-hidden': !isExpanded || inTransition,
        'overflow-visible': isExpanded && !inTransition,
    });

    // for transition- tailwind does not like dynamic classnames- we use the style prop to save height
    const height = `${LIST_ITEM_HEIGHT * (parentLink?.subLinks?.length ?? 0)}px`;

    return (
        <>
            <NestedNavParentItem handleClick={handleClick} isNavDrawerOpen={isNavDrawerOpen} isExpanded={isExpanded} link={parentLink} />
            <ul
                className={containerListClasses}
                ref={containerRef}
                style={
                    {
                        '--nav-parent-container-height': height,
                    } as React.CSSProperties
                }
            >
                {parentLink.subLinks?.map(subLink => (
                    <li className="first:mt-2" key={subLink.text}>
                        <NestedNavActionItem
                            isNavDrawerOpen={isNavDrawerOpen}
                            link={subLink}
                            tabIndex={isExpanded ? 0 : -1}
                            toggleNavDrawer={toggleNavDrawer}
                        />
                    </li>
                ))}
            </ul>
        </>
    );
};

export default NestedNavParentContainer;
