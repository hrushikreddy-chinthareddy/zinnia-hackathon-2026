import { useTranslation } from 'next-i18next';
import { ChangeEvent } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import {
    FieldFormatOptions,
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import { TranslationFiles } from '@deps/config/translations';

export const CustomYesDatePicker = ({
    option,
    onChange,
    value,
    error,
    formatOptions = { format: '##/##/####' },
    isFutureDateDisabled = false,
    placeholder,
    id,
    label,
}: {
    option: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    error: boolean;
    formatOptions: FieldFormatOptions;
    isFutureDateDisabled?: boolean;
    placeholder: string;
    id: string;
    label: string;
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.name',
    });
    return (
        <div className={`-mt-4 items-center`}>
            <Content
                contentClassName="h-14 flex items-center"
                variant={ContentVariant.BodySm}
                details={'Yes' as string}
            />
            {option === 'Yes' && (
                <FieldDateSelect
                    variant={error ? FieldVariant.Error : FieldVariant.Default}
                    label={label}
                    id={id}
                    isFutureDateDisabled={isFutureDateDisabled}
                    onChange={onChange}
                    formatOptions={formatOptions}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={value}
                    labelTooltip={label}
                    labelTooltipBody={label}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
};
