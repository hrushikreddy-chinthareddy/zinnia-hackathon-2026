import { useContext, useState } from 'react';

import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import { CallCenterElement } from '@deps/models/case/send-document';
import { ManagementTask, TaskDocument } from '@deps/models/case/task-instance';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { TaskDataContext } from './task-context';

type TaskProviderProps = {
    children: React.ReactNode;
    initialTask: ManagementTask;
    correlationId: string;
};

export const TaskProvider = ({
    children,
    initialTask,
    correlationId,
}: TaskProviderProps) => {
    const [task, setTask] = useState<ManagementTask>(initialTask);
    const [isReadyForDataEntry, setIsReadyForDataEntry] =
        useState<boolean>(false);
    const [messages, setMessages] = useState<any>([]);
    const [exceptions, setExceptions] = useState<string[]>([]);
    const [transactionType, setTransactionType] = useState<
        CallCenterElement<string, SimpleOption>
    >({} as CallCenterElement<string, SimpleOption>);
    const [transactionSubType, setTransactionSubType] = useState<
        CallCenterElement<string, SimpleOption>
    >({} as CallCenterElement<string, SimpleOption>);
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [submitFailed, setSubmitFailed] = useState(false);
    // const [metaData, setMetaData] = useState(taskMetadata);
    const [mappedDocuments, setMappedDocuments] = useState<TaskDocument[]>(
        initialTask?.mappedDocuments || []
    );

    return (
        <TaskDataContext.Provider
            value={{
                initialTask,
                mappedDocuments,
                setMappedDocuments,
                task,
                correlationId,
                isReadyForDataEntry,
                exceptions,
                messages,
                transactionType,
                transactionSubType,
                formErrors,
                submitFailed,
                setTask,
                setIsReadyForDataEntry,
                setExceptions,
                setMessages,
                setTransactionType,
                setTransactionSubType,
                setFormErrors,
                setSubmitFailed,
            }}
        >
            {children}
        </TaskDataContext.Provider>
    );
};

export const useTask = () => {
    const context = useContext(TaskDataContext);

    if (!context) {
        throw new Error('context is not defined within a TaskProvider');
    }
    return context;
};
