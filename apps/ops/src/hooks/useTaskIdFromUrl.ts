import { useCallback, useEffect, useRef } from 'react';

/**
 * @deprecated Use standard Sidesheet from Bloom component library
 */
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';

interface UseTaskIdFromUrlProps {
    taskId?: string;
    onTaskIdMatch: () => void;
    isReady?: boolean;
}

export function useTaskIdFromUrl({
    taskId,
    onTaskIdMatch,
    isReady = true,
}: UseTaskIdFromUrlProps) {
    const sideSheet = useSideSheetContextLegacy();
    const previousTaskIdRef = useRef<string | undefined>(undefined);
    const previousIsReadyRef = useRef<boolean>(isReady);
    const onTaskIdMatchRef = useRef(onTaskIdMatch);

    useEffect(() => {
        onTaskIdMatchRef.current = onTaskIdMatch;
    }, [onTaskIdMatch]);

    const removeTaskIdFromUrl = useCallback(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('taskId');
            const newSearch = url.searchParams.toString();
            const newUrl = url.pathname + (newSearch ? `?${newSearch}` : '');
            window.history.replaceState(window.history.state, '', newUrl);
        }
    }, []);

    useEffect(() => {
        const handleSideSheetClose = () => {
            previousTaskIdRef.current = undefined;
            removeTaskIdFromUrl();
        };
        sideSheet.events.on('close', handleSideSheetClose);
        return () => {
            sideSheet.events.off('close', handleSideSheetClose);
        };
    }, [sideSheet.events, removeTaskIdFromUrl]);

    useEffect(() => {
        if (typeof window === 'undefined' || !taskId) {
            previousTaskIdRef.current = taskId;
            previousIsReadyRef.current = isReady;
            return;
        }

        if (!isReady) {
            previousIsReadyRef.current = isReady;
            return;
        }

        const taskIdChanged = previousTaskIdRef.current !== taskId;
        const becameReady = !previousIsReadyRef.current && isReady;

        if (!taskIdChanged && !becameReady) {
            return;
        }

        previousTaskIdRef.current = taskId;
        previousIsReadyRef.current = isReady;

        const urlParams = new URLSearchParams(window.location.search);
        const taskIdFromUrl = urlParams.get('taskId');
        if (taskIdFromUrl && taskIdFromUrl === taskId) {
            onTaskIdMatchRef.current();
        }
    }, [taskId, isReady]);
}
