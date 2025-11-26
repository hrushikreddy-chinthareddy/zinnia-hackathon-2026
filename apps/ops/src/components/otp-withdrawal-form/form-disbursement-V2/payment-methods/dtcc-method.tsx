import { useContext } from 'react';

import { FieldSize, FieldType } from '@deps/components/fields/field';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

import BankTextFieldV2 from '../bank-text-field-v2';
import DtccSelectParticipantId from '../dtcc-select-participant-id';

interface CheckMethodProps {
    config: any;
    isFormStateReadOnly: boolean;
    defaultDisbursementInfo: any;
    setDefaultDisbursementInfo: (value: any) => void;
    classNames?: string;
}

const DtccMethod = ({
    config,
    isFormStateReadOnly,
    defaultDisbursementInfo,
    setDefaultDisbursementInfo,
}: CheckMethodProps) => {
    const { bankDetails, setFormDisbursement } = useContext(FormDataContext);

    const handleTextChange = (value: any, fieldName: string) => {
        setFormDisbursement((pv: any) => ({
            ...pv,
            payee: {
                ...pv.payee,
                [fieldName]: { text: value },
            },
        }));

        setDefaultDisbursementInfo((pv: any) => ({
            ...pv,
            [bankDetails?.paymentMethod as string]: {
                ...pv[bankDetails?.paymentMethod as string],
                payee: {
                    ...pv[bankDetails?.paymentMethod as string]?.payee,
                    [fieldName]: { text: value },
                },
            },
        }));
    };

    const handleParticipantIdChange = (val: any) => {
        setFormDisbursement((pv: any) => ({
            ...pv,
            participantId: { text: val },
        }));
        setDefaultDisbursementInfo((pv: any) => ({
            ...pv,
            [bankDetails?.paymentMethod as string]: {
                ...pv[bankDetails?.paymentMethod as string],
                participantId: { text: val },
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
                        isBankingField={false}
                        error={field.error}
                        validator={field.validator}
                    />
                );

            case 'select':
                return (
                    <DtccSelectParticipantId
                        fieldLabel={field.fieldLabel}
                        fieldName={field.fieldName}
                        onDataChange={handleParticipantIdChange}
                        isFormStateReadOnly={isFormStateReadOnly}
                        value={
                            defaultDisbursementInfo.participantId?.text ?? ''
                        }
                    />
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

export default DtccMethod;
