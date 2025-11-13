import {
    createContext,
    PropsWithChildren,
    useContext,
    useMemo,
    useState,
} from 'react';

export type EAppData = {
    solveFor?: string;
    targetPremium?: number;
    mecPremium?: number;
    guidelineLevelPremium?: number;
    faceAmount?: number;
    initialPremium?: number;
    initialModalPremium?: number;
    cashValue?: number;
    paymentMode?: string;
    premiumMode?: string;
    netSurrenderValue?: number;
    netSurrenderAmountt5Years?: number;
    netSurrenderAmountt10Years?: number;
    netSurrenderAmountt15Years?: number;
    netSurrenderAmountt20Years?: number;
    netSurrenderAmountt30Years?: number;
    termLength?: string;
};

type EappContextValue = {
    data: EAppData;
    onEAppDataChange: (data: EAppData) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const EAppContext = createContext<EappContextValue | undefined>(
    undefined
);

export function EAppProvider(props: PropsWithChildren) {
    const [eAppData, setEAppData] = useState<EAppData>({});

    return (
        <EAppContext.Provider
            value={useMemo(
                () => ({
                    data: eAppData,
                    onEAppDataChange: setEAppData,
                }),
                [eAppData]
            )}
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
