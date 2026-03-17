import { createContext, ReactNode, useContext, useState } from 'react';

type ModalContextState = {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    modalContent: ReactNode;
    setModalContent: (node: ReactNode) => void;
};

const ModalContextDefaultValues = {
    isModalOpen: false,
    setIsModalOpen: () => {},
    modalContent: null,
    setModalContent: () => {},
};

const ModalContext = createContext<ModalContextState>(
    ModalContextDefaultValues
);

const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ReactNode>(null);

    return (
        <ModalContext.Provider
            value={{
                isModalOpen,
                setIsModalOpen,
                modalContent,
                setModalContent,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};

export default ModalProvider;

export const useModalContext = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModalContext must be used within a ModalProvider');
    }
    return context;
};
