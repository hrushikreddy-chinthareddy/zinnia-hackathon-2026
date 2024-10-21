import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useEffect } from 'react';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useNigoEntry } from '@deps/containers/nigo-entry-container/components/nigo-entry-provider';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { DocumentData } from '@deps/models/case/document';

import { TaskReview } from './task-review';

interface TaskReviewStepProps {
    policyNumber: string;
    documentNumber: string;
    docType: string;
    clientCode: string;
    taskInfoLink: string;
    document?: DocumentData;
}

export const TaskReviewStep = ({ policyNumber, documentNumber, docType, clientCode, taskInfoLink, document }: TaskReviewStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'suitability.taskReview' });
    const { goToNext } = useWorkflow();
    const { isReadyForDataEntry } = useNigoEntry();
    const router = useRouter();
    const formState = useContext(FormDataContext);
    const { formData, setFormData } = formState;

    const handleStepContinue = useCallback(() => {
        if (!isReadyForDataEntry) {
            goToNext();
        } else {
            router.push(taskInfoLink);
        }
    }, [goToNext, isReadyForDataEntry, router, taskInfoLink]);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${clientCode.toUpperCase()}_WD_REDEMPTION_DIGITAL_FORM`,
            metaData: {
                formType: `${clientCode.toUpperCase()}_WD_REDEMPTION_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, [clientCode]);

    return (
        <WorkflowCard
            title={t('title')}
            subtitle={t('subTitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <TaskReview
                        activeDocType={DocumentTypeView.Policy}
                        documentNumber={documentNumber}
                        clientCode={clientCode}
                        policyNumber={policyNumber}
                        docType={docType}
                    />
                </div>
            </div>
        </WorkflowCard>
    );
};
