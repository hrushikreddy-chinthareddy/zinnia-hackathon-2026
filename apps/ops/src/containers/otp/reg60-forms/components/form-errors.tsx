import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import { Reg60FormContext } from '@deps/contexts/Reg60FormContext';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { allValuesEmptyObjects } from './form-controls';
import { TranslationFiles } from '@deps/config/translations';

export type FormErrorsProps = {
    taskApiError: string;
};

export const FormErrors = ({ taskApiError }: FormErrorsProps) => {
    const { t } = useTranslation(TranslationFiles.REG60DEFS, { keyPrefix: 'caseReg60.request' });
    const { formErrors } = useContext(Reg60FormContext);

    const validateForm = (errors: FormValidationErrors) => {
        if (Object.keys(errors).length > 0) {
            return allValuesEmptyObjects(errors);
        }
        return Object.keys(errors).length === 0;
    };

    return (
        <>
            {taskApiError && <AssistiveText variant={AssistiveTextVariant.Error} text={taskApiError} className="mt-2" />}
            {!validateForm(formErrors) ? (
                <div className="flex flex-col">
                    <AssistiveText
                        text={t('formErrors.formValidation.formValidationError')}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                </div>
            ) : null}
        </>
    );
};
