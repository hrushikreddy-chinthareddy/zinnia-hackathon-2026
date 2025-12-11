import { useContext } from 'react';

import { FieldSize, FieldType } from '@deps/components/fields/field';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { FormDisbursement as FormDisbursementType } from '@deps/models/case/withdrawal/case';

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

interface EftMethodProps {
    config: any;
    isFormStateReadOnly: boolean;
    onDataChange: (fieldName: string, value: any) => void;
    defaultDisbursementInfo: any;
    setDefaultDisbursementInfo: (value: any) => void;
    classNames?: string;
}

const EftMethod = ({
    config,
    isFormStateReadOnly,
    onDataChange,
    defaultDisbursementInfo,
    setDefaultDisbursementInfo,
    classNames,
}: EftMethodProps) => {
    const { bankDetails, setBankDetails, setFormDisbursement, setFormErrors } =
        useContext(FormDataContext);

    const DEFAULT_DISBURSEMENT_DATA = getDefaultFormDisbursementValues();

    const bankOptions = [
        {
            label: 'New',
            value: OTHER_BANK_OPTION,
        },
    ];

    if (bankDetails?.bankingInFile) {
        bankOptions.unshift({
            label: 'On File',
            value: SelectedBanking.OnFile,
        });
    }

    const bankingType =
        defaultDisbursementInfo?.bankVerification?.selectedBankingType;

    const handleSelectBankChange = (val: any) => {
        if (val === SelectedBanking.OnFile) {
            setBankDetails &&
                setBankDetails((pv: any) => ({
                    ...pv,
                    isBankSelected: true,
                    selectedBanking: val,
                }));
            if (config?.generatePayloadFromSelection) {
                setFormDisbursement((pv: FormDisbursementType) => {
                    return {
                        ...pv,
                        ...config.generatePayloadFromSelection(
                            DEFAULT_DISBURSEMENT_DATA,
                            bankDetails?.bankingInFile
                        ),
                    };
                });

                setDefaultDisbursementInfo((pv: any) => {
                    return {
                        ...pv,
                        [config.value]: {
                            ...config.generatePayloadFromSelection(
                                DEFAULT_DISBURSEMENT_DATA,
                                bankDetails?.bankingInFile
                            ),
                        },
                    };
                });
            }
            setFormErrors({});
        }
        if (val === SelectedBanking.New) {
            setFormErrors({});
            setBankDetails &&
                setBankDetails((pv: any) => ({
                    ...pv,
                    isBankSelected: false,
                    selectedBanking: val,
                }));

            if (config?.generatePayloadFromSelection) {
                setFormDisbursement(() => {
                    return {
                        ...config.generatePayloadFromSelection(
                            DEFAULT_DISBURSEMENT_DATA
                        ),
                    };
                });

                setDefaultDisbursementInfo((pv: any) => {
                    return {
                        ...pv,
                        [config.value]: {
                            ...config.generatePayloadFromSelection(
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
                    selectedBankingType: val,
                    validationsMap: {},
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

    const isDisabled =
        isFormStateReadOnly ||
        (bankDetails?.isBankSelected &&
            bankDetails?.selectedBanking === SelectedBanking.OnFile);

    const renderField = (field: any) => {
        const isHidden =
            isDisabled &&
            ['reEnterBankRoutingNumber', 'reEnterAccountNumber'].includes(
                field.fieldName
            );
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
                                onDataChange={handleSelectBankChange}
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
                            isFormStateReadOnly={
                                isDisabled || (isFormStateReadOnly as boolean)
                            }
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
                        onDataChange={onDataChange}
                        isFormStateReadOnly={isDisabled as boolean}
                        classNames={isHidden ? 'invisible' : ''}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        validator={field.validator}
                        disableCopyPaste={field.disableCopyPaste}
                        error={field.error}
                        tooltip={field.tooltip}
                        maxLength={field.maxLength}
                        maskOnBlur={field.maskOnBlur}
                        value={
                            defaultDisbursementInfo?.bank?.[0]?.[
                                field.fieldName
                            ] || ''
                        }
                    />
                );
            case 'account-type':
                return (
                    <AccountTypesV2
                        fieldLabel={field.fieldLabel}
                        fieldName={field.fieldName}
                        isFormStateReadOnly={isDisabled as boolean}
                        onDataChange={onDataChange as any}
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
        <div className="mt-4 grid w-full grid-cols-3 gap-2">
            {config?.fields.map((field: any) => (
                <div key={field.fieldName} className={field.classNames}>
                    {renderField(field)}
                </div>
            ))}
        </div>
    );
};

export default EftMethod;
