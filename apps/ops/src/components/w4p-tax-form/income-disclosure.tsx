import { useTranslation } from 'next-i18next';

import { numberFormat } from '@deps/containers/otp/reg60-forms/utils/reg60-constants';
import { PeriodicPensionFormType } from '@deps/models/case/withdrawal/case';

import Field, { FieldSize, FieldType, FieldVariant } from '../fields/field';

interface IncomeDisclosureProps {
    isFormStateReadOnly: boolean;
    formPeriodicPension: PeriodicPensionFormType;
    onDataChange: (field: string, value: string) => void;
}

const IncomeDisclosure = ({ isFormStateReadOnly, formPeriodicPension, onDataChange }: IncomeDisclosureProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.w4pPeriodicPayment' });

    const { claimsAndCredits, nonJobIncome, otherDeductions, otherIncomeAndPensions } = formPeriodicPension;
    return (
        <div className="my-4 grid grid-cols-2 gap-4">
            <Field
                formatOptions={numberFormat}
                label={t(`nonJobIncome`) as string}
                onChange={e => onDataChange('nonJobIncome', e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={nonJobIncome?.text as string}
                name="nonJobIncome"
                variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
            />

            <Field
                formatOptions={numberFormat}
                label={t(`claimsAndCredits`) as string}
                onChange={e => onDataChange('claimsAndCredits', e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={claimsAndCredits?.text as string}
                name="claimsAndCredits"
                variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
            />

            <Field
                formatOptions={numberFormat}
                label={t(`otherIncomeAndPensions`) as string}
                onChange={e => onDataChange('otherIncomeAndPensions', e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={otherIncomeAndPensions?.text as string}
                name="otherIncomeAndPensions"
                variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
            />

            <Field
                formatOptions={numberFormat}
                label={t(`otherDeductions`) as string}
                onChange={e => onDataChange('otherDeductions', e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={otherDeductions?.text as string}
                name="otherDeductions"
                variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
            />
        </div>
    );
};

export default IncomeDisclosure;
