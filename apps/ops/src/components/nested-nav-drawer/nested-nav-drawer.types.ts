import { NestedSubLink, ParentKeys } from '@deps/config/nav.config';

interface NestedNavDrawerBaseItemProps {
    isNavDrawerOpen?: boolean;
    link: NestedSubLink;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface NestedNavActionItemProps extends NestedNavDrawerBaseItemProps {
    classNames?: string;
    isBaseLink?: boolean;
    setSelectedParentKey?: (text: ParentKeys | null) => void;
    tabIndex?: number;
    toggleNavDrawer: () => void;
}

export interface NestedNavParentItemProps extends NestedNavDrawerBaseItemProps {
    isExpanded?: boolean;
    handleClick?: (event: React.MouseEvent<HTMLElement>) => void;
    pathname?: string;
}
