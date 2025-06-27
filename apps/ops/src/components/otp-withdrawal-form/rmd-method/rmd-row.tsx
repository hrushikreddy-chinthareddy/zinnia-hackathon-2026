import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import xss from 'xss';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import SelectSimple from '@deps/components/select/select';
import {
    AmountType,
    Frequency,
    RMDProgram,
} from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

interface RMDOptionsProps {
    rmdData: RMDProgram;
    onDataChange: (value: RMDProgram) => void;
    isFormStateReadOnly: boolean;
}

export default function RMDOptions({
    rmdData,
    onDataChange,
    isFormStateReadOnly,
}: RMDOptionsProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.rmdMethod',
    });
    const today = dayjs().format(DATE_PICKER_FORMAT);

    const formStartDate = rmdData?.startDate?.text
        ? dayjs(rmdData?.startDate?.text, ZAHARA_API_DATE_FORMAT).format(
              DATE_PICKER_FORMAT
          )
        : '';

    const [startDate, setStartDate] = useState(formStartDate || today);
    const [frequency, setFrequency] = useState(
        rmdData?.frequency?.text || Frequency.Annually
    );
    const [duration, setDuration] = useState(rmdData?.duration?.text || '0'); // CMW-13796 default set to 0 instead of 1
    const [amount, setAmount] = useState('');
    const [showAmount, setShowAmount] = useState<boolean>(false);

    const onClickAmount = () => {
        if (!isFormStateReadOnly) {
            setShowAmount(!showAmount);
        }
    };

    useEffect(() => {
        onDataChange({
            startDate: startDate
                ? {
                      text: dayjs(startDate, DATE_PICKER_FORMAT).format(
                          ZAHARA_API_DATE_FORMAT
                      ),
                  }
                : { text: '' },
            frequency: { text: frequency },
            duration: { text: duration },
            amount: { text: amount || null, amountType: AmountType.Dollar },
        });
    }, [startDate, frequency, duration, amount]);

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
            <div className="grid grid-cols-auto-4 gap-4">
                <div>
                    <FieldDateSelect
                        label={t('startDate') as string}
                        id="startDate"
                        isFutureDateDisabled={false}
                        onChange={(e) => {
                            setStartDate(e.target.value);
                        }}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={startDate}
                        disabled={isFormStateReadOnly}
                        variant={
                            isFormStateReadOnly
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                    />
                    {!showAmount && !isFormStateReadOnly && (
                        <AssistiveText
                            text={t('enterAmountManually') as string}
                            iconOverride={` `}
                            onClick={onClickAmount}
                            variant={AssistiveTextVariant.Info}
                            className="primary-gradient-linear my-2 inline-flex w-max cursor-pointer italic"
                        />
                    )}
                    {showAmount && (
                        <AssistiveText
                            text={t('removeAmountField') as string}
                            iconOverride={` `}
                            onClick={onClickAmount}
                            variant={AssistiveTextVariant.Info}
                            className="primary-gradient-linear my-2 inline-flex w-max cursor-pointer italic"
                        />
                    )}
                </div>

                <SelectSimple
                    className="max-w-lg"
                    label={t('frequency') as string}
                    options={frequencyOptions}
                    onChange={(val: string) => setFrequency(val as Frequency)}
                    size={FieldSize.Small}
                    value={frequency}
                    name="frequency"
                    placeholder={t('selectOption') as string}
                    disabled={isFormStateReadOnly}
                />

                <Field
                    label={t(`duration`) as string}
                    onChange={(e) => {
                        setDuration(xss(e?.target?.value));
                    }}
                    value={duration}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                    data-testid={`duration`}
                    formatOptions={{
                        format: '',
                        type: 'number',
                    }}
                />

                {showAmount && (
                    <Field
                        label={t(`amount`) as string}
                        onChange={(e) => {
                            setAmount(xss(e?.target?.value));
                        }}
                        value={amount}
                        size={FieldSize.Small}
                        leading={<div>$</div>}
                        type={FieldType.BaseActive}
                        variant={
                            isFormStateReadOnly
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
            </div>
        </>
    );
}
