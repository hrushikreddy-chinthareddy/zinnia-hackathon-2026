import { Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import { cloneElement, useEffect, useRef, useState } from 'react';

export type PopoverOnTruncateProps = {
    children: JSX.Element;
    title?: string | JSX.Element;
    placement?: TooltipPlacement;
    popoverBody?: string | JSX.Element;
    popoverClassName?: string;
    triggerClassName?: string;
    triggerAriaLabel?: string;
};

export default function PopoverOnTruncate({
    children,
    title,
    placement = TooltipPlacement.TopRight,
    popoverClassName,
    triggerClassName,
    triggerAriaLabel,
}: PopoverOnTruncateProps) {
    const ref = useRef<HTMLElement>(null);
    const [isOverflown, setIsOverflown] = useState(false);

    useEffect(() => {
        let observer: ResizeObserver;

        function applyTooltip() {
            const element = ref.current;

            if (element) {
                setIsOverflown(
                    element.offsetWidth < element.scrollWidth ||
                        element.offsetHeight < element.scrollHeight
                );
            }
        }

        if (ref.current) {
            observer = new ResizeObserver(applyTooltip);
            applyTooltip();

            observer.observe(ref.current);
        }

        return () => {
            if (observer) observer.disconnect();
        };
    }, [ref.current?.offsetWidth, ref.current?.offsetHeight]);

    const childrenClone = cloneElement(children, { ref });

    if (!isOverflown) return childrenClone;
    return (
        <Tooltip
            tooltipClassName={popoverClassName}
            trigger={childrenClone}
            placement={placement}
            triggerClassName={`w-fit ${triggerClassName ?? ''}`}
            triggerAriaLabel={triggerAriaLabel}
        >
            {title}
        </Tooltip>
    );
}
