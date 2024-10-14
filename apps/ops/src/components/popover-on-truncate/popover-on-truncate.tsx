import { cloneElement, useEffect, useRef, useState } from 'react';

import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';

export type PopoverOnTruncateProps = {
    children: JSX.Element;
    title?: string | JSX.Element;
    placement?: PopoverPlacement;
    popoverBody?: string | JSX.Element;
    popoverClassName?: string;
};

export default function PopoverOnTruncate({
    children,
    title,
    placement = PopoverPlacement.TopRight,
    popoverClassName,
}: PopoverOnTruncateProps) {
    const ref = useRef<HTMLElement>(null);
    const [isOverflown, setIsOverflown] = useState(false);

    useEffect(() => {
        let observer: ResizeObserver;

        function applyTooltip() {
            const element = ref.current;

            if (element) {
                setIsOverflown(element.offsetWidth < element.scrollWidth || element.offsetHeight < element.scrollHeight);
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
        <Tooltip popoverClassName={popoverClassName} body={title} placement={placement}>
            {childrenClone}
        </Tooltip>
    );
}
