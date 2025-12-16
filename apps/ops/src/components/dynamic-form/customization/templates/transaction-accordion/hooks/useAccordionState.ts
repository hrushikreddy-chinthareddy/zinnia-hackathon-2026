import { useEffect, useRef, useState } from 'react';
export function useAccordionState(templateId: string, itemsLen: number) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const prevItemsLenRef = useRef(itemsLen);
    const prevTemplateIdRef = useRef(templateId);
    useEffect(() => {
        const prevLen = prevItemsLenRef.current;
        const prevTemplate = prevTemplateIdRef.current;
        if (templateId !== prevTemplate) {
            setActiveIndex(null);
        } else if (itemsLen > prevLen) {
            setActiveIndex(itemsLen - 1);
        } else if (itemsLen < prevLen) {
            setActiveIndex((prev) =>
                prev !== null && prev < itemsLen ? prev : null
            );
        }
        prevItemsLenRef.current = itemsLen;
        prevTemplateIdRef.current = templateId;
    }, [templateId, itemsLen]);
    return { activeIndex, setActiveIndex };
}
