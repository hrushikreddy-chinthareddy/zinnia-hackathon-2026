import { TFunction } from 'next-i18next';

type TransformErrorsProps = {
    errors: any;
    t: TFunction;
};

function transformErrors({ errors, t }: TransformErrorsProps) {
    return errors.map((error: any) => {
        if (error.name === 'required') {
            error.message = t('formValidations.required');
        } else if (error.name === 'pattern') {
            if (error.params.pattern === '^[0-9]+$') {
                error.message = t('formValidations.patternDigit');
            }
            if (error.params.pattern === '^82000[0-9]*$') {
                error.message = t('formValidations.patternNumber');
            }
            if (error.params.pattern === '^[a-zA-Z0-9]*$') {
                error.message = t('formValidations.patternNoSpecial');
            }
            if (error.params.pattern === '^[a-zA-Z0-9-_]+$') {
                error.message = t('formValidations.patternWithSpecial');
            }
        } else if (error.name === 'minLength') {
            error.message = t('formValidations.minLength', {
                limit: error.params.limit,
            });
        } else if (error.name === 'minItems') {
            error.message = t('formValidations.minItems', {
                limit: error.params.limit,
            }); // Corrected key
        } else if (error.name === 'maxLength') {
            error.message = t('formValidations.maxLength', {
                limit: error.params.limit,
            }); // Corrected key
        } else if (error.name === 'if') {
            error.message = '';
        }
        return error;
    });
}

export default transformErrors;
