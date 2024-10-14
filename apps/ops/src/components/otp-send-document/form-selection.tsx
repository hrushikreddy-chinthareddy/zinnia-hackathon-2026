import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';
import TransactionDocumentSelection from '@deps/containers/nigo-entry-container/components/steps/form-selection.tsx/transaction-document-selection';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { SendDocumentFormParts } from '@deps/models/case/send-document';
import { Policy } from '@deps/models/policy/sor-policy';

import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import AssistiveText, { AssistiveTextVariant } from '../assistive-text/assistive-text';
import { SimpleOption } from '../autocomplete/autocomplete.types';
import WorkflowCard from '../workflows/workflow-card/workflow-card';

type FormSelectionProps = {
    policy: Policy;
    ctiCallNumber: string;
    transactionTypes: SimpleOption[];
    formDetails: SendDocumentFormParts;
    setFormDetails: React.Dispatch<React.SetStateAction<SendDocumentFormParts>>;
};

function FormSelection({ policy, ctiCallNumber, transactionTypes, formDetails, setFormDetails }: FormSelectionProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });
    const { goToNext } = useWorkflow();
    const [error, setError] = useState<string>('');
    const handleContinue = async () => {
        if (!formDetails.document?.selected?.formId) {
            return setError(t('errors.formId') as string);
        }
        goToNext();
    };

    useEffect(() => {
        if (formDetails.document?.selected?.formId) {
            setError('');
        }
    }, [formDetails]);

    const handleCancel = () => {
        setFormDetails({} as SendDocumentFormParts);
    };

    return (
        <WorkflowCard
            title={t(`tabs.formSelection`)}
            footerContent={<SendDocumentNavigationButtons handleContinue={handleContinue} handleCancel={handleCancel} />}
        >
            <TransactionDocumentSelection
                formDetails={formDetails}
                setFormDetails={setFormDetails}
                policy={policy}
                ctiCallNumber={ctiCallNumber}
                transactionTypes={transactionTypes}
            />
            {error && <AssistiveText text={error} variant={AssistiveTextVariant.Error} className="mt-2" />}
        </WorkflowCard>
    );
}

export default FormSelection;
