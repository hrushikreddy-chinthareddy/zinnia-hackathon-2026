import { WidgetProps } from '@rjsf/utils';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';

const validatePercentage = (actionData: any) => {
    const primaryBene = actionData?.filter(
        (bene: any) => bene.partyRole.partyRole === 'PRIMARYBENEFICIARY'
    );
    const primaryBeneTotal = primaryBene?.reduce(
        (acc: number, bene: any) =>
            acc + Number(bene.party.beneficiaryPercentage || 0),
        0
    );
    const isPrimaryBeneValid =
        primaryBene?.length === 0 || primaryBeneTotal === 100;

    const contingentBene = actionData?.filter(
        (bene: any) => bene.partyRole.partyRole === 'CONTINGENTBENEFICIARY'
    );
    const contingentBeneTotal = contingentBene?.reduce(
        (acc: number, bene: any) =>
            acc + Number(bene.party.beneficiaryPercentage || 0),
        0
    );
    const isContingentBeneValid =
        contingentBene?.length === 0 || contingentBeneTotal === 100;

    return isPrimaryBeneValid && isContingentBeneValid;
};

const PercentageWidget = ({
    id,
    value,
    disabled,
    readonly,
    required,
    onChange,
    placeholder,
    formContext,
}: WidgetProps) => {
    const actionData = formContext.customData.actionData;
    const validate = validatePercentage(actionData);

    return readonly ? (
        value
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <Field
                name={id}
                value={value}
                trailing={<div>%</div>}
                id={id}
                disabled={disabled}
                required={required}
                readOnly={readonly}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={!validate ? FieldVariant.Error : FieldVariant.Default}
                message={
                    !validate
                        ? 'Please make sure allocation is equal to 100%'
                        : ''
                }
            />
        </div>
    );
};

export default PercentageWidget;
