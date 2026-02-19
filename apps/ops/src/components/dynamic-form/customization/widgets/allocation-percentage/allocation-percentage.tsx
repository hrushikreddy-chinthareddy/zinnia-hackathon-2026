import { WidgetProps } from '@rjsf/utils';
import { useEffect } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';

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
    const validate = validatePercentage(actionData);
    const { setSubmitEnabled, setSubmitDisabledStepIndex } = formContext;
    const { currentStepIndex } = useWorkflow();
    const indexMatch = id.match(/actionData_(\d+)_/);
    const index = indexMatch ? Number(indexMatch[1]) : -1;

    useEffect(() => {
        if (Array.isArray(actionData)) {
            const updatedActionData = actionData.map((item, i) => {
                if (i === index) {
                    if (setSubmitDisabledStepIndex) {
                        setSubmitDisabledStepIndex(currentStepIndex);
                    }
                    return {
                        ...item,
                        party: {
                            ...item.party,
                            beneficiaryPercentage: value,
                        },
                    };
                }
                return item;
            });
            const isValid = validatePercentage(updatedActionData);
            if (setSubmitEnabled) {
                setSubmitEnabled(isValid);
            }
        }
    }, [value, actionData, setSubmitEnabled]);

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
