import { useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import { selectVarientByConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';

import { AppliedChargesProps, ApplyChargesType } from './applied-charges-types';

const AppliedCharges = ({
    checkboxLabel,
    textInputLabel,
    isChecked = false,
    amountValue = '',
    required = false,
    formError,
    onDataChange,
    isFormStateReadOnly,
}: AppliedChargesProps) => {
    const [applyCharges, setApplyCharges] = useState<ApplyChargesType>({
        applicable: isChecked,
        amount: amountValue,
    });

    const handleCheckBox = () => {
        if (applyCharges.applicable) {
            onDataChange({ applicable: !applyCharges.applicable, amount: '' });
            setApplyCharges({
                applicable: !applyCharges.applicable,
                amount: '',
            });
        } else {
            onDataChange({
                ...applyCharges,
                applicable: !applyCharges.applicable,
            });
            setApplyCharges((oldState) => ({
                ...oldState,
                applicable: !applyCharges.applicable,
            }));
        }
    };

    const handleInputChange = (value: string) => {
        onDataChange({ ...applyCharges, amount: value });
        setApplyCharges((oldState) => ({ ...oldState, amount: value }));
    };

    return (
        <div
            className={
                applyCharges.applicable
                    ? ' rounded-md border-2 border-gray-200 p-3'
                    : 'my-6'
            }
        >
            <CheckboxText
                checked={applyCharges?.applicable}
                label={checkboxLabel}
                onClick={handleCheckBox}
                isDisabled={isFormStateReadOnly}
            />
            {applyCharges.applicable ? (
                <div className="my-2 mt-4">
                    <Field
                        label={textInputLabel}
                        onChange={(e) => handleInputChange(e.target.value)}
                        leading={<div>$</div>}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={
                            isNaN(applyCharges.amount as number)
                                ? ''
                                : (applyCharges.amount as string)
                        }
                        message={formError}
                        variant={selectVarientByConfig({
                            value: String(applyCharges.amount),
                            isFormStateReadOnly,
                            error: formError,
                        })}
                        className="my-1"
                        required={required}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default AppliedCharges;
