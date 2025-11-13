import { useContext } from 'react';

import { FieldSize, FieldType } from '@deps/components/fields/field';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

import {
    getDefaultFormDisbursementValues,
    OTHER_BANK_OPTION,
    typeKeyMap,
} from '../../form-disbursement/form-disbursement.helpers';
import AccountTypesV2 from '../account-type-v2';
import BankTextFieldV2 from '../bank-text-field-v2';
import ChooseBank from '../choose-bank';
import ChooseBankingType from '../choose-banking-type';
import { SelectedBanking } from '../form-disbursement.types';

interface WireMethodProps {
    config: any;
    isFormStateReadOnly: boolean;
    onDataChange: (fieldName: string, value: any) => void;
    defaultDisbursementInfo: any;
    setDefaultDisbursementInfo: (value: any) => void;
    classNames?: string;
}

const WireMethod = ({
    config,
    isFormStateReadOnly,
    onDataChange,
    defaultDisbursementInfo,
    setDefaultDisbursementInfo,
    classNames,
}: WireMethodProps) => {
    const { bankDetails, setBankDetails, setFormDisbursement } =
        useContext(FormDataContext);

    const DEFAULT_DISBURSEMENT_DATA = getDefaultFormDisbursementValues();

    const bankOptions = [
        {
            label: 'New',
            value: OTHER_BANK_OPTION,
        },
    ];

    const bankingType =
        defaultDisbursementInfo?.bankVerification?.selectedBankingType;

    const handleChooseBankChange = (val: any) => {
        if (val === SelectedBanking.New) {
            setBankDetails &&
                setBankDetails((pv: any) => ({
                    ...pv,
                    isBankSelected: false,
                    selectedBanking: val,
                }));

            if (config?.generatePayloadFromSelection) {
                setFormDisbursement(() => {
                    return {
                        ...config?.generatePayloadFromSelection(
                            DEFAULT_DISBURSEMENT_DATA
                        ),
                    };
                });

                setDefaultDisbursementInfo(() => {
                    return {
                        [config.value]: {
                            ...config?.generatePayloadFromSelection(
                                DEFAULT_DISBURSEMENT_DATA
                            ),
                        },
                    };
                });
            }
        }
    };

    const handleChooseBankingType = (val: any) => {
        if (
            val === 'DIRECT_DEPOSIT_FORM' ||
            val === 'STARTER_CHECK' ||
            val === 'NO_BANK_PROOF'
        ) {
            setFormDisbursement((pv: any) => ({
                ...pv,
                bankVerification: {
                    ...pv.bankVerification,
                    selectedBankingType: val,
                    validationsMap: {
                        [val]: {
                            noAdditionalValidationRequired: true,
                        },
                    },
                },
            }));
            setDefaultDisbursementInfo((pv: any) => ({
                ...pv,
                [bankDetails?.paymentMethod as string]: {
                    ...pv[bankDetails?.paymentMethod as string],
                    bankVerification: {
                        ...pv.bankVerification,
                        selectedBankingType: val,
                        validationsMap: {
                            [val]: {
                                noAdditionalValidationRequired: true,
                            },
                        },
                    },
                },
            }));
        } else {
            setFormDisbursement((pv: any) => ({
                ...pv,
                bankVerification: {
                    ...pv.bankVerification,
                    selectedBankingType: val,
                },
            }));
            setDefaultDisbursementInfo((pv: any) => ({
                ...pv,
                [bankDetails?.paymentMethod as string]: {
                    ...pv[bankDetails?.paymentMethod as string],
                    bankVerification: {
                        ...pv.bankVerification,
                        selectedBankingType: val,
                    },
                },
            }));
        }
    };

    const handleChooseBankingRadioChange = (fieldName: string, e: any) => {
        const validationsKey: any = bankingType && typeKeyMap[bankingType];

        setFormDisbursement((pv: any) => {
            return {
                ...pv,
                bankVerification: {
                    ...pv.bankVerification,
                    selectedBankingType: bankingType,
                    validationsMap: {
                        ...pv.bankVerification?.validationsMap,
                        [validationsKey]: {
                            ...pv.bankVerification?.validationsMap?.[
                                validationsKey
                            ],
                            [fieldName]: e.target.value,
                        },
                    },
                },
            };
        });
        setDefaultDisbursementInfo((pv: any) => {
            return {
                ...pv,
                [bankDetails?.paymentMethod as string]: {
                    ...pv[bankDetails?.paymentMethod as string],
                    bankVerification: {
                        ...pv.bankVerification,
                        selectedBankingType: bankingType,
                        validationsMap: {
                            ...pv[bankDetails?.paymentMethod as string]
                                .bankVerification?.validationsMap,
                            [validationsKey]: {
                                ...pv[bankDetails?.paymentMethod as string]
                                    .bankVerification?.validationsMap?.[
                                    validationsKey
                                ],
                                [fieldName]: e.target.value,
                            },
                        },
                    },
                },
            };
        });
    };

    const renderField = (field: any) => {
        switch (field.fieldType) {
            case 'choose-the-bank':
                return (
                    <div className={`${classNames}`}>
                        {!isFormStateReadOnly && (
                            <ChooseBank
                                fieldLabel={field.fieldLabel}
                                fieldName={field.fieldName}
                                classNames={field.fieldLabel}
                                isFormStateReadOnly={isFormStateReadOnly}
                                bankOptions={bankOptions}
                                onDataChange={handleChooseBankChange}
                                selectedValue={
                                    bankDetails?.selectedBanking ?? ''
                                }
                            />
                        )}
                    </div>
                );

            case 'choose-the-banking-type':
                return (
                    <div className={classNames}>
                        <ChooseBankingType
                            defaultDisbursementInfo={defaultDisbursementInfo}
                            onDataChange={handleChooseBankingType}
                            handleRadioChange={handleChooseBankingRadioChange}
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>
                );
            case 'text':
                return (
                    <BankTextFieldV2
                        fieldLabel={field.fieldLabel}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        data-testid={field.fieldName}
                        fieldName={field.fieldName}
                        validator={field.validator}
                        onDataChange={onDataChange}
                        isFormStateReadOnly={isFormStateReadOnly}
                        maskOnBlur={field.maskOnBlur}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        value={
                            defaultDisbursementInfo?.bank?.[0]?.[
                                field.fieldName
                            ] || ''
                        }
                        error={field.error}
                    />
                );
            case 'account-type':
                return (
                    <AccountTypesV2
                        fieldLabel={field.fieldLabel}
                        fieldName={field.fieldName}
                        isFormStateReadOnly={isFormStateReadOnly}
                        onDataChange={onDataChange}
                        value={
                            defaultDisbursementInfo?.bank?.[0]?.accountType
                                .text ?? ''
                        }
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="grid grid-cols-3 gap-4 mt-4">
            {config?.fields.map((field: any) => (
                <div key={field.fieldName} className={field.classNames}>
                    {renderField(field)}
                </div>
            ))}
        </div>
    );
};

export default WireMethod;
