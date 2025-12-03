import { useState, useEffect } from 'react';

interface UseLoadingTimeConfig {
    incrementInterval: number;
    noMessageThreshold: number;
    gatheringThreshold: number;
    organizingThreshold: number;
}

export const useLoadingTime = (
    isLoading: boolean,
    config: UseLoadingTimeConfig
) => {
    const { incrementInterval } = config || {};

    const [loadingTime, setLoadingTime] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;

        if (isLoading) {
            setLoadingTime(0);
            interval = setInterval(() => {
                setLoadingTime((prev) => prev + incrementInterval);
            }, incrementInterval);
        } else {
            setLoadingTime(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading, incrementInterval]);

    return loadingTime;
};
