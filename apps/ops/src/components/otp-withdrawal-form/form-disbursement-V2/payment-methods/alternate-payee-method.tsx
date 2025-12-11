import { useContext } from 'react';

import { FieldSize, FieldType } from '@deps/components/fields/field';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

import AddressEntry from '../../address-entry';
import BankCheckboxV2 from '../bank-checkbox-v2';
import BankTextFieldV2 from '../bank-text-field-v2';

interface AlternatePayeeMethodProps {
    config: any;
    isFormStateReadOnly: boolean;
    defaultDisbursementInfo: any;
    setDefaultDisbursementInfo: (value: any) => void;
    classNames?: string;
}

const AlternatePayeeMethod = ({
    config,
    isFormStateReadOnly,
    defaultDisbursementInfo,
    setDefaultDisbursementInfo,
    classNames,
}: AlternatePayeeMethodProps) => {
    const { bankDetails, setFormDisbursement } = useContext(FormDataContext);

    const handleTextChange = (value: any, fieldName: string) => {
        setFormDisbursement((pv: any) => ({
            ...pv,
            payee: {
                ...pv.payee,
                [fieldName]: ['fboDetails', 'contractNumber', 'name'].includes(
                    fieldName
                )
                    ? { text: value?.toUpperCase() }
                    : { text: value },
            },
        }));

        setDefaultDisbursementInfo((pv: any) => ({
            ...pv,
            [bankDetails?.paymentMethod as string]: {
                ...pv[bankDetails?.paymentMethod as string],
                payee: {
                    ...pv[bankDetails?.paymentMethod as string]?.payee,
                    [fieldName]: [
                        'fboDetails',
                        'contractNumber',
                        'name',
                    ].includes(fieldName)
                        ? { text: value?.toUpperCase() }
                        : { text: value },
                },
            },
        }));
    };

    const handleAddressChange = (val: any) => {
        setFormDisbursement((pv: any) => ({
            ...pv,
            payee: {
                ...pv.brokerage,
                address: val,
            },
        }));

        setDefaultDisbursementInfo((pv: any) => ({
            ...pv,
            [bankDetails?.paymentMethod as string]: {
                ...pv[bankDetails?.paymentMethod as string],
                payee: {
                    ...pv[bankDetails?.paymentMethod as string]?.payee,
                    address: val,
                },
            },
        }));
    };

    const renderField = (field: any) => {
        switch (field.fieldType) {
            case 'text':
                return (
                    <BankTextFieldV2
                        fieldLabel={field.fieldLabel}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        data-testid={field.fieldName}
                        fieldName={field.fieldName}
                        onDataChange={handleTextChange}
                        isFormStateReadOnly={isFormStateReadOnly}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        value={
                            defaultDisbursementInfo.payee?.[field.fieldName]
                                ?.text ?? ''
                        }
                    />
                );
            case 'address':
                return (
                    <div
                        key={field.fieldName}
                        className={classNames || 'col-span-4'}
                    >
                        <AddressEntry
                            isFormStateReadOnly={isFormStateReadOnly}
                            onDataChange={handleAddressChange}
                            initialAddress={defaultDisbursementInfo?.address}
                            isPayeeAddress={true}
                            isAddressLine2Required={
                                field.isAddressLine2Required
                            }
                        />
                    </div>
                );
            case 'checkbox':
                return (
                    <div key={field.fieldName}>
                        <BankCheckboxV2
                            fieldLabel={field.fieldLabel}
                            fieldName={field.fieldName}
                            classNames={classNames}
                            isFormStateReadOnly={isFormStateReadOnly}
                            onDataChange={handleTextChange}
                            value={
                                defaultDisbursementInfo.brokerage?.[
                                    field.fieldName
                                ]
                            }
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <form className="grid grid-cols-3 gap-4 mt-4">
            {config?.fields.map((field: any) => (
                <div key={field.fieldName} className={`${field.classNames}`}>
                    {renderField(field)}
                </div>
            ))}
        </form>
    );
};

export default AlternatePayeeMethod;
