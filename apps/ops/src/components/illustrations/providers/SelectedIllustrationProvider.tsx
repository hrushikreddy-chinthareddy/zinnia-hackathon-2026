import { useRouter } from 'next/router';
import { createContext, ReactNode, useContext, useState } from 'react';

import { IllustrationSummary } from '@deps/types/illustrations';
import { Product } from '@deps/types/product';

type SelectedIllustrationsState = {
    illustration: IllustrationSummary;
    product: Product;
};

type SelectedIllustrationContextValue = {
    selectedIllustration: SelectedIllustrationsState | null;
    isLoadingSelectForApplication: boolean;
    newBusinessCaseId: string | null;
    eAppLink: string | undefined;
    onSelectedIllustrationChange: (data: SelectedIllustrationsState) => void;
    handleSelectIllustration: (
        product: Product,
        illustration: IllustrationSummary
    ) => void;
    setIsLoadingSelectForApplication: (isLoading: boolean) => void;
    setNewBusinessCaseId: (caseId: string) => void;
    setEAppLink: (eAppLink: string | undefined) => void;
};

export const SelectedIllustrationContext =
    createContext<SelectedIllustrationContextValue | null>(null);

export function SelectedIllustrationProvider(props: { children: ReactNode }) {
    const router = useRouter();
    const { clientCaseId } = router.query;
    const [selectedIllustration, setSelectedIllustration] =
        useState<SelectedIllustrationsState | null>(null);
    const [isLoadingSelectForApplication, setIsLoadingSelectForApplication] =
        useState(false);
    const [newBusinessCaseId, setNewBusinessCaseId] = useState<string | null>(
        null
    );
    const [eAppLink, setEAppLink] = useState<string | undefined>(undefined);

    const handleSelectIllustration = (
        product: Product,
        illustration: IllustrationSummary
    ) => {
        if (!clientCaseId || Array.isArray(clientCaseId)) return;

        setSelectedIllustration({ illustration, product });

        if (selectedIllustration?.illustration?.id === illustration.id) {
            // Idempotency to avoid emitting redundant router events
            return;
        }

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
                isLoadingSelectForApplication,
                newBusinessCaseId,
                eAppLink,
                onSelectedIllustrationChange: (data) =>
                    setSelectedIllustration(data),
                handleSelectIllustration,
                setIsLoadingSelectForApplication: (isLoading: boolean) =>
                    setIsLoadingSelectForApplication(isLoading),
                setNewBusinessCaseId: (caseId: string) =>
                    setNewBusinessCaseId(caseId),
                setEAppLink: (eappLink: string | undefined) =>
                    setEAppLink(eappLink),
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
