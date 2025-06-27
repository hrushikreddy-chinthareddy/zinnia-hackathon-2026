import { TFunction } from 'next-i18next';
import { useContext } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

export type FormErrorsProps = {
    t: TFunction;
    taskApiError: string;
};

export const FormErrors = ({ t, taskApiError }: FormErrorsProps) => {
    const { formErrors } = useContext(FormDataContext);

    return (
        <>
            {taskApiError && (
                <AssistiveText
                    variant={AssistiveTextVariant.Error}
                    text={taskApiError}
                    className="mt-2"
                />
            )}
            {Object.keys(formErrors)?.length > 0 ? (
                <div className="flex flex-col">
                    <AssistiveText
                        text={t('formValidation.formValidationError')}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                </div>
            ) : null}
        </>
    );
};
