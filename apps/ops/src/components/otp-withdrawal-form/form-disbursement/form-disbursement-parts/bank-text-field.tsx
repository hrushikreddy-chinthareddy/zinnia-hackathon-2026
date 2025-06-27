import xss from 'xss';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import {
    DisbursementInformation,
    SupportedValidationOperation,
} from '@deps/models/case/withdrawal/disbursement-types';

const BankTextField = ({
    fieldLabel,
    fieldName,
    classNames,
    tooltip,
    maxLength,
    isFormStateReadOnly,
    disbursementInformation,
    onDataChange,
    maskOnBlur,
    validator,
    error,
    disableCopyPaste,
}: DisbursementInformation) => {
    const value = disbursementInformation[fieldName] as string;
    const realTimeValidationError =
        validator?.(
            SupportedValidationOperation.Equal,
            value,
            disbursementInformation
        ) || error;

    const setDataChange = (val: string) => {
        onDataChange((ogData) => ({
            ...ogData,
            [fieldName]: ['fboDetails', 'contractNumber', 'payeeName'].includes(
                fieldName
            )
                ? val?.toUpperCase()
                : val,
        }));
    };

    return (
        <div className={classNames}>
            <Field
                label={fieldLabel}
                onChange={(e) => {
                    setDataChange(xss(e?.target?.value));
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

export default BankTextField;
