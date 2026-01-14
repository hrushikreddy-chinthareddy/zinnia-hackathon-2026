import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import xss from 'xss';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import SelectSimple from '@deps/components/select/select';
import {
    getFormattedDate,
    getFormattedZaharaDate,
} from '@deps/helpers/date.helpers';
import {
    AmountType,
    Frequency,
    SSWType,
} from '@deps/models/case/withdrawal/case';

import { SSWProgramOptions } from './ssw-program';

export type SSWProgram = {
    startDate: { text: string };
    programSubType: { text: string | null };
    frequency: { text: Frequency };
    duration: { text: string | null };
    amount: { text: string | null; amountType: AmountType };
    percent: { text: string | null; amountType: AmountType };
    depleteFundYears: { text: string | null };
};

interface SystematicWithdrawalRowProps {
    sswTypeOptions: SSWProgramOptions[];
    sswData: SSWProgram;
    onDataChange: React.Dispatch<React.SetStateAction<SSWProgram>>;
    isReadOnly?: boolean;
}

export default function SystematicWithdrawalRow({
    isReadOnly,
    sswData,
    sswTypeOptions,
    onDataChange,
}: SystematicWithdrawalRowProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.sswProgram',
    });
    const formStartDate = getFormattedDate(
        sswData?.startDate?.text,
        'SSWRow::input startDate'
    );
    const [startDate, setStartDate] = useState(formStartDate);

    const setSSWData = <Type,>(val: Type, key: string) => {
        onDataChange((fs: SSWProgram) => ({
            ...fs,
            [key]: { text: val || '' },
        }));
    };

    useEffect(() => {
        onDataChange((fs: SSWProgram) => ({
            ...fs,
            startDate: {
                text:
                    getFormattedZaharaDate(
                        startDate,
                        'SSWRow::output startDate'
                    ) || '',
            },
        }));
    }, [startDate, onDataChange]);

    const frequencyOptions = [
        {
            label: t('frequencyOptions.none'),
            value: Frequency.None,
        },
        {
            label: t('frequencyOptions.monthly'),
            value: Frequency.Monthly,
        },
        {
            label: t('frequencyOptions.quarterly'),
            value: Frequency.Quarterly,
        },
        {
            label: t('frequencyOptions.semiAnnually'),
            value: Frequency.SemiAnnually,
        },
        {
            label: t('frequencyOptions.annually'),
            value: Frequency.Annually,
        },
    ];

    return (
        <>
            <div className="grid grid-cols-5 gap-4">
                <FieldDateSelect
                    variant={
                        isReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                    label={t('startDate') as string}
                    id="startDate"
                    isFutureDateDisabled={false}
                    onChange={(e) => {
                        setStartDate(e.target.value);
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={startDate}
                />

                <SelectSimple
                    disabled={isReadOnly}
                    className="max-w-lg"
                    label={t('sswTypes') as string}
                    options={sswTypeOptions}
                    onChange={(val: string) =>
                        setSSWData(val as SSWType, 'programSubType')
                    }
                    size={FieldSize.Small}
                    value={sswData.programSubType.text || ''}
                    name="sswType"
                />
                <SelectSimple
                    disabled={isReadOnly}
                    className="max-w-lg"
                    label={t('frequency') as string}
                    options={frequencyOptions}
                    onChange={(val: string) =>
                        setSSWData(val as Frequency, 'frequency')
                    }
                    size={FieldSize.Small}
                    value={sswData.frequency.text || ''}
                    name="frequency"
                    placeholder={t('selectOption') as string}
                />

                {sswData.programSubType.text !== SSWType.FixPeriod && (
                    <Field
                        variant={
                            isReadOnly
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                        label={t(`duration`) as string}
                        onChange={(e) => {
                            setSSWData(xss(e?.target?.value), 'duration');
                        }}
                        value={sswData.duration.text || ''}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        data-testid={`duration`}
                        formatOptions={{
                            format: '',
                            type: 'number',
                            decimalPlaces: 2,
                        }}
                    />
                )}

                {sswData.programSubType.text === SSWType.FixDollar && (
                    <Field
                        label={t(`amount`) as string}
                        onChange={(e) => {
                            setSSWData(xss(e?.target?.value), 'amount');
                        }}
                        value={sswData.amount.text || ''}
                        size={FieldSize.Small}
                        leading={<div>$</div>}
                        type={FieldType.BaseActive}
                        variant={
                            isReadOnly
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                        data-testid={`amount`}
                        formatOptions={{
                            format: '',
                            type: 'number',
                            decimalPlaces: 2,
                        }}
                    />
                )}

                {sswData.programSubType.text ===
                    SSWType.PercentOfAmountValue && (
                    <Field
                        disabled={isReadOnly}
                        label={t(`percent`) as string}
                        onChange={(e) => {
                            setSSWData(xss(e?.target?.value), 'percent');
                        }}
                        value={sswData.percent.text || ''}
                        size={FieldSize.Small}
                        trailing={<div>%</div>}
                        type={FieldType.BaseActive}
                        variant={
                            isReadOnly
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                        data-testid={`percent`}
                        formatOptions={{
                            format: '',
                            type: 'number',
                            decimalPlaces: 2,
                        }}
                    />
                )}

                {sswData.programSubType.text === SSWType.FixPeriod && (
                    <Field
                        disabled={isReadOnly}
                        label={t(`depleteFundYears`) as string}
                        onChange={(e) => {
                            setSSWData(
                                xss(e?.target?.value),
                                'depleteFundYears'
                            );
                        }}
                        value={sswData.depleteFundYears.text || ''}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        variant={
                            isReadOnly
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                        data-testid={`depleteFundYears`}
                        formatOptions={{
                            format: '',
                            type: 'number',
                            decimalPlaces: 2,
                        }}
                    />
                )}
            </div>
        </>
    );
}
