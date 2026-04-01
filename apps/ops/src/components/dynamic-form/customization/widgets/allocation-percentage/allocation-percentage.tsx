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

const toSafeNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getFilteredByRole = (actionData: any, roleType: string) => {
    return actionData?.filter(
        (item: any) =>
            item.action !== 'DELETE' && item.partyRole?.partyRole === roleType
    );
};

const getTotalAllocation = (parties: any, fieldName: string) => {
    return parties?.reduce(
        (acc: number, item: any) => acc + toSafeNumber(item.party?.[fieldName]),
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

const getTotalAllocationFromArrayRows = (rows: any, fieldName: string) => {
    return rows?.reduce(
        (acc: number, item: any) => acc + toSafeNumber(item?.[fieldName]),
        0
    );
};

const isArrayRowAllocationValid = (rows: any, fieldName: string) => {
    return (
        rows?.length === 0 ||
        getTotalAllocationFromArrayRows(rows, fieldName) === 100
    );
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

function mergeRowValueIntoParentArray(
    rows: unknown,
    rowIndex: number,
    fieldKey: string | undefined,
    value: unknown
): any {
    if (!Array.isArray(rows) || rowIndex < 0 || !fieldKey) {
        return rows;
    }
    return rows.map((item, i) =>
        i === rowIndex
            ? {
                  ...(item ?? {}),
                  [fieldKey]: value,
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
    const parentArrayData = formContext.parentActionData;
    const uiOptions = getUiOptions(uiSchema);
    const widgetPartyRole = uiOptions.partyRole as string | undefined;
    const { setSubmitEnabled, setSubmitDisabledStepIndex } = formContext;
    const { currentStepIndex } = useWorkflow();
    const indexMatch = id.match(/_(\d+)_/);
    const rowIndex = indexMatch ? Number(indexMatch[1]) : -1;
    const fieldMatch = id.match(/_(\d+)_(.+)$/);
    const rowFieldName = fieldMatch?.[2];

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
    const parentArrayForValidation = useMemo(
        () =>
            mergeRowValueIntoParentArray(
                parentArrayData,
                rowIndex,
                rowFieldName,
                value
            ),
        [parentArrayData, rowIndex, rowFieldName, value]
    );

    const isValid = useMemo(() => {
        if (Array.isArray(actionDataForValidation)) {
            return validatePercentage(actionDataForValidation, widgetPartyRole);
        }
        if (Array.isArray(parentArrayForValidation) && rowFieldName) {
            const activeRows = getActiveParties(parentArrayForValidation);
            return isArrayRowAllocationValid(activeRows, rowFieldName);
        }
        return true;
    }, [
        actionDataForValidation,
        widgetPartyRole,
        parentArrayForValidation,
        rowFieldName,
    ]);

    useEffect(() => {
        if (
            !Array.isArray(actionData) &&
            !Array.isArray(parentArrayForValidation)
        ) {
            return;
        }
        setSubmitDisabledStepIndex?.(currentStepIndex);
        setSubmitEnabled?.(isValid);
    }, [
        actionData,
        parentArrayForValidation,
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
