
import dayjs from 'dayjs';
import {  useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useEffect } from 'react';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import TransactionNavigationButtons, { ParentPage } from "@deps/components/transaction-navigation-buttons/transaction-navigation-buttons";
import WorkflowCard from "@deps/components/workflows/workflow-card/workflow-card";
import { TranslationFiles } from '@deps/config/translations';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { DocumentData } from '@deps/models/case/document';
import { Policy } from '@deps/models/policy/sor-policy';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { ServiceFormReview } from './service-form-review';
import { useNigoEntry } from '../../nigo-entry-provider';

interface ServiceFormReviewStepProps {
    documentNumber: string;
    policy: Policy;
    docType: string;
    clientCode: string;
    taskInfoLink: string;
    document: DocumentData;
};

export const ServiceFormReviewStep = ({documentNumber, policy, docType, clientCode, taskInfoLink, document} : ServiceFormReviewStepProps ) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.serviceFormReview' });
    const { goToNext } = useWorkflow();
    const { policyNumber } = policy || {};
    const { isReadyForDataEntry } = useNigoEntry();    
    const router = useRouter();
    const formState = useContext(FormDataContext);
    const { formSource, setFormSource, formData, setFormData } = formState;

    const handleStepContinue = useCallback(() => {
        if (!isReadyForDataEntry) {
            goToNext();
        } else {
            router.push(taskInfoLink);
        }
    }, [goToNext, isReadyForDataEntry, router, taskInfoLink]);

    useEffect(() => {
        setFormSource({
            ...formSource,
            channel: {
                text: document.source,
            },
            businessKey: document.documentNumber,
            receivedDate: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format(ZAHARA_API_DATE_FORMAT),
            receivedDateTime: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format('YYYY-MM-DDTHH:mm:ss:Z'),
            sourceSysId: 'ONBASE',
        });
    }, [document]);

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
    }, [clientCode])

    return (
        <WorkflowCard
            title={t('title')}
            subtitle={t('subTitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink='/create-case'
                />
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <ServiceFormReview 
                        activeDocType={DocumentTypeView.Policy}
                        documentNumber={documentNumber}
                        clientCode={clientCode}
                        policyNumber={policyNumber as string}
                        docType={docType}
                    />
                </div>
            </div>
        </WorkflowCard>
    );
};
