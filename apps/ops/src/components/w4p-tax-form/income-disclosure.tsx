import { numberFormat } from '@deps/containers/otp/reg60-forms/utils/reg60-constants';
import Field, { FieldSize, FieldType, FieldVariant } from '../fields/field';

interface IncomeDisclosureProps {
    isFormStateReadOnly: boolean;
}

const IncomeDisclosure = ({ isFormStateReadOnly }: IncomeDisclosureProps) => {
    return (
        <div className="my-4 grid grid-cols-4 gap-2">
            <Field
                formatOptions={numberFormat}
                // label={t(`numberofAllowance`) as string}
                label="Income from a Job/Pension/Annuity"
                onChange={() => {}}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={'' as string}
                name="numberofAllowance"
                variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
            />

            <Field
                formatOptions={numberFormat}
                // label={t(`numberofAllowance`) as string}
                label="Claim Dependent and and other Credits"
                onChange={() => {}}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={'' as string}
                name="numberofAllowance"
                variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
            />

            <Field
                formatOptions={numberFormat}
                // label={t(`numberofAllowance`) as string}
                label="Other Income "
                onChange={() => {}}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={'' as string}
                name="numberofAllowance"
                variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
            />

            <Field
                formatOptions={numberFormat}
                // label={t(`numberofAllowance`) as string}
                label="Deduction"
                onChange={() => {}}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={'' as string}
                name="numberofAllowance"
                variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
            />
        </div>
    );
};

export default IncomeDisclosure;
