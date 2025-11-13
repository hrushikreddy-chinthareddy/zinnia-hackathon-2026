import { WidgetProps } from '@rjsf/utils';
import { useEffect } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';

// TODO: make this widget generic and reusable for other transactions

const allocationPercentageValidationError =
    'Please make sure allocation is equal to 100%';

const getFilteredBene = (actionData: any, beneType: string) => {
    return actionData?.filter(
        (bene: any) =>
            bene.action !== 'DELETE' && bene.partyRole.partyRole === beneType
    );
};

const getBeneTotalAllocation = (beneData: any) => {
    return beneData?.reduce(
        (acc: number, bene: any) =>
            acc + Number(bene.party.beneficiaryPercentage || 0),
        0
    );
};

const isBeneValid = (beneData: any) => {
    return beneData?.length === 0 || getBeneTotalAllocation(beneData) === 100;
};

const validatePercentage = (actionData: any) => {
    const primaryBene = getFilteredBene(actionData, 'PRIMARYBENEFICIARY');
    const isPrimaryBeneValid = isBeneValid(primaryBene);

    const contingentBene = getFilteredBene(actionData, 'CONTINGENTBENEFICIARY');
    const isContingentBeneValid = isBeneValid(contingentBene);

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
    let validate = validatePercentage(actionData);
    const beneficiaryPercentages = Array.isArray(actionData)
        ? actionData.map((item) => item?.party?.beneficiaryPercentage).join(',')
        : '';

    useEffect(() => {
        validate = validatePercentage(actionData);
    }, [beneficiaryPercentages]);

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
                message={!validate ? allocationPercentageValidationError : ''}
            />
        </div>
    );
};

export default PercentageWidget;
