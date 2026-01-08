import { useContext, useState } from 'react';

import { SelfServeTransactionContext } from '@deps/contexts/SelfServeTransactionContext';
import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';

type SelfServeTransactionProviderProps = {
    children: React.ReactNode;
};
export const SelfServeTransactionProvider = ({
    children,
}: SelfServeTransactionProviderProps) => {
    const [formData, setFormData] = useState({});
    return (
        <WorkflowProvider>
            <SelfServeTransactionContext.Provider
                value={{ formData, setFormData }}
            >
                {children}
            </SelfServeTransactionContext.Provider>
        </WorkflowProvider>
    );
};

export const useSelfServeTransactionContext = () => {
    const context = useContext(SelfServeTransactionContext);

    if (!context) {
        throw new Error(
            'useSelfServeTransactionContext must be used within a SelfServeTransactionProvider'
        );
    }
    return context;
};
