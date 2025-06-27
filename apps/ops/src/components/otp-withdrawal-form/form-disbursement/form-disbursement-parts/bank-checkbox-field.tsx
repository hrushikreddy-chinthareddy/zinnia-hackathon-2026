import React from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { DisbursementInformation } from '@deps/models/case/withdrawal/disbursement-types';

const BankCheckboxField = ({
    fieldLabel,
    fieldName,
    classNames,
    isFormStateReadOnly,
    disbursementInformation,
    onDataChange,
}: DisbursementInformation) => {
    const value = !!disbursementInformation[fieldName];

    const setDataChange = (value: boolean) => {
        onDataChange((ogData) => ({
            ...ogData,
            [fieldName]: value ?? null,
        }));
    };

    return (
        <div className={classNames}>
            <CheckboxText
                label={fieldLabel}
                checked={value}
                onChange={() => setDataChange(!value)}
                isDisabled={isFormStateReadOnly}
                key={fieldName}
            />
        </div>
    );
};

export default BankCheckboxField;
