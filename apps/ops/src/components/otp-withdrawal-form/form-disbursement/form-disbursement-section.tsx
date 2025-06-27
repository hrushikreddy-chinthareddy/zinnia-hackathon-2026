import React, {
    Dispatch,
    SetStateAction,
    createElement,
    useContext,
} from 'react';

import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    DisbursementConfig,
    DisbursementParts,
} from '@deps/models/case/withdrawal/disbursement-types';

import { SelectedBankContext } from './form-disbursement-parts/pre-populate-banking-details';

export type FormDisbursementSectionProps = {
    onDataChange: Dispatch<SetStateAction<DisbursementParts>>;
    fields: DisbursementConfig[] | null;
    disbursementInformation: DisbursementParts;
    isFormStateReadOnly: boolean;
};
const FormDisbursementSection = ({
    fields,
    isFormStateReadOnly = false,
    disbursementInformation,
    onDataChange,
}: FormDisbursementSectionProps) => {
    const { isBankSelected } = useContext(SelectedBankContext);
    const formDataContext = useContext(FormDataContext);
    return (
        <div className="my-4 grid w-full grid-cols-3 gap-2">
            {fields &&
                fields.map((currentField) => {
                    const {
                        component,
                        fieldName,
                        fieldLabel,
                        classNames,
                        isBankingField,
                        tooltip,
                        maxLength,
                        shouldDisplay,
                        maskOnBlur,
                        disableCopyPaste,
                        validator,
                    } = currentField;
                    if (
                        shouldDisplay &&
                        shouldDisplay(formDataContext) === false
                    ) {
                        return '';
                    }
                    return createElement(component, {
                        fieldName,
                        fieldLabel,
                        isBankingField,
                        isFormStateReadOnly:
                            (!!isBankingField && !!isBankSelected) ||
                            isFormStateReadOnly,
                        disbursementInformation,
                        onDataChange,
                        tooltip,
                        classNames,
                        key: fieldName,
                        maxLength,
                        maskOnBlur,
                        error: formDataContext.formErrors[fieldName],
                        validator,
                        disableCopyPaste,
                    });
                })}
        </div>
    );
};

export default FormDisbursementSection;
