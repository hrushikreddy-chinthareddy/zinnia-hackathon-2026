import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';

import SideSheet, { SideSheetLocation } from '@deps/components/side-sheet/side-sheet';

export interface SideSheetContextProps {
    changeSideSheetContent: (header: string | React.ReactNode, body?: React.ReactNode) => void;
    handleLocation: (location: SideSheetLocation) => void;
    handleOpen: (isOpen: boolean) => void;
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

    useEffect(() => {
        router.events.on('routeChangeComplete', onClose);

        return () => {
            router.events.off('routeChangeComplete', onClose);
        };
    }, []);

    const handleOpen = (isOpen: boolean) => {
        setOpen(isOpen);
    };

    const handleLocation = (location: SideSheetLocation) => {
        setLocation(location);
    };

    const onClose = () => {
        setOpen(false);
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

    const ComponentToRender = contentComponent;

    return (
        <SideSheetContext.Provider value={{ handleOpen, handleLocation, changeSideSheetContent: handleComponentChange }}>
            {children}
            <SideSheet
                open={open}
                handleClose={onClose}
                header={header}
                headerElement={headerComponent}
                closeOnEscape={true}
                location={location}
            >
                {ComponentToRender || <></>}
            </SideSheet>
        </SideSheetContext.Provider>
    );
};
