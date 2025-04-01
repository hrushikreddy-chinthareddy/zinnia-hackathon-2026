import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useState, useEffect, useContext } from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect, { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import SelectSimple from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { WithdrawalType, ProgramType, FormProgram, ProgramSubType, AmountType } from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { SimpleOption } from '../select/select.helpers';

const dollarIcon = <span>$</span>;
const percentageIcon = <span>%</span>;

export const determineProgramType = (formProgram: FormProgram): ProgramType | '' => {
    switch (formProgram?.programType?.text) {
        case ProgramType.GMWB:
            return ProgramType.GMWB;
        case 'Full Surrender':
            return ProgramType.Full;
        case 'Withdrawal':
            if (formProgram?.programSubType?.text === ProgramSubType.TotalFreeWithdrawal) {
                return ProgramType.TotalFreeAmt;
            } else if (formProgram?.programSubType?.text === ProgramSubType.FullSurrender) {
                return ProgramType.TotalFreeAmt;
            } else {
                return ProgramType.Partial;
            }
        default:
            return '';
    }
};

export type AmountDetailsProps = {
    isOnlyWithdrawalTypeControls?: boolean;
    isFormStateReadOnly: boolean;
    programTypes?: SimpleOption[];
};

export default function AmountDetails({ isFormStateReadOnly, isOnlyWithdrawalTypeControls, programTypes }: AmountDetailsProps) {
    const { formProgram, setFormProgram } = useContext(FormDataContext);
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.amountDetails' });
    const asOfDate = formProgram?.asOfDate?.text
        ? dayjs(formProgram.asOfDate.text, ZAHARA_API_DATE_FORMAT).format(DATE_PICKER_FORMAT)
        : dayjs().format(DATE_PICKER_FORMAT);
    const [withdrawType, setWithdrawType] = useState(formProgram?.withdrawType?.text || '');
    const [programType, setProgramType] = useState(determineProgramType(formProgram));
    const [amount, setAmount] = useState(formProgram?.partialAmount?.text || '');
    const [gmwb, setGmwb] = useState(formProgram?.gmwbAmount?.text || '');
    const [effectiveDate, setEffectiveDate] = useState(asOfDate || '');

    // withdrawal type options
    const withdrawalTypeRadioItems = [
        { label: t(`gross`), value: WithdrawalType.Gross },
        { label: t(`net`), value: WithdrawalType.Net },
    ];

    useEffect(() => {
        const programForForm: FormProgram['program'] = { text: 'Withdrawal' };
        const programTypeForForm: FormProgram['programType'] = { text: '' };
        // ProgramSubType is controlled in by Distribution Instruction.
        // Default and Specify Amount will modify Partial withdrawals
        const programSubTypeForForm: FormProgram['programSubType'] = { text: null };
        const partialAmountForForm: FormProgram['partialAmount'] = { text: null, amountType: AmountType.Dollar };
        const gmwbAmount: FormProgram['gmwbAmount'] = { text: null, amountType: AmountType.Percent };

        switch (programType) {
            case ProgramType.Full:
                programTypeForForm.text = 'Full Surrender';
                break;
            case ProgramType.GMWB:
                programTypeForForm.text = ProgramType.GMWB;
                gmwbAmount.text = gmwb;
                break;
            case ProgramType.TotalFreeAmt:
                programTypeForForm.text = ProgramType.Withdrawal;
                programSubTypeForForm.text = ProgramSubType.TotalFreeWithdrawal;
                break;
            case ProgramType.Partial:
                programTypeForForm.text = ProgramType.Withdrawal;
                partialAmountForForm.text = amount;
                break;
            default:
                break;
        }

        if (isOnlyWithdrawalTypeControls) {
            setFormProgram(fs => ({
                ...fs,
                withdrawType: { text: withdrawType ? withdrawType : WithdrawalType.Gross },
            }));
        } else {
            setFormProgram({
                ...formProgram,
                asOfDate: effectiveDate
                    ? { text: dayjs(effectiveDate, DATE_PICKER_FORMAT).format(ZAHARA_API_DATE_FORMAT) }
                    : { text: null },
                gmwbAmount,
                partialAmount: partialAmountForForm,
                partialPercent: { text: null, amountType: AmountType.Percent }, //Hardcoded
                program: programForForm,
                programSubType: programSubTypeForForm,
                programType: programTypeForForm,
                withdrawType: { text: withdrawType },
            });
        }
    }, [programType, gmwb, withdrawType, effectiveDate, amount, isOnlyWithdrawalTypeControls]);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} className="mb-2">
                {t(`title`)}
            </Typography>
            <div className="my-4 flex max-w-[600px]  flex-row gap-10 ">
                <ButtonGrp
                    activeValue={withdrawType}
                    groupLabel={t(`amountType`)}
                    toggle={val => {
                        setWithdrawType(val as WithdrawalType);
                    }}
                    labels={withdrawalTypeRadioItems}
                    disabled={isFormStateReadOnly}
                />
            </div>
            {!isOnlyWithdrawalTypeControls && (
                <div className="my-4 flex flex-col gap-8 md:grid md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3 lg:grid-rows-1">
                    <SelectSimple
                        label={t(`programType`) as string}
                        options={programTypes || []}
                        onChange={(val: string) => setProgramType(val as ProgramType)}
                        size={FieldSize.Small}
                        value={programType}
                        disabled={isFormStateReadOnly}
                    />
                    {programType === ProgramType.Partial && (
                        <Field
                            leading={dollarIcon}
                            label={t(`amount`) as string}
                            onChange={e => setAmount(e.target.value)}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={amount}
                            variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                        />
                    )}
                    {programType === ProgramType.GMWB && (
                        <Field
                            label={t(`gmwb`) as string}
                            onChange={e => setGmwb(e.target.value)}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={gmwb}
                            trailing={percentageIcon}
                            variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                        />
                    )}

                    <FieldDateSelect
                        label={t(`effectiveDate`) as string}
                        isFutureDateDisabled={false}
                        onChange={e => setEffectiveDate(e.target.value)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={effectiveDate}
                        variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                    />
                </div>
            )}
        </CardContainer>
    );
}
