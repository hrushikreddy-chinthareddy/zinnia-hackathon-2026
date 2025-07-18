import { createContext, PropsWithChildren, useContext, useState } from 'react';

export type EAppData = {
    solveFor?: string;
    targetPremium?: number;
    faceAmount?: number;
    initialPremium?: number;
};

type EappContextValue = {
    data: EAppData;
    onEAppDataChange: (data: EAppData) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const EAppContext = createContext<EappContextValue | undefined>(
    undefined
);

export function EAppProvider(props: PropsWithChildren<{}>) {
    const [eAppData, setEAppData] = useState<EAppData>({});

    return (
        <EAppContext.Provider
            value={{
                data: eAppData,
                onEAppDataChange: (data) => setEAppData(data),
            }}
        >
            {props.children}
        </EAppContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEapp(): EappContextValue {
    const context = useContext(EAppContext);

    if (!context) {
        throw new Error('useIllustration must be used within a EappProvider');
    }

    return context;
}
