import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';
import TransactionDocumentSelection from '@deps/containers/nigo-entry-container/components/steps/form-selection.tsx/transaction-document-selection';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { SendDocumentFormParts, SendDocumentFormPartsAdditionData } from '@deps/models/case/send-document';
import { Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as AddDocumentIcon } from '@deps/styles/elements/icons/icons_outlined/add.svg';
import { ReactComponent as TrashDocumentIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';

import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import AssistiveText, { AssistiveTextVariant } from '../assistive-text/assistive-text';
import { SimpleOption } from '../autocomplete/autocomplete.types';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '../nav-element/nav-element';
import WorkflowCard from '../workflows/workflow-card/workflow-card';

const mapIdToFormDetails = (value: SendDocumentFormParts[]): SendDocumentFormPartsAdditionData[] => {
    return value.map(formDetail => {
        return {
            ...formDetail,
            id: Date.now().toString(),
        };
    });
};

export const DefaultFormDetail = {
    document: { list: [], selected: null },
    transactionSubType: { list: [], selected: null },
    transactionType: { list: [], selected: null },
    id: Date.now().toString(),
};
type FormSelectionProps = {
    policy: Policy;
    ctiCallNumber: string;
    transactionTypes: SimpleOption[];
    formDetails: SendDocumentFormParts[];
    setFormDetails: React.Dispatch<React.SetStateAction<SendDocumentFormParts[]>>;
};

function FormSelection({ policy, ctiCallNumber, transactionTypes, formDetails, setFormDetails }: FormSelectionProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });
    const [forms, setForms] = useState(mapIdToFormDetails(formDetails));
    const { goToNext } = useWorkflow();
    const [error, setError] = useState<string>('');

    const handleContinue = async () => {
        // todo:vijaya: add validation for multiple selected forms
        // if (!formDetails.document?.selected?.formId) {
        //     return setError(t('errors.formId') as string);
        // }
        setFormDetails(forms.map(({ id, ...rest }) => rest));
        goToNext();
    };

    useEffect(() => {
        // if (formDetails.document?.selected?.formId) {
        //     setError('');
        // }
    }, [formDetails]);

    const handleCancel = () => {
        setFormDetails([] as SendDocumentFormParts[]);
    };

    const addNewFilter = () => {
        setForms(prevForms => [...prevForms, { ...DefaultFormDetail, id: Date.now().toString() }]);
    };

    const removeFilter = (id: string) => {
        setForms(fs => {
            return [...fs.filter(sig => sig.id !== id)];
        });
    };

    const updateFormDetails = (value: SendDocumentFormPartsAdditionData, id: string) => {
        setForms(fs => {
            return [...fs.filter(sig => sig.id !== id), value];
        });
    };
    return (
        <WorkflowCard
            title={t(`tabs.formSelection`)}
            footerContent={<SendDocumentNavigationButtons handleContinue={handleContinue} handleCancel={handleCancel} />}
        >
            {forms?.map(form => (
                <div className=" bg-gray-50 p-5 flex" key={form.id}>
                    <div className="my-4 grow">
                        <TransactionDocumentSelection
                            formDetails={form}
                            setFormDetails={val => updateFormDetails({ ...val, id: form.id }, form.id)}
                            policy={policy}
                            ctiCallNumber={ctiCallNumber}
                            transactionTypes={transactionTypes}
                            key={form.id}
                        />
                    </div>
                    <NavElement
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        startIcon={<TrashDocumentIcon width={20} height={20} />}
                        onClick={() => removeFilter(form.id)}
                        variant={NavElementVariant.Secondary}
                    ></NavElement>
                </div>
            ))}
            <div>
                <NavElement
                    className={'my-4'}
                    size={NavElementSize.Small}
                    title={t(`formSelection.addNewDocument`) as string}
                    type={NavElementType.Button}
                    startIcon={<AddDocumentIcon width={20} height={20} />}
                    onClick={addNewFilter}
                    variant={NavElementVariant.Secondary}
                >
                    {t(`formSelection.addNewDocument`) as string}
                </NavElement>
            </div>
            {error && <AssistiveText text={error} variant={AssistiveTextVariant.Error} className="mt-2" />}
        </WorkflowCard>
    );
}

export default FormSelection;
