import * as React from 'react';
import { useContext, useEffect, useState } from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';
import { DEFAULT_DISBURSEMENT_UPDATE, DisbursementConfig, DisbursementParts } from '@deps/models/case/withdrawal/disbursement-types';

import { SelectedBankContext } from './pre-populate-banking-details';
import FormDisbursementContainer from '../form-disbursement-section';
import { BankingFields } from '../form-disbursement.helpers';

export enum BankDetailsInputMethod {
    Auto = 'auto',
    Manual = 'manual',
}

const SUPPLEMENTARY_FIELDS_FILTERS: string[] = [
    BankingFields.AccountType,
    BankingFields.PayeeName,
    BankingFields.BankName,
    BankingFields.BankRoutingNumber,
    BankingFields.AccountNumber,
    BankingFields.FboDetails,
    BankingFields.ContractNumber,
    BankingFields.Address,
];

const isBankingAutoSelected = (initialFormDisbursement: DisbursementParts, preFillBankInfo: DisbursementParts) => {
    return SUPPLEMENTARY_FIELDS_FILTERS.every(key => {
        return initialFormDisbursement[key as keyof DisbursementParts] == preFillBankInfo[key as keyof DisbursementParts];
    });
};

type AutofillAccountToggleProps = {
    initialFormDisbursement: DisbursementParts;
    toggleOptions: Array<{ label: string; value: string }>;
    selectedPaymentMethod: string | null;
    preFillBankInfo: DisbursementParts;
    defaultFillMethod: BankDetailsInputMethod;
    supplementaryFields: DisbursementConfig[] | null;
    setDisbursementInformation: React.Dispatch<React.SetStateAction<DisbursementParts>>;
    isFormStateReadOnly: boolean;
};

const AutofillAccountToggle = ({
    toggleOptions,
    defaultFillMethod,
    preFillBankInfo,
    supplementaryFields,
    setDisbursementInformation,
    initialFormDisbursement,
    isFormStateReadOnly,
}: AutofillAccountToggleProps) => {
    const { setBankSelected } = useContext(SelectedBankContext);
    const [fillType, setFillType] = useState<BankDetailsInputMethod>(defaultFillMethod || BankDetailsInputMethod.Auto);

    const supplementaryFieldsFiltered = supplementaryFields?.filter((item: DisbursementConfig) =>
        SUPPLEMENTARY_FIELDS_FILTERS.includes(item.fieldName)
    );

    useEffect(() => {
        const isAutoSelected = isBankingAutoSelected(initialFormDisbursement, preFillBankInfo);
        isAutoSelected && setBankSelected(true);
        setFillType(isAutoSelected ? BankDetailsInputMethod.Auto : BankDetailsInputMethod.Manual);
    }, [initialFormDisbursement, preFillBankInfo]);

    const shouldRenderBankInfo = supplementaryFieldsFiltered && supplementaryFieldsFiltered.length > 0;

    const setFillOption = (value: BankDetailsInputMethod) => {
        setFillType(value);
        if (value === BankDetailsInputMethod.Auto) {
            setBankSelected(true);

            setDisbursementInformation(preFillBankInfo);
        } else {
            setBankSelected(false);
            const disbursementInformation =
                value === BankDetailsInputMethod.Manual && isFormStateReadOnly ? initialFormDisbursement : DEFAULT_DISBURSEMENT_UPDATE;
            setDisbursementInformation(disbursementInformation);
        }
    };

    return (
        <>
            <ButtonGrp
                className="mt-4"
                activeValue={fillType as BankDetailsInputMethod}
                toggle={val => setFillOption(val as BankDetailsInputMethod)}
                labels={toggleOptions}
                disabled={isFormStateReadOnly}
            />
            {fillType === BankDetailsInputMethod.Auto && shouldRenderBankInfo && (
                <FormDisbursementContainer
                    fields={supplementaryFieldsFiltered}
                    disbursementInformation={preFillBankInfo}
                    onDataChange={setDisbursementInformation}
                    isFormStateReadOnly={isFormStateReadOnly}
                    key={BankDetailsInputMethod.Auto}
                />
            )}
            {fillType === BankDetailsInputMethod.Manual && shouldRenderBankInfo && (
                <FormDisbursementContainer
                    fields={supplementaryFields}
                    disbursementInformation={initialFormDisbursement}
                    onDataChange={setDisbursementInformation}
                    isFormStateReadOnly={isFormStateReadOnly}
                    key={BankDetailsInputMethod.Manual}
                />
            )}
        </>
    );
};

export default AutofillAccountToggle;
