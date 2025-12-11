import * as React from 'react';
import { useContext, useEffect, useState } from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementConfig,
    DisbursementParts,
} from '@deps/models/case/withdrawal/disbursement-types';

import FormDisbursementContainer from '../form-disbursement-section';
import {
    BankDetailsInputMethod,
    getPreselectedWireOption,
    getUpdatedData,
    SUPPLEMENTARY_FIELDS_FILTERS,
} from '../form-disbursement.helpers';

type AutofillAccountToggleProps = {
    initialFormDisbursement: DisbursementParts;
    toggleOptions: Array<{ label: string; value: string }>;
    preFillBankInfo: DisbursementParts;
    defaultFillMethod?: BankDetailsInputMethod;
    supplementaryFields: DisbursementConfig[] | null;
    setDisbursementInformation: React.Dispatch<
        React.SetStateAction<DisbursementParts>
    >;
    isFormStateReadOnly: boolean;
    carrier: string;
};

const AutofillAccountToggle = ({
    toggleOptions,
    preFillBankInfo,
    supplementaryFields,
    setDisbursementInformation,
    initialFormDisbursement,
    isFormStateReadOnly,
    carrier,
}: AutofillAccountToggleProps) => {
    const { setBankDetails } = useContext(FormDataContext);
    const [fillType, setFillType] = useState<BankDetailsInputMethod>(
        getPreselectedWireOption(preFillBankInfo?.payeeName || '')
    );
    const supplementaryFieldsFiltered = supplementaryFields?.filter(
        (item: DisbursementConfig) =>
            SUPPLEMENTARY_FIELDS_FILTERS.includes(item.fieldName)
    );
    const shouldRenderBankInfo =
        supplementaryFieldsFiltered && supplementaryFieldsFiltered.length > 0;
    useEffect(() => {
        if (fillType === BankDetailsInputMethod.Auto) {
            setBankDetails &&
                setBankDetails((pv) => ({ ...pv, isBankSelected: true }));
            const updatedData = getUpdatedData(
                preFillBankInfo,
                fillType,
                carrier
            );
            setDisbursementInformation(updatedData);
        } else if (fillType === BankDetailsInputMethod.Envison) {
            setBankDetails &&
                setBankDetails((pv) => ({ ...pv, isBankSelected: true }));

            const updatedData = getUpdatedData(
                preFillBankInfo,
                fillType,
                carrier
            );
            setDisbursementInformation(updatedData);
        }
        if (fillType === BankDetailsInputMethod.Manual) {
            setBankDetails &&
                setBankDetails((pv) => ({ ...pv, isBankSelected: false }));

            const disbursementInformation =
                fillType === BankDetailsInputMethod.Manual &&
                isFormStateReadOnly
                    ? initialFormDisbursement
                    : DEFAULT_DISBURSEMENT_UPDATE;
            setDisbursementInformation(disbursementInformation);
        }
    }, [fillType]);

    const renderFormDisbursementContainer = () => {
        if (!shouldRenderBankInfo) return null;

        const disbursementInformation =
            fillType === BankDetailsInputMethod.Manual
                ? initialFormDisbursement
                : preFillBankInfo;

        return (
            <FormDisbursementContainer
                fields={
                    fillType === BankDetailsInputMethod.Manual
                        ? supplementaryFields
                        : supplementaryFieldsFiltered
                }
                disbursementInformation={disbursementInformation}
                onDataChange={setDisbursementInformation}
                isFormStateReadOnly={isFormStateReadOnly}
                key={fillType}
            />
        );
    };

    return (
        <>
            <ButtonGrp
                className="mt-4"
                activeValue={fillType as BankDetailsInputMethod}
                toggle={(val) => setFillType(val as BankDetailsInputMethod)}
                labels={toggleOptions}
                disabled={isFormStateReadOnly}
            />
            {renderFormDisbursementContainer()}
        </>
    );
};

export default AutofillAccountToggle;
