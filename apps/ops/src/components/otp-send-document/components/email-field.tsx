import { useTranslation } from 'next-i18next';
import xss from 'xss';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

type EmailAddressProps = {
    email: string;
    error?: FormValidationErrors;
    setEmail: (val: string) => void;
};
const EmailAddress = ({ email, setEmail, error }: EmailAddressProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });

    return (
        <div>
            <Field
                label={t('correspondence.email') as string}
                onChange={e => {
                    setEmail(xss(e?.target?.value));
                }}
                value={email as string}
                size={FieldSize.Default}
                type={FieldType.BaseActive}
                className="max-w-xs "
                message={error?.email}
                variant={error?.email ? FieldVariant.Error : FieldVariant.Default}
            />
        </div>
    );
};

export default EmailAddress;
