import { useTranslation } from 'next-i18next';
import React from 'react';

import { FieldSize } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

interface PageSizeProps {
    handleChange: (value: string) => void;
    options: { value: string; label: string }[];
    value: string;
}

export default function PageSize({
    value,
    options,
    handleChange,
}: PageSizeProps) {
    const { t } = useTranslation();

    return (
        <>
            <Typography variant={TypographyVariant.BodySm} className="pb-1">
                {t('caseManagementDashboard.pageSize')}:
            </Typography>
            <SelectSimple
                options={options}
                onChange={handleChange}
                value={value}
                size={FieldSize.Small}
                className="w-max"
            />
        </>
    );
}
