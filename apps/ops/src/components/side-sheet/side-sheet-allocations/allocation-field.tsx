import { useTranslation } from 'next-i18next';
import { ChangeEvent } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

export interface AllocationFieldProps {
    beneficiaryPercentage?: number;
    className?: string;
    firstLastName?: string;
    isFirst?: boolean; // Used solely to add the 'Allocation' field and adjust styles accordingly
    onBlur: (e: ChangeEvent) => void;
    onChange: (e: ChangeEvent) => void;
    partyId?: string;
    partyLabelVariant: TypographyVariant;
}

const AllocationField: React.FC<AllocationFieldProps> = ({
    beneficiaryPercentage,
    className = '',
    firstLastName,
    isFirst = false,
    onBlur,
    onChange,
    partyId,
    partyLabelVariant,
}: AllocationFieldProps) => {
    const { t } = useTranslation();
    const pt = isFirst ? 'pt-[26px]' : '';
    return (
        <div className={`flex w-full justify-between ${className}`}>
            <div
                className={`min-w-max self-center ${pt}`}
                id={`allocationField-${partyId}`}
            >
                <span className="sr-only">
                    {t('sideSheet.allocation.allocationPercentageFor')}
                </span>
                <Typography variant={partyLabelVariant}>
                    {firstLastName}
                </Typography>
            </div>
            <div className="w-[94px]">
                <Field
                    aria-labelledby={`allocationField-${partyId}`}
                    formatOptions={{
                        format: '',
                        type: 'number',
                    }}
                    label={
                        isFirst
                            ? (t('sideSheet.allocation.allocation') as string)
                            : undefined
                    }
                    min={0}
                    max={100}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={`${beneficiaryPercentage}`}
                    size={FieldSize.Small}
                    trailing={<div className="">%</div>}
                    type={FieldType.BaseActive}
                    variant={FieldVariant.Default}
                />
            </div>
        </div>
    );
};

export default AllocationField;
