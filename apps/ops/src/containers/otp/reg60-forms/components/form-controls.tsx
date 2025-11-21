import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FormEvent, useContext } from 'react';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { Reg60FormContext } from '@deps/contexts/Reg60FormContext';
import { isLocalStorageEnabled } from '@deps/helpers/local-storage.hepler';
import { getSlug } from '@deps/helpers/string.helpers';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { caseTypes } from '@deps/models/case/helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
import { createTask, updateTask } from '@deps/queries/api/v2/task';
import { FormSuccessMessageKey } from '@deps/types/localStorage';

import getMassMutualReg60Config from '../mass-mutual/mass-mutual-reg60-form-helpers';
import { CurrentPage } from '../reg60.types';
import { buildForm } from '../utils/reg60-form-helpers';

export type FormControlsProps = {
    document: DocumentData;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    setTaskApiError: (error: string) => void;
};

export function allValuesEmptyObjects(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
        return false; // Not an object
    }

    for (const key in obj) {
        if (typeof obj[key] !== 'object' || Object.keys(obj[key]).length > 0) {
            return false; // Key doesn't have an empty object value
        }
    }

    return true; // All values are empty objects
}

export function FormControls({
    isLoading,
    setIsLoading,
    setTaskApiError,
    document,
}: FormControlsProps) {
    const router = useRouter();
    const { t } = useTranslation(TranslationFiles.REG60DEFS, {
        keyPrefix: 'caseReg60.request',
    });
    const formState = useContext(Reg60FormContext);
    const formStatusCompleted =
        formState?.initialForm?.status === TaskStatus.Completed;
    const caseId = router?.query?.id || '';

    const {
        currentPage,
        setFormErrors,
        setCurrentPage,
        ownerInformation,
        agentInformation,
        disclosureAuthorization,
        disclosure,
        isFormStateReadOnly,
    } = formState;
    const userOnInfoPage = currentPage === CurrentPage.INFO;

    const { formValidation } = getMassMutualReg60Config(t);

    const validateForm = () => {
        const errors = formValidation({
            ownerInformation,
            agentInformation,
            disclosureAuthorization,
            disclosure,
            currentPage,
            document,
        });

        setFormErrors({ ...errors });
        if (Object.keys(errors).length > 0) {
            return allValuesEmptyObjects(errors);
        }
        return Object.keys(errors).length === 0; // Returns true if no error
    };

    const handleSaveAsDraft = async (event: FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setTaskApiError('');
        const { initialForm } = formState;

        let successfulTaskUpdate;
        if (initialForm?.id) {
            successfulTaskUpdate = await updateTask(
                initialForm?.caseId as string,
                initialForm?.id,
                buildForm(TaskStatus.New, document, formState)
            );
        } else {
            successfulTaskUpdate = await createTask(
                caseId as string,
                buildForm(TaskStatus.New, document, formState)
            );
        }

        if (successfulTaskUpdate) {
            const caseSlug = getSlug(caseTypes[DocumentType.Reg60]);
            const link = `/create-case/${caseSlug}/${caseId}?taskId=${successfulTaskUpdate.id}&doc=${document?.documentNumber}&clientId=${successfulTaskUpdate?.carrier}`;

            router.push(link);
        } else {
            setTaskApiError(t('formControls.cancelError'));
        }
        if (!successfulTaskUpdate) {
            setTaskApiError(t('formControls.saveAsDraftError'));
        }

        setIsLoading(false);
    };

    const handleContinue = (event: FormEvent) => {
        event.preventDefault();
        if (isFormStateReadOnly && userOnInfoPage) {
            setCurrentPage(CurrentPage.COMPARISON);
            return;
        }
        if (!isFormStateReadOnly && validateForm() && userOnInfoPage) {
            setCurrentPage(CurrentPage.COMPARISON);
        }
    };

    const handleFormSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setTaskApiError('');

        if (validateForm()) {
            let successfulTaskUpsert;
            if (formState.initialForm?.id) {
                successfulTaskUpsert = await updateTask(
                    formState.initialForm.caseId,
                    formState.initialForm?.id,
                    buildForm(TaskStatus.Completed, document, formState)
                );
            } else {
                successfulTaskUpsert = await createTask(
                    caseId as string,
                    buildForm(TaskStatus.Completed, document, formState)
                );
            }

            if (successfulTaskUpsert) {
                if (isLocalStorageEnabled()) {
                    const successMessageStart = t(
                        'formControls.createTaskSuccessStart',
                        {
                            documentNumber: document?.documentNumber,
                        }
                    );
                    const successMessageEnd = t(
                        'formControls.createTaskSuccessEnd',
                        {
                            contractNumber: document?.contract,
                        }
                    );
                    const finalCreateSuccessMessage = `${successMessageStart} ${
                        document.contract ? successMessageEnd : ''
                    }`;
                    localStorage.setItem(
                        FormSuccessMessageKey.Reg60MassMutualSuccess,
                        finalCreateSuccessMessage
                    );
                }

                router.push(`/create-case`);
            } else {
                setTaskApiError(t('formControls.submitError') as string);
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    const handleCancelAction = async (event: FormEvent) => {
        event.preventDefault();
        const confirmCancel = window.confirm(
            t('formControls.cancelConfirm') as string
        );
        if (confirmCancel) {
            setIsLoading(false);
            setTaskApiError('');
            router.push('/create-case/');
        }
    };

    return (
        <div className="flex flex-row self-center p-4">
            {userOnInfoPage ? (
                <Button
                    className="mr-4"
                    onClick={handleContinue}
                    disabled={isLoading}
                    size={ButtonSize.Small}
                    type={ButtonType.Primary}
                >
                    {t('formControls.continue')}
                </Button>
            ) : (
                <Button
                    className="mr-4"
                    onClick={handleFormSubmit}
                    disabled={isFormStateReadOnly || isLoading}
                    size={ButtonSize.Small}
                    type={ButtonType.Primary}
                    variant={
                        isFormStateReadOnly
                            ? ButtonVariant.Inactive
                            : ButtonVariant.Default
                    }
                >
                    {t('formControls.calculateComparison')}
                </Button>
            )}
            <Button
                className="mr-4"
                onClick={handleSaveAsDraft}
                size={ButtonSize.Small}
                type={ButtonType.Primary}
                variant={
                    formStatusCompleted
                        ? ButtonVariant.Inactive
                        : ButtonVariant.Default
                }
                disabled={formStatusCompleted}
            >
                {t('formControls.saveAsDraft')}
            </Button>
            <NavElement
                aria-label={t('formControls.cancel') as string}
                onClick={handleCancelAction}
                size={NavElementSize.Small}
                type={NavElementType.Button}
                variant={NavElementVariant.Default}
                disabled={isFormStateReadOnly}
            >
                {t('formControls.cancel')}
            </NavElement>
        </div>
    );
}
