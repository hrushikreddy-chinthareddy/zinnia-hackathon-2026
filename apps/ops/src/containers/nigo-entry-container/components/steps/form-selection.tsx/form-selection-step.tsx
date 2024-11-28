import { AssistiveText, AssistiveTextVariant, Loader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useEffect, useState } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';

import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { buildFormV2 } from '@deps/containers/otp/withdrawal-forms/utils/withdrawal-form-helper';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { DocumentData } from '@deps/models/case/document';
import { ApiVersion } from '@deps/models/case/enums';
import { TaskApiVersionMapper } from '@deps/models/case/helpers';
import { AvailableFormsTransaction, SendDocumentFormParts } from '@deps/models/case/send-document';
import { TaskStatus } from '@deps/models/case/task-instance';
import { Policy } from '@deps/models/policy/sor-policy';
import { updateTask } from '@deps/queries/api/v2/task';

import { getFormSelectionConfig } from './form-selection.helper';
import TransactionDocumentSelection from './transaction-document-selection';
import { useNigoEntry } from '../../nigo-entry-provider';

type FormSelectionProps = {
    policy: Policy;
    availableFormsTransactions: AvailableFormsTransaction[];
    ctiCallNumber?: string;
    documentData: DocumentData;
    clientCode: string;
};

function FormSelectionStep({ availableFormsTransactions, policy, documentData, clientCode, ctiCallNumber = '' }: FormSelectionProps) {
    const { isFormIdRequired } = getFormSelectionConfig(clientCode);
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.formSelection' });
    const { goToNext } = useWorkflow();
    const [error, setError] = useState<string>('');
    const { transactionType, transactionSubType, document, setTransactionType, setTransactionSubType, setDocument } = useNigoEntry();
    const transactionTypes = availableFormsTransactions?.map(transaction => {
        return { label: transaction.name, value: transaction.id };
    });
    const [formDetails, setFormDetails] = useState<SendDocumentFormParts>({
        transactionType,
        transactionSubType,
        document,
    } as SendDocumentFormParts);

    const formState = useContext(FormDataContext);
    const { setFormProgram } = formState;
    const [isLoading, setIsLoading] = useState(false);
    const { setSubmitFailed } = useNigoEntry();
    const [timer] = useState(performance.now());

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

    const submit = useCallback(async () => {
        setIsLoading(true);

        if (
            TaskApiVersionMapper[formState.initialForm.taskType] === ApiVersion.v2 &&
            formState.initialForm.status !== TaskStatus.Completed
        ) {
            const successfulCaseUpdate = await updateTask(
                formState.initialForm.caseId,
                formState.initialForm.taskId,
                buildFormV2(TaskStatus.Completed, documentData, formState),
                timer
            );

            if (successfulCaseUpdate && successfulCaseUpdate.id) {
                setSubmitFailed(false);
            } else {
                setSubmitFailed(true);
            }
        } else {
            setSubmitFailed(false);
        }

        setIsLoading(false);
    }, [documentData, formState, setSubmitFailed, timer]);

    useEffect(() => {
        if (
            (isFormIdRequired && !isNullEmptyOrUndefined(document?.selected?.formId)) ||
            (!isFormIdRequired && !isNullEmptyOrUndefined(transactionType.selected) && !isNullEmptyOrUndefined(transactionSubType.selected))
        ) {
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
        }
    }, [clientCode, document?.selected, isFormIdRequired, setFormProgram, transactionSubType.selected, transactionType.selected]);

    const handleStepContinue = useCallback(async () => {
        if (isFormIdRequired == true && isNullEmptyOrUndefined(document?.selected?.formId)) {
            return setError(t('errors.selectForm') as string);
        } else if (
            isFormIdRequired === false &&
            (isNullEmptyOrUndefined(transactionType.selected) || isNullEmptyOrUndefined(transactionSubType.selected))
        ) {
            return setError(t('errors.selectOptions') as string);
        } else {
            await submit();
            goToNext();
        }
    }, [document?.selected?.formId, goToNext, isFormIdRequired, submit, t, transactionSubType.selected, transactionType.selected]);

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
            {isLoading && (
                <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                    <Loader />
                </div>
            )}
            <TransactionDocumentSelection
                policy={policy}
                ctiCallNumber={ctiCallNumber}
                formDetails={formDetails}
                setFormDetails={setFormDetails}
                availableFormsTransactions={availableFormsTransactions}
            />
            {error && <AssistiveText text={error} variant={AssistiveTextVariant.Error} className="mt-4" />}
        </WorkflowCard>
    );
}

export default FormSelectionStep;
