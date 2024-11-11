
import dayjs from 'dayjs';
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
import { getFormData } from './service-form-review.helper';
import { useNigoEntry } from '../../nigo-entry-provider';
import { getCaseType } from '../form-entry/form-entry-step.helper';

interface ServiceFormReviewStepProps {
    documentNumber: string;
    policy: Policy;
    docType: string;
    clientCode: string;
    taskInfoLink: string;
    document: DocumentData;
};

export const ServiceFormReviewStep = ({documentNumber, policy, docType, clientCode, document} : ServiceFormReviewStepProps ) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.serviceFormReview' });
    const { goToNext } = useWorkflow();
    const { policyNumber } = policy || {};
    const { isReadyForDataEntry } = useNigoEntry();
    const formState = useContext(FormDataContext);

    const { formSource, setFormSource, setFormData, formSubtype } = formState;
    const caseType = getCaseType(docType as string);
    const carrier = clientCode.toUpperCase();

    const handleStepContinue = useCallback(() => {
        if (!isReadyForDataEntry) {
            goToNext();
        } else {
            goToNext();
        }
    }, [goToNext, isReadyForDataEntry]);

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
        if (carrier && caseType) {
            const data = getFormData(caseType, carrier, formSubtype);
            if (data) {
                setFormData(prevFormData => {
                    return{
                        ...prevFormData,
                        ...data
                    };
                });
            }
        }
    }, [carrier, caseType, formSubtype]);

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