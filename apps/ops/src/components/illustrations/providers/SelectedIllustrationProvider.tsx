import { useRouter } from 'next/router';
import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { IllustrationSummary } from '@deps/types/illustrations';
import { Product } from '@deps/types/product';

type SelectedIllustrationsState = {
    illustration: IllustrationSummary;
    product: Product;
} | null;

type SelectedIllustrationContextValue = {
    selectedIllustration: SelectedIllustrationsState;
    onSelectedIllustrationChange: (data: SelectedIllustrationsState) => void;
    handleSelectIllustration: (
        product: Product,
        illustration: IllustrationSummary
    ) => void;
};

const SelectedIllustrationContext =
    createContext<SelectedIllustrationContextValue | null>(null);

export function SelectedIllustrationProvider(props: PropsWithChildren<{}>) {
    const router = useRouter();
    const { clientCaseId } = router.query;
    const [selectedIllustration, setSelectedIllustration] =
        useState<SelectedIllustrationsState | null>(null);

    const handleSelectIllustration = (
        product: Product,
        illustration: IllustrationSummary
    ) => {
        if (!clientCaseId || Array.isArray(clientCaseId)) return;

        setSelectedIllustration({ illustration, product });
        router.push(
            `/illustrations/client-cases/${clientCaseId}/illustrate/${illustration.id}`,
            undefined,
            { shallow: true }
        );
    };

    return (
        <SelectedIllustrationContext.Provider
            value={{
                selectedIllustration,
                onSelectedIllustrationChange: (data) =>
                    setSelectedIllustration(data),
                handleSelectIllustration,
            }}
        >
            {props.children}
        </SelectedIllustrationContext.Provider>
    );
}

export const useSelectedIllustration = () => {
    const context = useContext(SelectedIllustrationContext);
    if (!context) {
        throw new Error(
            'useSelectedIllustration must be used within a SelectedIllustrationProvider'
        );
    }

    return context;
};
