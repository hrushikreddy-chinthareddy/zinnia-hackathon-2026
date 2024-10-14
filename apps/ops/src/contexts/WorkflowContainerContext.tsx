import { createContext, useCallback, useContext, useState } from 'react';

interface WorkflowContextType {
    currentStepIndex: number;
    goToNext: () => void;
    setCurrentStepIndex: (index: number) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const useWorkflowContext = () => {
    const context = useContext(WorkflowContext);

    if (!context) {
        throw new Error('useWorkflowContext must be used within a WorkflowProvider');
    }

    return context;
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const goToNext = useCallback(() => {
        setCurrentStepIndex(currentStep => {
            return currentStep + 1;
        });
    }, [setCurrentStepIndex]);

    const contextValue: WorkflowContextType = {
        currentStepIndex,
        goToNext,
        setCurrentStepIndex,
    };

    return <WorkflowContext.Provider value={contextValue}>{children}</WorkflowContext.Provider>;
};

export const useWorkflow = () => {
    const context = useContext(WorkflowContext);

    if (!context) {
        throw new Error('useWorkflow must be used within a WorkflowProvider');
    }
    return context;
};
