import {
    AssistiveText,
    AssistiveTextVariant,
    Loader,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { NigoSubException } from '@deps/containers/task-container/components/steps/nigo-details/nigo-details.types';
import { useServiceFormReview } from '@deps/hooks/useServiceFormReview';
import { DocumentData } from '@deps/models/case/document';

import { ServiceFormReview } from './service-form-review';
import { NigoException } from '../nigo-details/nigo-details.types';

interface ServiceFormReviewStepProps {
    documentNumber: string;
    policyNumber: string;
    docType: string;
    clientCode: string;
    taskInfoLink: string;
    document: DocumentData;
    nigoExceptions: NigoException[];
    nigoSubExceptions: NigoSubException[];
}

export const ServiceFormReviewStep = ({
    documentNumber,
    policyNumber,
    docType,
    clientCode,
    document,
    nigoExceptions,
    nigoSubExceptions,
}: ServiceFormReviewStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'nigoEntry.serviceFormReview',
    });
    const [isLoading, setIsLoading] = useState(false);

    const {
        formErrors,
        handleStepContinue,
        filteredNigoException,
        isRenewals,
    } = useServiceFormReview({
        t,
        docType,
        clientCode,
        document,
        nigoExceptions,
        nigoSubExceptions,
        setIsLoading,
    });

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
            {isLoading && (
                <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                    <Loader />
                </div>
            )}
            <div className="flex flex-col">
                <div className="flex flex-col gap-1">
                    <ServiceFormReview
                        documentNumber={documentNumber}
                        clientCode={clientCode}
                        policyNumber={policyNumber as string}
                        docType={docType}
                        nigoExpection={filteredNigoException}
                        nigoSubExceptions={nigoSubExceptions}
                        isRenewals={isRenewals}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    {formErrors?.noDocTypeToReindex && (
                        <AssistiveText
                            text={formErrors?.noDocTypeToReindex}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                    {formErrors?.noNotes && (
                        <AssistiveText
                            text={formErrors?.noNotes}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                    {formErrors?.noCategoryDetailsSelected && (
                        <AssistiveText
                            text={formErrors?.noCategoryDetailsSelected}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                    {formErrors?.noComment && (
                        <AssistiveText
                            text={formErrors?.noComment}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                </div>
            </div>
        </WorkflowCard>
    );
};
