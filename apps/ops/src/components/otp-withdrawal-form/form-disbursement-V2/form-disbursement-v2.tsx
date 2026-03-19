import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useMemo, useState } from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';
import { defaultBankUpdateValues } from '@deps/components/ssw-edit/bank-update/bank-update.helpers';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    getBankingDetails,
    getBankingDetailsLC,
} from '@deps/helpers/bank.helpers';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import {
    FormDisbursement,
    FormDisbursement as FormDisbursementType,
    PaymentMailType,
    PaymentMethod,
} from '@deps/models/case/withdrawal/case';

import FormDisbursementSectionV2 from './form-disbursement-section-v2';
import {
    BankEntry,
    BankInFile,
    BankingDetails,
    DisbursementOptions,
    SelectedBanking,
} from './form-disbursement.types';
import { ConsentAvailable } from '../form-disbursement/form-disbursement-parts/consent-available';
import { BankInfoType } from '../form-disbursement/form-disbursement-parts/masked-account-toggle';
import { getDefaultFormDisbursementValues } from '../form-disbursement/form-disbursement.helpers';

export const FormDisbursementSelections = {
    ...PaymentMethod,
    ...PaymentMailType,
    SimpleBrokerage: 'SimpleBrokerage',
};
export type FormDisbursementSelections = typeof FormDisbursementSelections;

type FormDisbursementProps = {
    options: DisbursementOptions;
    title?: string;
    isFormStateReadOnly?: boolean;
    defaultValue?: PaymentMethod | PaymentMailType;
    isBankUpdateForm?: boolean;
};

export default function FormDisbursementV2({
    options,
    title,
    isFormStateReadOnly = false,
    isBankUpdateForm = false,
}: FormDisbursementProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.distributionMethod',
    });
    const {
        formDisbursement,
        parties,
        partyRoles,
        setFormErrors,
        setFormDisbursement,
        isLC,
        bankDetails,
        setBankDetails,
        initialForm,
    } = useContext(FormDataContext);

    const [defaultDisbursementInfo, setDefaultDisbursementInfo] = useState<any>(
        {}
    );

    const selectedPaymentOption = !isBankUpdateForm
        ? options?.find((val) => val.value === bankDetails?.paymentMethod)
        : undefined;

    const selectedBankInfoOption = formDisbursement?.bank?.[0]?.isDirectDeposit
        ?.text
        ? BankInfoType.Full
        : BankInfoType.Masked;

    let bankingInFile: any = [];

    bankingInFile = useMemo(() => {
        return isLC
            ? getBankingDetailsLC(parties as LifeCadParty[])
            : getBankingDetails(parties as LifeCadParty[]);
    }, [isLC, parties, partyRoles]);

    const DEFAULT_DISBURSEMENT_DATA: any = getDefaultFormDisbursementValues();
    const existingBankDetails = bankingInFile?.length > 0;

    useEffect(() => {
        if (isFormStateReadOnly) {
            setDefaultDisbursementInfo({
                [formDisbursement?.paymentMethod?.text as string]:
                    formDisbursement,
            });

            setBankDetails &&
                setBankDetails((pv) => ({
                    ...pv,
                    paymentMethod: formDisbursement?.paymentMethod
                        ?.text as PaymentMethod,
                }));
        }
        if (isBankUpdateForm) {
            const formUpdateData =
                initialForm?.data?.formRequest?.formUpdateData;
            const prefillBankUpdateValues =
                isFormStateReadOnly && formUpdateData
                    ? {
                          ...defaultBankUpdateValues,
                          bank:
                              formUpdateData.bank ??
                              defaultBankUpdateValues.bank,
                          bankVerification:
                              formUpdateData.bankVerification ??
                              defaultBankUpdateValues.bankVerification,
                      }
                    : defaultBankUpdateValues;

            setDefaultDisbursementInfo({
                [PaymentMethod.EFT]: prefillBankUpdateValues,
            });
            setFormDisbursement(prefillBankUpdateValues as FormDisbursement);
            setBankDetails &&
                setBankDetails((pv) => ({
                    ...pv,
                    paymentMethod: PaymentMethod.EFT as PaymentMethod,
                }));
        }
    }, []);

    function checkEftLastSelection(
        newBankDetails: BankEntry,
        existingBankDetails?: BankInFile
    ) {
        if (
            newBankDetails?.accountNumber !==
                existingBankDetails?.AccountNumber &&
            newBankDetails?.routingNumber !==
                existingBankDetails?.RoutingNumber &&
            newBankDetails?.bankName !== existingBankDetails?.BankName
        ) {
            return {
                selectedBanking: SelectedBanking.New,
                isBankSelected: false,
            };
        } else {
            return {
                selectedBanking: SelectedBanking.OnFile,
                isBankSelected: true,
            };
        }
    }

    const handleButtonGrpChange = (value: PaymentMailType | PaymentMethod) => {
        setFormErrors({});
        const selectedPaymentOption = options.find(
            (val) => val?.value === value
        );
        if (value === PaymentMethod.EFT) {
            if (defaultDisbursementInfo[PaymentMethod.EFT]) {
                const bankValues =
                    defaultDisbursementInfo[PaymentMethod.EFT]?.bank?.[0];
                const existingBankValue = bankDetails?.bankingInFile?.[0];
                const { selectedBanking, isBankSelected } =
                    checkEftLastSelection(bankValues, existingBankValue);
                setBankDetails &&
                    setBankDetails((pv) => ({
                        ...pv,
                        isBankSelected: isBankSelected,
                        paymentMethod: value as PaymentMethod,
                        selectedBanking: selectedBanking,
                    }));
                if (selectedBanking !== SelectedBanking.New) {
                    setFormDisbursement((pv: any) => {
                        return {
                            ...pv,
                            ...selectedPaymentOption?.generatePayloadFromSelection(
                                DEFAULT_DISBURSEMENT_DATA,
                                bankingInFile
                            ),
                        };
                    });
                } else {
                    setFormDisbursement(() => {
                        return {
                            ...defaultDisbursementInfo[PaymentMethod.EFT],
                        };
                    });
                }

                return;
            }
        }
        if (existingBankDetails && value === PaymentMethod.EFT) {
            setBankDetails &&
                setBankDetails((pv) => ({
                    ...pv,
                    isBankSelected: true,
                    paymentMethod: value as PaymentMethod,
                    bankingInFile: bankingInFile as any,
                    selectedBanking: SelectedBanking.OnFile,
                }));
        } else {
            setBankDetails &&
                setBankDetails((pv: BankingDetails) => ({
                    ...pv,
                    isBankSelected: false,
                    selectedBanking: SelectedBanking.New,
                    paymentMethod: value as PaymentMethod,
                }));
        }
        setFormErrors({});

        if (selectedPaymentOption?.generatePayloadFromSelection) {
            setFormDisbursement((pv: FormDisbursementType) => {
                return {
                    ...pv,
                    ...selectedPaymentOption.generatePayloadFromSelection(
                        DEFAULT_DISBURSEMENT_DATA,
                        bankingInFile
                    ),
                };
            });

            if (!defaultDisbursementInfo[value]) {
                setDefaultDisbursementInfo((pv: any) => {
                    return {
                        ...pv,
                        [value]: {
                            ...selectedPaymentOption.generatePayloadFromSelection(
                                DEFAULT_DISBURSEMENT_DATA,
                                bankingInFile
                            ),
                        },
                    };
                });
            }
        }
    };

    const renderDisbursementInformation = () => {
        return (
            <FormDisbursementSectionV2
                fieldConfig={
                    isBankUpdateForm ? options : (selectedPaymentOption as any)
                }
                defaultDisbursementInfo={
                    defaultDisbursementInfo[
                        bankDetails?.paymentMethod as string
                    ] ?? {}
                }
                setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                isFormStateReadOnly={isFormStateReadOnly}
            />
        );
    };

    const derivedPaymentMethod =
        bankDetails?.paymentMethod ||
        formDisbursement?.paymentMethod?.text ||
        '';

    if (isBankUpdateForm) {
        return <>{renderDisbursementInformation()}</>;
    }

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3}>
                {title || t('distributionMethod')}
            </Typography>
            <div className="mt-4">
                <ButtonGrp
                    activeValue={derivedPaymentMethod}
                    groupLabel={t('paymentMethod')}
                    toggle={(val) => {
                        handleButtonGrpChange(
                            val as PaymentMailType | PaymentMethod
                        );
                    }}
                    labels={options}
                    disabled={isFormStateReadOnly}
                    overrideWrapperClassName="flex overflow-x-auto no-scrollbar"
                />
                {renderDisbursementInformation()}
                {formDisbursement?.disbursmentConsent?.isConsent?.text &&
                selectedPaymentOption?.consentAvailableConfig &&
                selectedBankInfoOption !== BankInfoType.Masked ? (
                    <ConsentAvailable
                        signatureFields={
                            selectedPaymentOption?.consentAvailableConfig
                        }
                        isFormStateReadOnly={isFormStateReadOnly}
                    />
                ) : null}
            </div>
        </CardContainer>
    );
}
