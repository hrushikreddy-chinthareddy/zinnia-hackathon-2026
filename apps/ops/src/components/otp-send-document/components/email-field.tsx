import { useTranslation } from 'next-i18next';
import xss from 'xss';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

type EmailAddressProps = {
    email: string;
    error?: FormValidationErrors;
    setEmail: (val: string) => void;
    name?: string;
    isDisabled?: boolean;
};
const EmailAddress = ({
    email,
    setEmail,
    error,
    name,
    isDisabled,
}: EmailAddressProps) => {
    const { t } = useTranslation();

    return (
        <div>
            <Field
                disabled={isDisabled}
                label={t('allFields.email') ?? ''}
                onChange={(e) => {
                    setEmail(xss(e?.target?.value?.trim() ?? ''));
                }}
                value={email as string}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                className="max-w-xs"
                message={error?.email}
                variant={
                    error?.email
                        ? FieldVariant.Error
                        : isDisabled
                        ? FieldVariant.Inactive
                        : FieldVariant.Default
                }
                labelTooltip={t('allFields.email') ?? ''}
                labelTooltipBody={t('allFields.emailTooltip') ?? ''}
                name={name ?? 'emailField'}
            />
        </div>
    );
};

export default EmailAddress;
