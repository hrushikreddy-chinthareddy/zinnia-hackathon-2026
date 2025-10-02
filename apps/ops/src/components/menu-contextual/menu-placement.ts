export interface PlacementRect {
    bottom: number;
    left: number;
    right: number;
    top: number;
}

export interface ViewportInfo {
    scrollY: number;
    innerHeight: number;
    innerWidth: number;
}

export interface MenuDimensions {
    height?: number;
    width?: number;
}

export interface MenuPlacement {
    side: 'top' | 'bottom' | 'left' | 'right';
    align: 'start' | 'end';
}

export function calculateMenuPlacement(
    rect: PlacementRect,
    viewport: ViewportInfo,
    dimensions: MenuDimensions = {}
): MenuPlacement {
    const { bottom, left, right, top } = rect;
    const { scrollY, innerHeight, innerWidth } = viewport;

    const menuHeight = dimensions.height ?? 300;
    const menuWidth = dimensions.width ?? 320;
    const scrollThreshold = menuHeight / 4;

    const isNearTopOfPage = scrollY <= scrollThreshold;
    const availableSpaceBelow = innerHeight - (bottom - scrollY);
    const availableSpaceAbove = top - scrollY;
    const hasLimitedVerticalSpace =
        Math.max(availableSpaceBelow, availableSpaceAbove) < menuHeight;

    if (isNearTopOfPage && hasLimitedVerticalSpace) {
        const spaceOnRight = innerWidth - right;
        const spaceOnLeft = left;

        if (spaceOnRight > spaceOnLeft && spaceOnRight > menuWidth) {
            return { side: 'right', align: 'start' };
        }

        if (spaceOnLeft > menuWidth) {
            return { side: 'left', align: 'start' };
        }
    }

    return {
        side:
            Math.floor((top + bottom) / 2) > Math.floor(innerHeight / 2)
                ? 'top'
                : 'bottom',
        align:
            Math.floor((left + right) / 2) > Math.floor(innerWidth / 2)
                ? 'end'
                : 'start',
    };
}
