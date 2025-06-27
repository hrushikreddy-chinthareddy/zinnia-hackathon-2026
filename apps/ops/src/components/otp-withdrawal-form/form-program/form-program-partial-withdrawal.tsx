import dayjs from 'dayjs';
import { DefaultTFuncReturn } from 'i18next';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import { RadioItem } from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    AmountType,
    DateFieldType,
    FormProgram,
    ProgramType,
} from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import ContractReplacement from './contract-replacement';
import FormProgramProcessDate, {
    SelectOneOption,
} from './form-program-process-date';
import { EditableFormProgramFields } from './form-program.helpers';

export interface PartialWithdrawalOption extends Omit<RadioItem, 'subelement'> {
    amountFieldType?: AmountType;
    dateFieldType?: DateFieldType;
    inputFieldLabel?: DefaultTFuncReturn;
    generatePayloadFromSelection: (
        amount?: string | null
    ) => EditableFormProgramFields; // Defines what the formProgram "editable fields" should look like when the option is selected.  There is significant variance between carriers and selections on what parts of formProgram should change.
}

type FormProgramPartialWithdrawalProps = {
    title?: string;
    options: PartialWithdrawalOption[];
    selectOneOptions?: SelectOneOption[];
    selectionIdentifier?: (val: FormProgram) => {
        selectedOption: string | null;
        amount: string | null;
        maturityGuaranteePeriod?: string | null;
    };
    isFormStateReadOnly?: boolean;
    showContractReplacement?: boolean;
};

const icons = {
    DOLLAR: { leading: <span>$</span> },
    PERCENT: { trailing: <span>%</span> },
};
export default function FormProgramPartialWithdrawal({
    title,
    options,
    selectOneOptions,
    selectionIdentifier,
    isFormStateReadOnly,
    showContractReplacement,
}: FormProgramPartialWithdrawalProps) {
    const [amount, setAmount] = useState('');
    const [maturityGuaranteePeriod, setMaturityGuaranteePeriod] = useState('');
    const [selected, setSelected] = useState('');
    const selectedOption = options.find((val) => val.value === selected);
    const { formProgram, setFormProgram } = useContext(FormDataContext);

    useEffect(() => {
        if (selectionIdentifier) {
            const {
                selectedOption,
                amount: savedAmount,
                maturityGuaranteePeriod,
            } = selectionIdentifier(formProgram);
            setSelected(selectedOption ?? '');
            setAmount(savedAmount ?? '');
            setMaturityGuaranteePeriod(maturityGuaranteePeriod ?? '');
        }

        // remove accountCloseReason and setIsValidAsOfDate to true)
        setFormProgram(
            ({
                accountCloseReason: omitThis,
                isValidAsOfDate: omitThisToo,
                ...rest
            }) => {
                return { ...rest, isValidAsOfDate: true };
            }
        );
    }, []);

    useEffect(() => {
        const selectedOption = options.find((val) => val.value === selected);

        if (selectedOption?.generatePayloadFromSelection) {
            if (selectedOption.dateFieldType === DateFieldType.MaturityDate) {
                setFormProgram((oldVal) => {
                    return {
                        ...oldVal,
                        ...selectedOption.generatePayloadFromSelection(
                            dayjs(
                                maturityGuaranteePeriod,
                                DATE_PICKER_FORMAT
                            ).format(ZAHARA_API_DATE_FORMAT)
                        ),
                    };
                });
            } else {
                setFormProgram((oldVal) => {
                    return {
                        ...oldVal,
                        ...selectedOption.generatePayloadFromSelection(amount),
                    };
                });
            }
        }
    }, [amount, selected, maturityGuaranteePeriod]);

    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.amountDetails.partialWithdrawal',
    });

    const getFieldLabel = (programType: ProgramType) => {
        if (programType === ProgramType.PartialPercent) {
            return t('percent') as string;
        }
        return t('dollar') as string;
    };

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} className="mb-2">
                {title || t(`title`)}
            </Typography>
            <div
                className="my-4 flex flex-col gap-8 md:grid md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3 lg:grid-rows-1"
                data-testid="partial-withdrawal-program"
            >
                <SelectSimple
                    label={t('pleaseChooseOne') as string}
                    value={selected}
                    onChange={setSelected}
                    options={options}
                    size={FieldSize.Small}
                    name="pleaseChooseOne"
                    data-testid="pleaseChooseOne-amountField"
                    disabled={isFormStateReadOnly}
                />
                {selectedOption?.amountFieldType && (
                    <>
                        <Field
                            {...icons[selectedOption.amountFieldType]}
                            label={getFieldLabel(selected as ProgramType)}
                            onChange={(e) => setAmount(e.target.value)}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={amount}
                            name="amount"
                            formatOptions={{
                                format: '',
                                type: 'number',
                                decimalPlaces: 2,
                            }}
                            variant={
                                isFormStateReadOnly
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                    </>
                )}

                {selectedOption?.dateFieldType &&
                    selectedOption?.dateFieldType ===
                        DateFieldType.MaturityDate && (
                        <FieldDateSelect
                            label={t('date') as string}
                            id="maturityGuaranteePeriod-date"
                            isFutureDateDisabled={false}
                            onChange={(e) => {
                                setMaturityGuaranteePeriod(e.target.value);
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={maturityGuaranteePeriod}
                            disabled={isFormStateReadOnly}
                            variant={
                                isFormStateReadOnly
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                    )}
            </div>
            {selectOneOptions && (
                <FormProgramProcessDate
                    isFormStateReadOnly={isFormStateReadOnly}
                    options={selectOneOptions}
                />
            )}
            {showContractReplacement && (
                <ContractReplacement
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            )}
        </CardContainer>
    );
}
