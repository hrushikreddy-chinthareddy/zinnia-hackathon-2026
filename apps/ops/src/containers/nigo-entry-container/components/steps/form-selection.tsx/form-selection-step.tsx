import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';

import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { SendDocumentFormParts } from '@deps/models/case/send-document';
import { Policy } from '@deps/models/policy/sor-policy';

import TransactionDocumentSelection from './transaction-document-selection';
import { useNigoEntry } from '../../nigo-entry-provider';

type FormSelectionProps = {
    policy: Policy;
    transactionTypes: SimpleOption[];
    ctiCallNumber?: string;
};

function FormSelectionStep({ transactionTypes, policy, ctiCallNumber = '' }: FormSelectionProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.formSelection' });
    const { goToNext } = useWorkflow();
    const [error, setError] = useState<string>('');
    const { transactionType, transactionSubType, document, setTransactionType, setTransactionSubType, setDocument } = useNigoEntry();

    const [formDetails, setFormDetails] = useState<SendDocumentFormParts>({
        transactionType,
        transactionSubType,
        document,
    } as SendDocumentFormParts);

    const formState = useContext(FormDataContext);
    const { setFormProgram } = formState;

    useEffect(() => {
        setTransactionType(ogData => ({
            ...ogData,
            selected: formDetails?.transactionType?.selected,
            list: transactionTypes,
        }));

        setTransactionSubType(ogData => ({
            ...ogData,
            selected: formDetails?.transactionSubType?.selected,
            list: formDetails?.transactionSubType?.list,
        }));

        setDocument(ogData => ({ ...ogData, selected: formDetails?.document?.selected, list: formDetails?.document?.list }));
    }, [formDetails]);

    const handleStepContinue = useCallback(() => {
        if (!document?.selected?.formId) {
            return setError(t('errors.selectForm') as string);
        } else {
            setFormProgram(prevFormProgram => {
                return {
                    ...prevFormProgram,
                    transactionType: {
                        text: transactionType?.selected || null,
                    },
                    transactionSubType: {
                        text: transactionSubType?.selected || null,
                    },
                    transactionFormId: {
                        text: document?.selected?.formId || null,
                    },
                    transactionFormNumber: {
                        text: document?.selected?.formNumber || null,
                    },
                    transactionFormName: {
                        text: document?.selected?.formShortName || null,
                    },
                    transactionDisplayName: {
                        text: document?.selected?.formDisplayName || null,
                    },
                };
            });
            goToNext();
        }
    }, [
        document?.selected?.formDisplayName,
        document?.selected?.formId,
        document?.selected?.formNumber,
        document?.selected?.formShortName,
        goToNext,
        setFormProgram,
        t,
        transactionSubType?.selected,
        transactionType?.selected,
    ]);

    return (
        <WorkflowCard
            title={t(`title`)}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            <div className="mb-5 grid auto-rows-fr grid-cols-1 gap-2">
                <Typography variant={TypographyVariant.LabelMd}>{t('label')}</Typography>
            </div>
            <TransactionDocumentSelection
                policy={policy}
                ctiCallNumber={ctiCallNumber}
                formDetails={formDetails}
                setFormDetails={setFormDetails}
                transactionTypes={transactionTypes}
            />
            {error && <AssistiveText text={error} variant={AssistiveTextVariant.Error} className="mt-2" />}
        </WorkflowCard>
    );
}

export default FormSelectionStep;
