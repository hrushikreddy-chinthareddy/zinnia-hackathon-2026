import { WidgetProps, getUiOptions } from '@rjsf/utils';
import { useEffect, useMemo } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { PartyRole } from '@zinnia/api-types/types/sor';

const allocationPercentageValidationError =
    'Please make sure allocation is equal to 100%';

const getActiveParties = (actionData: any) => {
    return actionData?.filter((item: any) => item.action !== 'DELETE') ?? [];
};

const getFilteredByRole = (actionData: any, roleType: string) => {
    return actionData?.filter(
        (item: any) =>
            item.action !== 'DELETE' && item.partyRole?.partyRole === roleType
    );
};

const getTotalAllocation = (parties: any, fieldName: string) => {
    return parties?.reduce(
        (acc: number, item: any) => acc + Number(item.party?.[fieldName] || 0),
        0
    );
};

const isAllocationValid = (parties: any, fieldName: string) => {
    return (
        parties?.length === 0 || getTotalAllocation(parties, fieldName) === 100
    );
};

const validatePercentage = (actionData: any, widgetPartyRole?: string) => {
    if (widgetPartyRole === PartyRole.PAYEE) {
        const activePayees = getActiveParties(actionData);
        return isAllocationValid(activePayees, 'payeePercentage');
    }

    const primaryBene = getFilteredByRole(actionData, 'PRIMARYBENEFICIARY');
    const isPrimaryBeneValid = isAllocationValid(
        primaryBene,
        'beneficiaryPercentage'
    );

    const contingentBene = getFilteredByRole(
        actionData,
        'CONTINGENTBENEFICIARY'
    );
    const isContingentBeneValid = isAllocationValid(
        contingentBene,
        'beneficiaryPercentage'
    );

    return isPrimaryBeneValid && isContingentBeneValid;
};

/** Overlay this field's `value` onto `actionData` — RJSF updates `value` before `customData.actionData` catches up. */
function mergeRowValueIntoActionData(
    actionData: unknown,
    rowIndex: number,
    percentageField: string,
    value: unknown
): any {
    if (!Array.isArray(actionData) || rowIndex < 0) {
        return actionData;
    }
    return actionData.map((item, i) =>
        i === rowIndex
            ? {
                  ...item,
                  party: {
                      ...item.party,
                      [percentageField]: value,
                  },
              }
            : item
    );
}

const PercentageWidget = ({
    id,
    value,
    disabled,
    readonly,
    required,
    onChange,
    placeholder,
    formContext,
    uiSchema,
}: WidgetProps) => {
    const actionData = formContext.customData.actionData;
    const uiOptions = getUiOptions(uiSchema);
    const widgetPartyRole = uiOptions.partyRole as string | undefined;
    const { setSubmitEnabled, setSubmitDisabledStepIndex } = formContext;
    const { currentStepIndex } = useWorkflow();
    const indexMatch = id.match(/actionData_(\d+)_/);
    const rowIndex = indexMatch ? Number(indexMatch[1]) : -1;

    const percentageField =
        widgetPartyRole === PartyRole.PAYEE
            ? 'payeePercentage'
            : 'beneficiaryPercentage';

    const actionDataForValidation = useMemo(
        () =>
            mergeRowValueIntoActionData(
                actionData,
                rowIndex,
                percentageField,
                value
            ),
        [actionData, rowIndex, percentageField, value]
    );

    const isValid = useMemo(
        () => validatePercentage(actionDataForValidation, widgetPartyRole),
        [actionDataForValidation, widgetPartyRole]
    );

    useEffect(() => {
        if (!Array.isArray(actionData)) {
            return;
        }
        setSubmitDisabledStepIndex?.(currentStepIndex);
        setSubmitEnabled?.(isValid);
    }, [
        actionData,
        isValid,
        currentStepIndex,
        setSubmitEnabled,
        setSubmitDisabledStepIndex,
    ]);

    if (readonly) {
        return value;
    }

    return (
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
                variant={isValid ? FieldVariant.Default : FieldVariant.Error}
                message={isValid ? '' : allocationPercentageValidationError}
            />
        </div>
    );
};

export default PercentageWidget;
