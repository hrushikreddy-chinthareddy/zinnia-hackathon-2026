import { Emitter } from 'mitt';
import { useRouter } from 'next/router';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import SideSheet, {
    SideSheetLocation,
} from '@deps/components/side-sheet/side-sheet';
import useEmitter from '@deps/hooks/useEmitter';

export type MittEvents = {
    open: undefined;
    close: undefined;
    openSecondary: undefined;
    closeSecondary: undefined;
};

export interface SideSheetContextLegacyProps {
    events: Emitter<MittEvents>;
    changeSideSheetContent: (
        header: string | React.ReactNode,
        body?: React.ReactNode,
        showHeader?: boolean
    ) => void;
    handleLocation: (location: SideSheetLocation) => void;
    handleOpen: (isOpen: boolean, width?: number | string) => void;
    openSecondarySideSheet: (
        header: string | React.ReactNode,
        body?: React.ReactNode
    ) => void;
    onClose: () => void;
}

export const SideSheetContextLegacy =
    createContext<SideSheetContextLegacyProps>(
        {} as SideSheetContextLegacyProps
    );

export const useSideSheetContextLegacy = () => {
    return useContext(SideSheetContextLegacy);
};

interface SideSheetProviderLegacyProps {
    children: React.ReactNode;
}

export const SideSheetProviderLegacy = ({
    children,
}: SideSheetProviderLegacyProps) => {
    const emitter = useEmitter<MittEvents>();
    const [header, setHeader] = useState<string | undefined>('');
    const [headerComponent, setHeaderComponent] = useState<React.ReactNode>(
        <></>
    );
    const [contentComponent, setContentComponent] = useState<React.ReactNode>(
        <></>
    );
    const [location, setLocation] = useState<SideSheetLocation>(
        SideSheetLocation.Right
    );
    const [open, setOpen] = useState(false);
    const [width, setWidth] = useState<number | string>(500);
    const router = useRouter();
    const { taskId, ..._rest } = router.query;
    const [secondarySideSheetOpen, setSecondarySideSheetOpen] = useState(false);
    const [secondarySideSheetHeader, setSecondarySideSheetHeader] =
        useState<React.ReactNode>(null);
    const [secondarySideSheetContent, setSecondarySideSheetContent] =
        useState<React.ReactNode>(null);

    const onClose = useCallback(() => {
        if (!open) {
            return;
        }
        setOpen(false);
        emitter.emit('close');
    }, [open, emitter]);

    const closeAll = useCallback(() => {
        if (secondarySideSheetOpen) {
            setSecondarySideSheetOpen(false);
            emitter.emit('closeSecondary');
        }
        if (open) {
            onClose();
            emitter.emit('close');
        }
    }, [
        secondarySideSheetOpen,
        open,
        emitter,
        setSecondarySideSheetOpen,
        onClose,
    ]);

    useEffect(() => {
        router.events.on('routeChangeComplete', closeAll);

        return () => {
            router.events.off('routeChangeComplete', closeAll);
        };
    }, [closeAll, router.events]);

    const handleOpen = (isOpen: boolean, width?: number | string) => {
        if (width && typeof width === 'number' && width > 0) {
            setWidth(width);
        } else if (width) {
            setWidth(width);
        }

        setOpen(isOpen);
        emitter.emit(isOpen ? 'open' : 'close');
    };
    const handleLocation = (location: SideSheetLocation) => {
        setLocation(location);
    };

    const secondaryOnClose = () => {
        if (!secondarySideSheetOpen) {
            return;
        }
        setSecondarySideSheetOpen(false);
        emitter.emit('closeSecondary');
    };

    const handleComponentChange = (
        header: string | React.ReactNode,
        body?: React.ReactNode
    ) => {
        if (typeof header == 'string') {
            setHeaderComponent(null);
            setHeader(header);
        } else {
            setHeaderComponent(header);
            setHeader(undefined);
        }

        if (body) {
            setContentComponent(body);
        }
    };

    const openSecondarySideSheet = (
        header: string | React.ReactNode,
        body?: React.ReactNode
    ) => {
        setSecondarySideSheetHeader(header);
        setSecondarySideSheetContent(body);
        if (secondarySideSheetOpen) {
            return;
        }
        setSecondarySideSheetOpen(true);
        emitter.emit('openSecondary');
    };

    const ComponentToRender = contentComponent;

    return (
        <SideSheetContextLegacy.Provider
            value={{
                events: emitter,
                handleOpen,
                handleLocation,
                changeSideSheetContent: handleComponentChange,
                openSecondarySideSheet,
                onClose,
            }}
        >
            {children}
            <SideSheet
                open={open}
                handleClose={onClose}
                header={header}
                headerElement={headerComponent}
                closeOnEscape={!secondarySideSheetOpen}
                location={location}
                width={width}
            >
                {ComponentToRender || <></>}
            </SideSheet>
            <SideSheet
                open={secondarySideSheetOpen}
                handleClose={secondaryOnClose}
                headerElement={secondarySideSheetHeader}
                closeOnEscape={true}
                location={location}
                width={width}
            >
                {secondarySideSheetContent}
            </SideSheet>
        </SideSheetContextLegacy.Provider>
    );
};
