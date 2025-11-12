import xss from 'xss';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import {
    SupportedValidationOperation,
    Tooltip,
} from '@deps/models/case/withdrawal/disbursement-types';

interface BankTextFieldV2Props {
    fieldLabel: string;
    fieldName: string;
    classNames?: string;
    tooltip?: Tooltip;
    maxLength?: number;
    isFormStateReadOnly: boolean;
    defaultDisbursementInfo: any; // Adjust type based on your actual data structure
    onDataChange: (value: string, fieldName: string) => void;
    maskOnBlur?: boolean;
    validator?: (
        operation: SupportedValidationOperation,
        currentValue: string,
        allValues: any // Adjust type based on your actual data structure
    ) => string;
    error?: string;
    disableCopyPaste?: boolean;
    value: string;
    size: FieldSize;
    type: FieldType;
    isBankingField?: boolean;
}

const BankTextFieldV2 = ({
    fieldLabel,
    fieldName,
    classNames,
    tooltip,
    maxLength,
    isFormStateReadOnly,
    defaultDisbursementInfo,
    onDataChange,
    maskOnBlur,
    validator,
    error,
    disableCopyPaste,
    value,
    isBankingField = true,
}: BankTextFieldV2Props) => {
    const realTimeValidationError =
        validator?.(
            SupportedValidationOperation.Equal,
            value,
            isBankingField
                ? defaultDisbursementInfo?.bank?.[0]
                : defaultDisbursementInfo
        ) || error;

    return (
        <div className={classNames}>
            <Field
                label={fieldLabel}
                onChange={(e) => {
                    onDataChange(xss(e?.target?.value), fieldName);
                }}
                value={value as string}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                data-testid={fieldName}
                key={fieldName}
                labelTooltip={tooltip?.shouldDisplay ? tooltip?.title : ''}
                labelTooltipBody={tooltip?.shouldDisplay ? tooltip?.body : ''}
                maxLength={maxLength}
                maskOnBlur={maskOnBlur}
                message={realTimeValidationError}
                variant={
                    realTimeValidationError
                        ? FieldVariant.Error
                        : isFormStateReadOnly
                        ? FieldVariant.Inactive
                        : FieldVariant.Default
                }
                disableCopyPaste={disableCopyPaste}
            />
        </div>
    );
};

export default BankTextFieldV2;
