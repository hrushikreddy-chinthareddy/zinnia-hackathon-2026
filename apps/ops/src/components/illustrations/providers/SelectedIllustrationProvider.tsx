import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from 'react';

import {
    IllustrationsClientCase,
    IllustrationSummary,
} from '@deps/types/illustrations';
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
    clientCaseId: string;
    clientCase: IllustrationsClientCase | null | undefined;
};

export const SelectedIllustrationContext =
    createContext<SelectedIllustrationContextValue | null>(null);

export function SelectedIllustrationProvider(props: {
    children: ReactNode;
    clientCaseId: string;
    clientCase: IllustrationsClientCase | null | undefined;
}) {
    const [selectedIllustration, setSelectedIllustration] =
        useState<SelectedIllustrationsState | null>(null);
    const [isLoadingSelectForApplication, setIsLoadingSelectForApplication] =
        useState(false);
    const [newBusinessCaseId, setNewBusinessCaseId] = useState<string | null>(
        null
    );
    const [eAppLink, setEAppLink] = useState<string | undefined>(undefined);

    const handleSelectIllustration = useCallback(
        (product: Product, illustration: IllustrationSummary) => {
            if (!props.clientCaseId || Array.isArray(props.clientCaseId))
                return;

            if (
                selectedIllustration?.illustration?.id === illustration.id &&
                selectedIllustration?.product?.carrierProductId ===
                    product.carrierProductId
            ) {
                // Already selected; skip
                return;
            }

            setSelectedIllustration({ illustration, product });
        },
        [
            props.clientCaseId,
            selectedIllustration?.illustration?.id,
            selectedIllustration?.product?.carrierProductId,
        ]
    );

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
                clientCaseId: props.clientCaseId,
                clientCase: props.clientCase,
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
