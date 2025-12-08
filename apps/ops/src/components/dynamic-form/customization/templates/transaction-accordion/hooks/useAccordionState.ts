import { useRef, useState, useEffect } from 'react';

export function useAccordionState(templateId: string, itemsLen: number) {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const prevLen = useRef(itemsLen);

    useEffect(() => setActiveIndex(0), [templateId]);

    useEffect(() => {
        const oldLen = prevLen.current;

        if (itemsLen > oldLen) setActiveIndex(itemsLen - 1);

        if (itemsLen < oldLen) {
            setActiveIndex((prev) =>
                prev !== null && prev < itemsLen ? prev : null
            );
        }

        prevLen.current = itemsLen;
    }, [itemsLen]);

    return { activeIndex, setActiveIndex };
}
