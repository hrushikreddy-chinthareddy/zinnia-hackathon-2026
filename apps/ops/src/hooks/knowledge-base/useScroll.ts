import { useEffect, useRef, useState } from 'react';

export const useScroll = (currentMessages: any) => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const endref = useRef<HTMLDivElement | null>(null);
    const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || !endref.current) return;

        const isContentScrollable =
            container.scrollHeight > container.clientHeight;

        if (isContentScrollable && !isUserScrolledUp) {
            endref.current.scrollIntoView({ behavior: 'smooth' });
        } else if (!isContentScrollable) {
            if (isUserScrolledUp) setIsUserScrolledUp(false);
        }
    }, [currentMessages, isUserScrolledUp]);

    const handleContainerScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const isContentScrollable =
            container.scrollHeight > container.clientHeight;

        if (!isContentScrollable) {
            if (isUserScrolledUp) setIsUserScrolledUp(false);
            return;
        }
        const isCurrentlyAtBottom =
            container.scrollHeight -
                container.scrollTop -
                container.clientHeight <
            10;

        if (isUserScrolledUp && isCurrentlyAtBottom) {
            setIsUserScrolledUp(false);
        } else if (!isUserScrolledUp && !isCurrentlyAtBottom) {
            setIsUserScrolledUp(true);
        }
    };

    return {
        isUserScrolledUp,
        handleContainerScroll,
        scrollContainerRef,
        endref,
    };
};
