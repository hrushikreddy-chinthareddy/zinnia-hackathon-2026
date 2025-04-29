import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';

import SideSheet, { SideSheetLocation } from '@deps/components/side-sheet/side-sheet';

export interface SideSheetContextProps {
    changeSideSheetContent: (header: string | React.ReactNode, body?: React.ReactNode) => void;
    handleLocation: (location: SideSheetLocation) => void;
    handleOpen: (isOpen: boolean) => void;
    openSecondarySideSheet: (header: string | React.ReactNode, body?: React.ReactNode) => void;
    onClose: () => void;
}

export const SideSheetContext = createContext<SideSheetContextProps>({} as SideSheetContextProps);

export const useSideSheetContext = () => {
    return useContext(SideSheetContext);
};

interface SideSheetProviderProps {
    children: React.ReactNode;
}

export const SideSheetProvider: React.FC<SideSheetProviderProps> = ({ children }) => {
    const [header, setHeader] = useState<string | undefined>('');
    const [headerComponent, setHeaderComponent] = useState<React.ReactNode>(<></>);
    const [contentComponent, setContentComponent] = useState<React.ReactNode>(<></>);
    const [location, setLocation] = useState<SideSheetLocation>(SideSheetLocation.Right);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { taskId, ...rest } = router.query;
    const [secondarySideSheetOpen, setSecondarySideSheetOpen] = useState(false);
    const [secondarySideSheetHeader, setSecondarySideSheetHeader] = useState<React.ReactNode>(null);
    const [secondarySideSheetContent, setSecondarySideSheetContent] = useState<React.ReactNode>(null);

    useEffect(() => {
        router.events.on('routeChangeComplete', closeAll);

        return () => {
            router.events.off('routeChangeComplete', closeAll);
        };
    }, []);

    const handleOpen = (isOpen: boolean) => {
        setOpen(isOpen);
    };
    const handleLocation = (location: SideSheetLocation) => {
        setLocation(location);
    };

    const closeAll = () => {
        onClose();
        setSecondarySideSheetOpen(false);
    };

    const onClose = () => {
        setOpen(false);
    };

    const secondaryOnClose = () => {
        setSecondarySideSheetOpen(false);
    };

    const handleComponentChange = (header: string | React.ReactNode, body?: React.ReactNode) => {
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

    const openSecondarySideSheet = (header: string | React.ReactNode, body?: React.ReactNode) => {
        setSecondarySideSheetHeader(header);
        setSecondarySideSheetContent(body);
        setSecondarySideSheetOpen(true);
    };

    const ComponentToRender = contentComponent;

    return (
        <SideSheetContext.Provider
            value={{ handleOpen, handleLocation, changeSideSheetContent: handleComponentChange, openSecondarySideSheet, onClose }}
        >
            {children}
            <SideSheet
                open={open}
                handleClose={onClose}
                header={header}
                headerElement={headerComponent}
                closeOnEscape={!secondarySideSheetOpen}
                location={location}
            >
                {ComponentToRender || <></>}
            </SideSheet>
            <SideSheet
                open={secondarySideSheetOpen}
                handleClose={secondaryOnClose}
                headerElement={secondarySideSheetHeader}
                closeOnEscape={true}
                location={location}
            >
                {secondarySideSheetContent}
            </SideSheet>
        </SideSheetContext.Provider>
    );
};
