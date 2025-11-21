import { FieldData, FieldSize, Radio } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Label, { LabelVariant } from '@deps/components/label/label';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { CarrierCode } from '@deps/constants/policy';
import AddressDataCard from '@deps/containers/small-data-card/address-data/address-data';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { usePaymentFormsQuery } from '@deps/hooks/usePaymentFormsQuery';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-medium.svg';
import {
    PaymentForm,
    ArrangementType,
    Status,
    SystematicProgram,
} from '@zinnia/api-types/types/sor';

import { BankDetailsCards } from './bank-details-cards';
import { PaymentMethodType, PaymentStepProps } from './types';
import { usePaymentMethods } from './use-bank-details';
import WorkflowCard from '../workflow-card/workflow-card';

const PaymentStepMoneyOut = ({
    parentPage,
    policy,
    setState,
    state,
    subtitle,
    validateTransaction,
    transactionName,
}: PaymentStepProps) => {
    const { t } = useTranslation();
    const { goToNext } = useWorkflow();
    const [formError, setFormError] = useState(false);

    const { policyNumber, product, systematicPrograms } = policy;
    const customFarmerCheck = policy.carrierId === CarrierCode.Farmers;

    const {
        paymentBankId,
        payeePartyId,
        paymentForm,
        paymentAddressId: currentPaymentAddressId,
        fboFfc,
        arrangementType = ArrangementType.PAYMENT,
    } = state;

    const party = policy?.parties?.find(
        (party) => party.partyId === payeePartyId
    );

    const paymentProgram = systematicPrograms?.find(
        (program) =>
            program.arrangementType === arrangementType &&
            program.status === Status.ACTIVE
    );

    const {
        data: bankDetails,
        isLoading: bankDetailsLoading,
        isError: bankDetailsError,
    } = usePaymentMethods({
        state,
        policy,
    });
    const {
        data: PaymentForms,
        error,
        isLoading,
    } = usePaymentFormsQuery({
        planCode: product?.planCode,
        policyNumber,
        payeePartyId,
        carrierId: policy?.carrierId,
        transactionName,
    });

    const addresses = useMemo(() => {
        const currentAddresses = party?.addresses?.filter((address: any) => {
            return !isEndDated(address?.endDate);
        });
        return currentAddresses?.sort((a, b) => {
            if (dayjs(b.startDate).isSame(a.startDate)) {
                return a.addressId?.localeCompare(b.addressId || '') || 1;
            }

            return dayjs(b.startDate).isBefore(a.startDate) ? 1 : -1;
        });
    }, [party?.addresses]);

    const handleContinue = async () => {
        if (paymentForm === PaymentForm.CHECK) {
            if (!currentPaymentAddressId || currentPaymentAddressId === '') {
                setFormError(true);
                return;
            }
        } else {
            if (!paymentBankId?.length) {
                setFormError(true);
                return;
            }
        }

        if (!validateTransaction) {
            goToNext();

            return;
        }

        const response = await validateTransaction();

        setState((prevState) => ({
            ...prevState,
            validationResponse: response,
        }));

        goToNext();
    };

    const handleAddressSelection = useCallback(
        ({ paymentAddress, paymentAddressId }: PaymentMethodType) => {
            if (paymentAddressId === currentPaymentAddressId) {
                setState((prevState) => ({
                    ...prevState,
                    paymentAddress: undefined,
                    paymentAddressId: undefined,
                }));
            } else {
                setState((prevState) => ({
                    ...prevState,
                    paymentAddress,
                    paymentAddressId,
                }));
                setFormError(false);
            }
        },
        [currentPaymentAddressId, setState, setFormError]
    );

    const handleBankSelection = ({ paymentBankId }: PaymentMethodType) => {
        const parties:
            | SystematicProgram['parties']
            | SystematicProgram['party']
            | undefined = paymentProgram?.parties || paymentProgram?.party;
        const paymentParty = parties?.[0];
        const selectedBank = bankDetails
            ? bankDetails?.find((b) => b.bankId === paymentBankId) ||
              bankDetails[0]
            : {};

        // if clicked on the same bank
        if (paymentBankId === state.paymentBankId) {
            // clear the payment details
            setState((prevState) => ({
                ...prevState,
                paymentAccountNumber: undefined,
                paymentBranchName: undefined,
                paymentBankId: undefined,
                paymentForm: undefined,
            }));
        } else {
            const newState: PaymentMethodType = {
                paymentAccountNumber: selectedBank.accountNumber,
                paymentBranchName: selectedBank.branchName,
                paymentBankId: selectedBank.bankId,
            };

            if (paymentParty && 'addressId' in paymentParty) {
                const selectedAddress =
                    paymentParty.paymentForm === PaymentForm.CHECK && addresses
                        ? addresses?.find(
                              (a) => a.addressId === paymentParty.addressId
                          ) || addresses[0]
                        : {};

                newState.fboFfc = paymentParty.forBenefitOfOrForFurtherCredit;
                newState.paymentAddressId = selectedAddress?.addressId;
                newState.paymentAddress = selectedAddress;
                newState.paymentForm = paymentParty.paymentForm;
            }

            setFormError(false);

            setState((prevState) => ({
                ...prevState,
                ...newState,
            }));
        }
    };

    const handleFboFfcChange = ({
        target: { value: fboFfcValue },
    }: ChangeEvent<HTMLInputElement>) => {
        setState((prevState) => ({ ...prevState, fboFfc: fboFfcValue }));
    };

    const handlePaymentMethodChange = (newPaymentMethod: PaymentForm) => {
        setFormError(false);
        setState((prevState) => ({
            ...prevState,
            paymentForm: newPaymentMethod,
            paymentAddress: undefined,
            paymentAddressId: undefined,
            paymentAccountNumber: undefined,
            paymentBranchName: undefined,
            paymentBankId: undefined,
            fboFfc: undefined,
        }));
    };

    const paymentMethodOptions = useMemo(() => {
        const defaultOptions = [
            PaymentForm.ACH,
            PaymentForm.CHECK,
            PaymentForm.WIRE,
        ];
        const paymentFormLabels: Record<string, string> = {
            ACH: t('workflows.paymentStep.paymentMethod.ach'),
            CHECK: t('workflows.paymentStep.paymentMethod.check'),
            WIRE: t('workflows.paymentStep.paymentMethod.wire'),
        };

        const forms: string[] = !customFarmerCheck
            ? defaultOptions
            : PaymentForms?.supportedConfigurations?.paymentForms ??
              (isLoading ? [] : defaultOptions);

        return forms.map((form: string) => {
            const label = paymentFormLabels[form] || form;
            return {
                ariaLabel: label,
                label,
                value: PaymentForm[form as keyof typeof PaymentForm] ?? form,
            };
        });
    }, [
        t,
        PaymentForms?.supportedConfigurations?.paymentForms,
        isLoading,
        customFarmerCheck,
    ]);

    const mainCta = {
        text: t('general.continue'),
        onClick: handleContinue,
    };

    const secondaryCta = {
        text: t('general.leaveTransaction'),
        href: `/policies/${product?.planCode}/${policyNumber}/policy/${parentPage}`,
    };

    const stopLoading = formError;

    return (
        <WorkflowCard
            title={t('workflows.paymentStep.heading')}
            footerContent={
                <TransactionCta
                    mainCta={mainCta}
                    secondaryCta={secondaryCta}
                    stopLoading={stopLoading}
                />
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <Typography variant={TypographyVariant.LabelLg}>
                        {subtitle}
                    </Typography>

                    <div className="flex flex-col gap-4">
                        <Typography variant={TypographyVariant.LabelLg}>
                            {t('workflows.paymentStep.moneyOutLabel')}
                        </Typography>
                        <Radio
                            id="payment-method-radio"
                            groupLabel={
                                t(
                                    'workflows.paymentStep.paymentMethod.label'
                                ) as string
                            }
                            onValueChange={(val) =>
                                handlePaymentMethodChange(val as PaymentForm)
                            }
                            options={paymentMethodOptions}
                            value={paymentForm}
                        />
                        {error && <>Failed to fetch payment forms</>}
                        {paymentForm && (
                            <div className="flex flex-col gap-4">
                                <Label
                                    label={
                                        paymentForm === PaymentForm.CHECK
                                            ? t(
                                                  'workflows.paymentStep.addressDetailsLabel'
                                              )
                                            : t(
                                                  'workflows.paymentStep.fieldLabel'
                                              )
                                    }
                                    variant={LabelVariant.FieldLabel}
                                />
                                {paymentForm === PaymentForm.CHECK ? (
                                    <div className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-3">
                                        {addresses?.map((address) => (
                                            <AddressDataCard
                                                key={address.addressId}
                                                address={address}
                                                accessibilityClickText={t(
                                                    'ariaLabel.select'
                                                )}
                                                selectedId={
                                                    currentPaymentAddressId
                                                }
                                                onCardClick={() => {
                                                    handleAddressSelection({
                                                        paymentAddress: address,
                                                        paymentAddressId:
                                                            address.addressId,
                                                    });
                                                }}
                                                // TODO MG: translate
                                                addressStatus={
                                                    address.addressType
                                                }
                                            />
                                        ))}
                                        <div
                                            aria-hidden
                                            className="flex cursor-not-allowed items-center justify-center gap-1 rounded-md border-2 border-gray-200 bg-gray-100 px-4 py-8 text-gray-300"
                                        >
                                            <AddIcon height={24} width={24} />
                                            <p className="font-primary text-base font-semibold">
                                                {t(
                                                    'workflows.paymentStep.addAddress'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <BankDetailsCards
                                        bankDetails={bankDetails}
                                        bankDetailsError={bankDetailsError}
                                        bankDetailsLoading={bankDetailsLoading}
                                        paymentBankId={paymentBankId}
                                        dataTestid="payment-methods-money-out"
                                        handleSelection={handleBankSelection}
                                        t={t}
                                    />
                                )}
                                <div className="flex w-1/2">
                                    <FieldData
                                        label={
                                            <Label
                                                variant={
                                                    LabelVariant.FieldLabel
                                                }
                                                label={t(
                                                    'workflows.paymentStep.paymentMethod.fboFfc.label'
                                                )}
                                                tooltipTitle={t(
                                                    'workflows.paymentStep.paymentMethod.fboFfc.tooltipTitle'
                                                )}
                                                tooltipBody={t(
                                                    'workflows.paymentStep.paymentMethod.fboFfc.tooltipBody'
                                                )}
                                                sentenceCase={false}
                                                className="mb-1"
                                            />
                                        }
                                        fieldSize={FieldSize.Small}
                                        onChange={handleFboFfcChange}
                                        value={fboFfc ?? ''}
                                        maxLength={100}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {formError && (
                    <AssistiveText
                        className="col-span-full"
                        text={
                            !paymentForm
                                ? t('workflows.paymentStep.paymentMethodError')
                                : paymentForm === PaymentForm.CHECK
                                ? t('workflows.paymentStep.addressError')
                                : t('workflows.paymentStep.bankError')
                        }
                        variant={AssistiveTextVariant.Error}
                    />
                )}
            </div>
        </WorkflowCard>
    );
};

export default PaymentStepMoneyOut;
