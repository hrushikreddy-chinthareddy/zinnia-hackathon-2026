import { Dispatch, SetStateAction, useContext } from 'react';

import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { PaymentMethod } from '@deps/models/case/withdrawal/case';
import { DisbursementConfig } from '@deps/models/case/withdrawal/disbursement-types';

import AlternatePayeeMethod from './payment-methods/alternate-payee-method';
import BrokerageMethod from './payment-methods/brokerage-acc-method';
import EftMethod from './payment-methods/eft-method';
import WireMethod from './payment-methods/wire-method';

interface FormDisbursementSectionV2Props {
    defaultDisbursementInfo: Record<string, any>;
    fieldConfig: DisbursementConfig[];
    setDefaultDisbursementInfo: Dispatch<SetStateAction<Record<string, any>>>;
    isFormStateReadOnly: boolean;
}

const FormDisbursementSectionV2 = ({
    defaultDisbursementInfo,
    fieldConfig,
    setDefaultDisbursementInfo,
    isFormStateReadOnly,
}: FormDisbursementSectionV2Props) => {
    const { bankDetails, formDisbursement, setFormDisbursement } =
        useContext(FormDataContext);

    const handleBankingSectionChange = (value: any, fieldName: string) => {
        setFormDisbursement((pv) => ({
            ...pv,
            bank: [
                {
                    ...pv.bank[0],
                    [fieldName]: value,
                },
            ],
        }));

        setDefaultDisbursementInfo((pv) => ({
            ...pv,
            [bankDetails?.paymentMethod as string]: {
                ...pv[bankDetails?.paymentMethod as string],
                bank: [
                    {
                        ...pv[bankDetails?.paymentMethod as string]?.bank[0],
                        [fieldName]: value,
                    },
                ],
            },
        }));
    };

    const renderSelectedPayment = () => {
        switch (formDisbursement?.paymentMethod?.text) {
            case PaymentMethod.EFT:
                return (
                    <EftMethod
                        config={fieldConfig}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        onDataChange={handleBankingSectionChange}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                        isFormStateReadOnly={isFormStateReadOnly}
                    />
                );
            case PaymentMethod.Wire:
                return (
                    <WireMethod
                        config={fieldConfig}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        onDataChange={handleBankingSectionChange}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                        isFormStateReadOnly={isFormStateReadOnly}
                    />
                );
            case PaymentMethod.Brokerage:
                return (
                    <div>
                        <BrokerageMethod
                            config={fieldConfig}
                            defaultDisbursementInfo={defaultDisbursementInfo}
                            setDefaultDisbursementInfo={
                                setDefaultDisbursementInfo
                            }
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>
                );
            case PaymentMethod.AlternatePayeeAddress:
                return (
                    <AlternatePayeeMethod
                        config={fieldConfig}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                        isFormStateReadOnly={isFormStateReadOnly}
                    />
                );

            default:
                return null;
        }
    };

    return <>{renderSelectedPayment()}</>;
};

export default FormDisbursementSectionV2;
