import { useTranslation } from 'next-i18next';
import React from 'react';

import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelectRange from '@deps/components/fields/field-date-select-range/field-date-select-range';
import { TranslationFiles } from '@deps/config/translations';
import { CaseSearchAdditionalFilters } from '@deps/contexts/CaseManagementFilters';

interface DateRangeFieldsProps {
    additionalFilters: CaseSearchAdditionalFilters;
    errors: {
        createdDateStart?: string;
        createdDateEnd?: string;
        updatedDateStart?: string;
        updatedDateEnd?: string;
    };
    createdStartOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    createdEndOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    updatedStartOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    updatedEndOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export default function DateRangeFields({
    additionalFilters,
    errors,
    createdStartOnChange,
    createdEndOnChange,
    updatedStartOnChange,
    updatedEndOnChange,
}: DateRangeFieldsProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'caseManagementDashboard.refineResultsOptions' });
    return (
        <div className="flex flex-col gap-8 border-b-2 border-b-gray-100 py-8">
            <FieldDateSelectRange
                startValue={additionalFilters.createdDateStart || ''}
                endValue={additionalFilters.createdDateEnd || ''}
                startLabel={t(`createdStart`) as string}
                endLabel={t(`createdEnd`) as string}
                startOnChange={createdStartOnChange}
                endOnChange={createdEndOnChange}
                startVariant={errors?.createdDateStart ? FieldVariant.Error : FieldVariant.Default}
                endVariant={errors?.createdDateEnd ? FieldVariant.Error : FieldVariant.Default}
                startMessage={errors?.createdDateStart ? errors.createdDateStart : ''}
                endMessage={errors?.createdDateEnd ? errors.createdDateEnd : ''}
                placeholder={t(`selectDate`) as string}
                closeOnDateSelect={true}
                size={FieldSize.Small}
            />
            <FieldDateSelectRange
                startValue={additionalFilters.updatedDateStart || ''}
                endValue={additionalFilters.updatedDateEnd || ''}
                startLabel={t(`updatedStart`) as string}
                endLabel={t(`updatedEnd`) as string}
                startOnChange={updatedStartOnChange}
                endOnChange={updatedEndOnChange}
                startVariant={errors?.updatedDateStart ? FieldVariant.Error : FieldVariant.Default}
                endVariant={errors?.updatedDateEnd ? FieldVariant.Error : FieldVariant.Default}
                startMessage={errors?.updatedDateStart ? errors.updatedDateStart : ''}
                endMessage={errors?.updatedDateEnd ? errors.updatedDateEnd : ''}
                placeholder={t(`selectDate`) as string}
                closeOnDateSelect={true}
                size={FieldSize.Small}
            />
        </div>
    );
}
