import { useState, useEffect } from 'react';

export const useScreenSize = (breakpoint: number): boolean => {
    const [isScreenLarge, setIsScreenLarge] = useState(false);

    useEffect(() => {
        setIsScreenLarge(window.innerWidth >= breakpoint);
    }, [breakpoint]);

    return isScreenLarge;
};
