import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, useContext, useState } from 'react';

import Autocomplete from '@deps/components/autocomplete/autocomplete';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import { selectVarientByConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import Radio, { RadioVariant } from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { Reg60FormContext } from '@deps/contexts/Reg60FormContext';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { ProposedAnnuityQuoteProps } from './proposed-annuity-quote.types';
import { amountFormat } from '../../utils/reg60-constants';
import {
    generateYearOptions,
    getPaymentFrequencyOptions,
    getRetireEaseChoiceOptions,
    getRetireEaseOptions,
} from '../../utils/reg60-form-helper';
import { Products } from '../disclosure-authorization/disclosure-authorization.types';

const ProposedAnnuityQuote = ({
    annuityQuote,
    onAnnuityQuoteChange,
    formConfig,
    product,
    contractId,
}: ProposedAnnuityQuoteProps): JSX.Element => {
    const { t } = useTranslation(TranslationFiles.REG60DEFS, { keyPrefix: 'caseReg60.request' });
    const { fields } = formConfig;
    const { formErrors, isFormStateReadOnly } = useContext(Reg60FormContext);
    const [radioSelection, setRadioSelection] = useState(annuityQuote.typeOfPayment);

    const handleFirstPaymentDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const formattedDate = dayjs(e.target.value, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT);
        if (dayjs(formattedDate).isValid()) {
            onAnnuityQuoteChange({
                ...annuityQuote,
                firstPaymentDate: formattedDate,
            });
        }
    };

    const showPeriodCertainYear = !!(
        annuityQuote.incomeOption === 'SINGLE_LIFE_PC' ||
        annuityQuote.incomeOption === 'JT_SURV_LIFE_PC' ||
        annuityQuote.incomeOption === 'PERIOD_CERTAIN' ||
        annuityQuote.incomeOption === 'JT_SURV_CONV_PC'
    );

    return (
        <div data-testid="proposed-annuity-container">
            {fields.proposedAnnuityQuote && (
                <Typography className="my-4" variant={TypographyVariant.H2}>
                    {fields.proposedAnnuityQuote.title}
                </Typography>
            )}

            {fields.annuitizationQuote && (
                <Typography className="my-4" variant={TypographyVariant.H2}>
                    {fields.annuitizationQuote.title}
                </Typography>
            )}
            {fields.annuityPaymentAmount && (
                <div className="mb-4 max-w-xs">
                    <Field
                        className={
                            fields.annuityPaymentAmount.isRequired && formErrors?.annuityPaymentAmount
                                ? 'border-2 border-solid border-semantic-error'
                                : ''
                        }
                        leading={<div>$</div>}
                        value={annuityQuote?.annuityPaymentAmount === 0 ? '' : String(annuityQuote?.annuityPaymentAmount)}
                        label={fields.annuityPaymentAmount.fieldLabel}
                        onChange={e => onAnnuityQuoteChange({ ...annuityQuote, annuityPaymentAmount: +e.target.value })}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        message={fields.annuityPaymentAmount.isRequired ? formErrors?.annuityPaymentAmount : ''}
                        variant={selectVarientByConfig({
                            value: (fields.annuityPaymentAmount.isRequired && String(annuityQuote?.annuityPaymentAmount)) || '',
                            isFormStateReadOnly,
                            error: formErrors?.annuityPaymentAmount,
                        })}
                        formatOptions={amountFormat}
                        required={fields.annuityPaymentAmount.isRequired}
                    />
                </div>
            )}
            {fields.firstPaymentDate && (
                <div className="mb-4 max-w-xs">
                    <FieldDateSelect
                        isFutureDateDisabled={false}
                        className={
                            fields.firstPaymentDate.isRequired && formErrors?.firstPaymentDate
                                ? 'border-2 border-solid border-semantic-error'
                                : ''
                        }
                        label={fields.firstPaymentDate.fieldLabel}
                        value={
                            annuityQuote.firstPaymentDate
                                ? dayjs(annuityQuote.firstPaymentDate, 'YYYY-MM-DD').format(NUMERIC_DATE_FORMAT)
                                : ''
                        }
                        onChange={handleFirstPaymentDateChange}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        message={fields.firstPaymentDate.isRequired ? formErrors?.firstPaymentDate : ''}
                        variant={selectVarientByConfig({
                            value: (fields.firstPaymentDate.isRequired && String(annuityQuote?.firstPaymentDate)) || '',
                            isFormStateReadOnly,
                            error: formErrors?.firstPaymentDate,
                        })}
                        required={fields.firstPaymentDate.isRequired}
                    />
                </div>
            )}
            {fields.paymentFrequency && (
                <div className="mb-4 max-w-xs">
                    <SelectSimple
                        disabled={isFormStateReadOnly}
                        label={fields.paymentFrequency.fieldLabel}
                        value={annuityQuote.paymentFrequency}
                        onChange={val => onAnnuityQuoteChange({ ...annuityQuote, paymentFrequency: val })}
                        options={getPaymentFrequencyOptions(t)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        required={fields.paymentFrequency.isRequired}
                        variant={selectVarientByConfig({
                            value: String(annuityQuote?.paymentFrequency),
                            isFormStateReadOnly,
                            error: formErrors?.paymentFrequency,
                        })}
                        message={formErrors?.paymentFrequency}
                    />
                </div>
            )}
            {fields.paymentFrequencyText && (
                <div className="mb-4 max-w-xs">
                    <Field
                        className={formErrors?.paymentFrequencyText && 'border-2 border-solid border-semantic-error'}
                        value={annuityQuote?.paymentFrequency}
                        label={fields.paymentFrequencyText.fieldLabel}
                        onChange={e => onAnnuityQuoteChange({ ...annuityQuote, paymentFrequency: e.target.value })}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        required={fields.paymentFrequencyText.isRequired}
                        variant={selectVarientByConfig({
                            value: String(annuityQuote?.paymentFrequency),
                            isFormStateReadOnly,
                            error: formErrors?.paymentFrequencyText,
                        })}
                    />
                </div>
            )}
            {fields.incomeOption && (
                <div className="mb-4 max-w-xs">
                    <SelectSimple
                        disabled={isFormStateReadOnly}
                        label={fields.incomeOption.fieldLabel}
                        value={annuityQuote.incomeOption}
                        onChange={val => onAnnuityQuoteChange({ ...annuityQuote, incomeOption: val })}
                        options={product === Products.retireEase ? getRetireEaseOptions(t) : getRetireEaseChoiceOptions(t)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        required={fields.incomeOption.isRequired}
                        message={formErrors?.incomeOption}
                        variant={selectVarientByConfig({
                            value: String(annuityQuote?.incomeOption),
                            isFormStateReadOnly,
                            error: formErrors?.incomeOption,
                        })}
                    />
                </div>
            )}

            {fields.incomeOptionText && (
                <div className="mb-4 max-w-xs">
                    <Field
                        className={formErrors?.incomeOptionText && 'border-2 border-solid border-semantic-error'}
                        value={annuityQuote?.incomeOption}
                        label={fields.incomeOptionText.fieldLabel}
                        onChange={e => onAnnuityQuoteChange({ ...annuityQuote, incomeOption: e.target.value })}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        message={formErrors?.incomeOptionText}
                        variant={selectVarientByConfig({
                            value: String(annuityQuote?.incomeOption),
                            isFormStateReadOnly,
                            error: formErrors?.incomeOptionText,
                        })}
                        maxLength={26}
                        required={fields.incomeOptionText.isRequired}
                    />
                </div>
            )}

            {fields.periodCertainYears && showPeriodCertainYear && (
                <div className="mb-4 max-w-xs">
                    <Autocomplete
                        disabled={isFormStateReadOnly}
                        onChange={val => onAnnuityQuoteChange({ ...annuityQuote, periodCertainYears: val })}
                        value={annuityQuote.periodCertainYears}
                        label={fields.periodCertainYears.fieldLabel}
                        options={generateYearOptions()}
                        variant={formErrors?.periodCertainYears ? FieldVariant.Error : FieldVariant.Default}
                        message={formErrors?.periodCertainYears}
                        type={FieldType.BaseActive}
                        className="flex flex-col"
                        required
                        data-testid="period-cetain-years"
                    />
                </div>
            )}

            {fields.typeOfPayment && (
                <div className="mb-4 max-w-xs">
                    <Radio
                        items={fields?.typeOfPayment?.selectOptions}
                        label={fields?.typeOfPayment?.fieldLabel}
                        onChange={event => {
                            setRadioSelection(event.target.value);
                            onAnnuityQuoteChange({ ...annuityQuote, typeOfPayment: event.target.value });
                        }}
                        value={radioSelection}
                        required={fields.typeOfPayment.isRequired}
                        name={`${fields?.typeOfPayment?.fieldLabel}-${contractId}`}
                        disabled={isFormStateReadOnly}
                        variant={isFormStateReadOnly ? RadioVariant.Inactive : RadioVariant.Default}
                    />
                </div>
            )}
        </div>
    );
};

export default ProposedAnnuityQuote;
