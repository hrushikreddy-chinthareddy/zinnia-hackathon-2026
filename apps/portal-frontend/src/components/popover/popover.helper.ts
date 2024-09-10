import { PopoverPlacement } from './popover';

export const commonPopoverClasses =
    'z-40 max-w-[195px] overflow-hidden rounded bg-gray-900 p-3 text-left leading-4 tracking-[.00357em] text-white shadow-elevation-dark-08 sm:max-w-[320px] w-max';

export const commonTriggerClasses = 'default-focus group relative inline-block rounded-xl';

export const getPlacementProps = (placement: PopoverPlacement) => {
    let side: 'top' | 'bottom' | undefined;
    let align: 'end' | 'start' | 'center' | undefined;

    switch (placement) {
        case PopoverPlacement.TopLeft:
            side = 'top';
            align = 'end';
            break;
        case PopoverPlacement.TopRight:
            side = 'top';
            align = 'start';
            break;
        case PopoverPlacement.BottomLeft:
            side = 'bottom';
            align = 'end';
            break;
        default:
        case PopoverPlacement.BottomRight:
            side = 'bottom';
            align = 'start';
            break;
    }

    return { side, align };
};
