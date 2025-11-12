import { WidgetProps } from '@rjsf/utils';
import { FieldSize } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';
import xss from 'xss';

import Field, { FieldType, FieldVariant } from '@deps/components/fields/field';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

export const EmailWidget = function (props: WidgetProps) {
    const { value, disabled, onChange, readonly, label } = props;
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'general',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitizedEmail = xss(e.target.value.trim());
        onChange(sanitizedEmail === '' ? undefined : sanitizedEmail);
    };

    if (readonly) {
        return (
            <>
                <Typography
                    variant={TypographyVariant.BodySmBold}
                    className="mb-2"
                >
                    {label as string}
                </Typography>
                {value}
            </>
        );
    }

    return (
        <div className="max-w-sm flex w-full flex-col pl-1">
            <Field
                disabled={disabled}
                label={label}
                labelClassNames={'h-6 mb-2'}
                onChange={handleChange}
                value={value}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={
                    disabled ? FieldVariant.Inactive : FieldVariant.Default
                }
                labelTooltip={t('email') as string}
                labelTooltipBody={t('emailTooltip') as string}
            />
        </div>
    );
};

export default EmailWidget;
