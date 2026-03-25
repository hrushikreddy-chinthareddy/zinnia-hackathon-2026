import { TFunction } from 'next-i18next';

type TransformErrorsProps = {
    errors: any;
    t: TFunction;
};

const REQUIRED_STYLE_FIELDS = new Set(['trustType', 'trustDate', 'entityType']);

const getErrorFieldName = (error: any) => {
    if (error.name === 'required') {
        return error.params?.missingProperty;
    }

    return error.property?.split('.')?.filter(Boolean)?.pop();
};

export enum ValidationMessage {
    OnlyDigits = '^[0-9]+$',
    CheckNumberStartWith82000 = '^82000[0-9]*$',
    EmptyOrOnlyDigitsStartWith82000 = '^(|82000[0-9]*)$',
    OnlyLettersAndNumbers = '^[a-zA-Z0-9]*$',
    LettersNumbersDashUnderscore = '^[a-zA-Z0-9-_]+$',
    InvalidSSN = '^(|[0-9]{9})$',
    InvalidEmail = '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
}

function transformErrors({ errors, t }: TransformErrorsProps) {
    const fieldErrorNames = new Map<string, Set<string>>();

    errors.forEach((error: any) => {
        const fieldName = getErrorFieldName(error);

        if (!fieldName) return;

        if (!fieldErrorNames.has(fieldName)) {
            fieldErrorNames.set(fieldName, new Set());
        }

        fieldErrorNames.get(fieldName)?.add(error.name);
    });

    return errors.map((error: any) => {
        const fieldName = getErrorFieldName(error);
        const isRequiredStyleField =
            fieldName && REQUIRED_STYLE_FIELDS.has(fieldName);

        if (
            isRequiredStyleField &&
            error.name === 'enum' &&
            fieldErrorNames.get(fieldName)?.has('type')
        ) {
            error.message = '';
        } else if (
            isRequiredStyleField &&
            ['type', 'enum', 'minLength'].includes(error.name)
        ) {
            error.message = t('formValidations.required');
        } else if (error.name === 'required') {
            error.message = t('formValidations.required');
        } else if (error.name === 'pattern') {
            const pattern = error.params.pattern;
            if (pattern === ValidationMessage.OnlyDigits) {
                error.message = t('formValidations.patternDigit');
            }
            if (
                pattern === ValidationMessage.CheckNumberStartWith82000 ||
                pattern === ValidationMessage.EmptyOrOnlyDigitsStartWith82000
            ) {
                error.message = t('formValidations.patternNumber');
            }
            if (pattern === ValidationMessage.OnlyLettersAndNumbers) {
                error.message = t('formValidations.patternNoSpecial');
            }
            if (pattern === ValidationMessage.LettersNumbersDashUnderscore) {
                error.message = t('formValidations.patternWithSpecial');
            }
            if (pattern === ValidationMessage.InvalidSSN) {
                error.message = t('formValidations.patternSsn');
            }
            if (pattern === ValidationMessage.InvalidEmail) {
                error.message = t('formValidations.patternEmail');
            }
        } else if (error.name === 'minLength') {
            error.message = t('formValidations.minLength', {
                limit: error.params.limit,
            });
        } else if (error.name === 'maximum') {
            error.message = t('formValidations.maximum', {
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
        } else if (error.name === 'contains') {
            if (error.params.minContains) {
                error.message = t('formValidations.minContains', {
                    limit: error.params.minContains,
                    item: error.property?.split('.')?.filter(Boolean)?.pop(),
                });
            }
        }
        return error;
    });
}

export default transformErrors;
