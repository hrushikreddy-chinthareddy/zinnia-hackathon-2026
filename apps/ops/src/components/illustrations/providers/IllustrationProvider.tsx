import { createContext, PropsWithChildren, useContext, useState } from 'react';

export type IllustrationData = {
    solveFor?: string;
    targetPremium?: number;
    faceAmount?: number;
    initialPremium?: number;
};

type IllustrationContextValue = {
    data: IllustrationData;
    onIllustrationDataChange: (data: IllustrationData) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const IllustrationContext = createContext<
    IllustrationContextValue | undefined
>(undefined);

export function IllustrationProvider(props: PropsWithChildren<{}>) {
    const [illustrationData, setIllustrationData] = useState<IllustrationData>(
        {}
    );

    return (
        <IllustrationContext.Provider
            value={{
                data: illustrationData,
                onIllustrationDataChange: (data) => setIllustrationData(data),
            }}
        >
            {props.children}
        </IllustrationContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useIllustration(): IllustrationContextValue {
    const context = useContext(IllustrationContext);

    if (!context) {
        throw new Error(
            'useIllustration must be used within a IllustrationProvider'
        );
    }

    return context;
}
