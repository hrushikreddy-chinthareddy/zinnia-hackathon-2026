import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
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
    handleSelectIllustration: (illustrationId: string) => void;
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
    products: Product[];
}) {
    const [selectedIllustrationId, setSelectedIllustrationId] = useState<
        string | null
    >(null);
    const [isLoadingSelectForApplication, setIsLoadingSelectForApplication] =
        useState(false);
    const [newBusinessCaseId, setNewBusinessCaseId] = useState<string | null>(
        null
    );
    const [eAppLink, setEAppLink] = useState<string | undefined>(undefined);

    const handleSelectIllustration = useCallback(
        (illustrationId: string) => {
            if (!props.clientCaseId) return;

            setSelectedIllustrationId(illustrationId);
        },
        [props.clientCaseId]
    );

    const targetIllustration =
        props.clientCase?.illustrations?.find(
            (ill) => ill.id === selectedIllustrationId
        ) ?? null;
    const associatedProduct =
        props.products.find(
            (product) =>
                product.carrierProductId === targetIllustration?.productId
        ) ?? null;

    const selectedIllustration = useMemo(() => {
        if (!targetIllustration || !associatedProduct) {
            return null;
        }

        return {
            illustration: targetIllustration,
            product: associatedProduct,
        };
    }, [targetIllustration, associatedProduct]);

    return (
        <SelectedIllustrationContext.Provider
            value={{
                selectedIllustration,
                isLoadingSelectForApplication,
                newBusinessCaseId,
                eAppLink,
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
