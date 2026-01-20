import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useMemo, useState } from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    getBankingDetails,
    getBankingDetailsLC,
    isExistingBank,
    isExistingBankLC,
} from '@deps/helpers/bank.helpers';
import { LifeCadBanking, LifeCadParty } from '@deps/models/case/lifecad-party';
import {
    FormDisbursement as FormDisbursementType,
    PaymentMailType,
    PaymentMethod,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementConfig,
    DisbursementParts,
    PaymentMethodAdditionalOptions,
    PaymentMethodOption,
} from '@deps/models/case/withdrawal/disbursement-types';
import { BankAccountBase } from '@zinnia/api-types/types/sor';

import AutofillAccountToggle from './form-disbursement-parts/autofill-account-toggle';
import { ConsentAvailable } from './form-disbursement-parts/consent-available';
import MaskedAccountNumberToggle, {
    BankInfoType,
} from './form-disbursement-parts/masked-account-toggle';
import { SelectedBankContext } from './form-disbursement-parts/pre-populate-banking-details';
import FormDisbursementSection from './form-disbursement-section';
import { BankingFields } from './form-disbursement.helpers';
import { IFormDisbursement } from '../form-disbursement-V2/form-disbursement.types';

// Selection options for payment method
export const FormDisbursementSelections = {
    ...PaymentMethod,
    ...PaymentMailType,
    SimpleBrokerage: 'SimpleBrokerage',
};
export type FormDisbursementSelections = typeof FormDisbursementSelections;

const getSelected = (
    formDisbursement: FormDisbursementType | IFormDisbursement
): PaymentMailType | PaymentMethod | null | undefined | string => {
    const paymentMethod = formDisbursement?.paymentMethod?.text;
    const paymentMailType = formDisbursement?.paymentMailType?.text;
    return paymentMethod === PaymentMailType.Check &&
        paymentMailType === PaymentMailType.ExpressCheck
        ? FormDisbursementSelections.ExpressCheck
        : paymentMethod;
};

export const getBankFieldsList = (
    fields: DisbursementConfig[] | null,
    existingBankSelected: boolean,
    isFormStateReadOnly: boolean
) => {
    let finalBankList = fields;

    if (isFormStateReadOnly || existingBankSelected) {
        finalBankList =
            fields &&
            fields?.filter(
                (field) =>
                    ![
                        BankingFields.ReEnterAccountNumber,
                        BankingFields.ReEnterBankRoutingNumber,
                    ].includes(field.fieldName)
            );
    }

    return finalBankList;
};

export type FormDisbursementSelectionsType =
    | FormDisbursementSelections[keyof FormDisbursementSelections]
    | null
    | undefined;

type FormDisbursementProps = {
    options: PaymentMethodOption[];
    title?: string;
    selectionIdentifier?: (
        val: FormDisbursementType | IFormDisbursement
    ) => FormDisbursementSelectionsType;
    isFormStateReadOnly?: boolean;
    defaultValue?: PaymentMethod | PaymentMailType;
};

export enum DisbursementToggleType {
    MaskedInfoToggle = 'MaskedInfoToggle',
    AutoFillInfoToggle = 'AutoFillInfoToggle',
}

export default function FormDisbursement({
    options,
    title,
    selectionIdentifier = getSelected,
    isFormStateReadOnly = false,
    defaultValue,
}: FormDisbursementProps) {
    const {
        initialForm,
        formDisbursement,
        parties,
        partyRoles,
        setFormErrors,
        setFormDisbursement,
        isLC,
    } = useContext(FormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.distributionMethod',
    });
    const [selected, setSelected] = useState<any>(
        selectionIdentifier(formDisbursement) || defaultValue || null
    );
    const [supplementaryFields, setSupplementaryFields] = useState<
        DisbursementConfig[] | null
    >(null);
    const [additionalOptions, setAdditionalOptions] =
        useState<PaymentMethodAdditionalOptions | null>(null);
    const [disbursementInformation, setDisbursementInformation] =
        useState<DisbursementParts>(DEFAULT_DISBURSEMENT_UPDATE);
    const [isBankSelected, setBankSelected] = useState(false);
    const selectedOption = options.find((val) => val.value === selected);
    const selectedBankInfoOption = disbursementInformation?.isDirectDeposit
        ? BankInfoType.Full
        : BankInfoType.Masked;
    const bankingDetails = useMemo(() => {
        return isLC
            ? getBankingDetailsLC(parties as LifeCadParty[])
            : getBankingDetails(parties as LifeCadParty[]);
    }, [isLC, parties, partyRoles]);

    const existingBankSelected = isLC
        ? isExistingBankLC(
              bankingDetails as LifeCadBanking[],
              formDisbursement?.bank?.[0]?.bankName || ''
          )
        : isExistingBank(
              bankingDetails as BankAccountBase[],
              formDisbursement?.bank?.[0]?.bankName || ''
          );

    useEffect(() => {
        selected &&
            setDisbursementOption(selected as PaymentMailType | PaymentMethod);
    }, []);

    useEffect(() => {
        const selectedOption = options.find((val) => val.value === selected);
        if (selectedOption) {
            // remove re-enter fields in case of completed form status/form state is readonly
            setSupplementaryFields(
                getBankFieldsList(
                    selectedOption?.fields,
                    existingBankSelected,
                    isFormStateReadOnly
                )
            );
        }
    }, [isFormStateReadOnly, existingBankSelected, options, selected]);

    const setDisbursementOption = (
        selected: PaymentMailType | PaymentMethod
    ) => {
        setSelected(selected);

        setBankSelected(false);
        setFormErrors({});

        const selectedOption = options.find((val) => val.value === selected);
        if (selectedOption) {
            setSupplementaryFields(
                getBankFieldsList(
                    selectedOption?.fields,
                    existingBankSelected,
                    isFormStateReadOnly
                )
            );
            const additionalOptions = selectedOption.additionalOptions;
            setDisbursementInformation(
                selectedOption.getDefaultPayload(
                    initialForm?.data?.formRequest?.formDisbursement
                )
            );
            setAdditionalOptions(additionalOptions ?? null);
        }
    };

    useEffect(() => {
        const selectedOption = options.find((val) => val.value === selected);

        if (selectedOption?.generatePayloadFromSelection) {
            setFormDisbursement((oldVal) => {
                return {
                    ...oldVal,
                    ...selectedOption.generatePayloadFromSelection(
                        disbursementInformation
                    ),
                };
            });
        }
    }, [selected, disbursementInformation]);

    const getDisbursementSection = (isFormDisabled: boolean = false) => {
        return (
            <SelectedBankContext.Provider
                value={{ isBankSelected, setBankSelected }}
            >
                <FormDisbursementSection
                    fields={supplementaryFields}
                    disbursementInformation={disbursementInformation}
                    onDataChange={setDisbursementInformation}
                    isFormStateReadOnly={isFormDisabled || isFormStateReadOnly}
                    key={selected}
                />
            </SelectedBankContext.Provider>
        );
    };

    const renderDisbursementInformation = () => {
        switch (additionalOptions?.disbursementToggleType) {
            case DisbursementToggleType.MaskedInfoToggle: {
                return (
                    <MaskedAccountNumberToggle
                        selectedBankInfoOption={selectedBankInfoOption}
                        maskedAccountNumber={
                            disbursementInformation.maskedAccountNumber
                        }
                        setDisbursementInformation={setDisbursementInformation}
                        disabled={isFormStateReadOnly}
                    >
                        {supplementaryFields && getDisbursementSection()}
                    </MaskedAccountNumberToggle>
                );
            }
            case DisbursementToggleType.AutoFillInfoToggle:
                return (
                    <SelectedBankContext.Provider
                        value={{ isBankSelected, setBankSelected }}
                    >
                        <AutofillAccountToggle
                            toggleOptions={
                                additionalOptions?.toggleOptions ?? []
                            }
                            preFillBankInfo={disbursementInformation}
                            supplementaryFields={supplementaryFields}
                            initialFormDisbursement={disbursementInformation}
                            setDisbursementInformation={
                                setDisbursementInformation
                            }
                            isFormStateReadOnly={isFormStateReadOnly}
                            carrier={initialForm?.carrier}
                        ></AutofillAccountToggle>
                    </SelectedBankContext.Provider>
                );

            default:
                return supplementaryFields && getDisbursementSection();
        }
    };

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3}>
                {title || t('distributionMethod')}
            </Typography>
            <div className="mt-4">
                <ButtonGrp
                    activeValue={selected as string}
                    groupLabel={t('paymentMethod')}
                    toggle={(val) => {
                        setDisbursementOption(
                            val as PaymentMailType | PaymentMethod
                        );
                    }}
                    labels={options}
                    disabled={isFormStateReadOnly}
                    overrideWrapperClassName="flex overflow-x-auto no-scrollbar"
                />
                {renderDisbursementInformation()}
                {formDisbursement?.disbursmentConsent?.isConsent?.text &&
                selectedOption?.consentAvailableConfig &&
                selectedBankInfoOption !== BankInfoType.Masked ? (
                    <ConsentAvailable
                        signatureFields={selectedOption?.consentAvailableConfig}
                        isFormStateReadOnly={isFormStateReadOnly}
                    />
                ) : null}
            </div>
        </CardContainer>
    );
}
