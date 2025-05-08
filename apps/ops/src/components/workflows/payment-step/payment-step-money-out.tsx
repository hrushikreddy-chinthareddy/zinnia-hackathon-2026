import { ArrangementType, PaymentForm, Policy } from '@zinnia/api-types/types/sor';
import { FieldData, FieldSize, Radio } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Label, { LabelVariant } from '@deps/components/label/label';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import AddressDataCard from '@deps/containers/small-data-card/address-data/address-data';
import BankDataCard from '@deps/containers/small-data-card/bank-data/bank-data';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { Address as AddressOld, BankAccount } from '@deps/models/policy/sor-policy';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-medium.svg';

import { PaymentMethodType, PaymentStepProps } from './types';
import WorkflowCard from '../workflow-card/workflow-card';

const PaymentStepMoneyOut = ({ parentPage, policy, setState, state, subtitle, validateTransaction }: PaymentStepProps) => {
    const { t } = useTranslation();
    const { goToNext } = useWorkflow();

    const { policyNumber, product, systematicPrograms } = policy as Policy;
    const {
        paymentAccountNumber: currentPaymentAccountNumber,
        payeePartyId,
        paymentForm,
        paymentAddressId: currentPaymentAddressId,
        fboFfc,
    } = state;
    const [formError, setFormError] = useState(false);

    const party = policy?.parties?.find(party => party.partyId === payeePartyId);
    const paymentProgram = systematicPrograms?.find(program => program.arrangementType === ArrangementType.PAYMENT);
    const programBankId = paymentProgram?.party?.find(party => party.partyId === payeePartyId);

    const bankDetails = useMemo(() => {
        const currentBankDetails = party?.bankDetails?.filter((bank: any) => {
            return !isEndDated(bank?.endDate);
        });

        return currentBankDetails?.sort((a, b) => {
            if (a.bankId === programBankId) return -1;
            if (b.bankId === programBankId) return 1;

            if (dayjs(b.startDate).isSame(a.startDate)) {
                return a.bankId?.localeCompare(b.bankId || '') || 1;
            }

            return dayjs(b.startDate).isBefore(a.startDate) ? 1 : -1;
        });
    }, [party?.bankDetails, programBankId]);

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
            if (!currentPaymentAccountNumber || currentPaymentAccountNumber === '') {
                setFormError(true);
                return;
            }
        }

        if (!validateTransaction) {
            goToNext();

            return;
        }

        const response = await validateTransaction();

        setState(prevState => ({ ...prevState, validationResponse: response }));

        goToNext();
    };

    const handleAddressSelection = useCallback(
        ({ paymentAddress, paymentAddressId }: PaymentMethodType) => {
            if (paymentAddressId === currentPaymentAddressId) {
                setState(prevState => ({ ...prevState, paymentAddress: undefined, paymentAddressId: undefined }));
            } else {
                setState(prevState => ({ ...prevState, paymentAddress, paymentAddressId }));
                setFormError(false);
            }
        },
        [currentPaymentAddressId, setState, setFormError]
    );

    const handleBankSelection = useCallback(
        ({ paymentAccountNumber, paymentBranchName, paymentBankId }: PaymentMethodType) => {
            if (paymentAccountNumber === currentPaymentAccountNumber) {
                setState(prevState => ({
                    ...prevState,
                    paymentAccountNumber: undefined,
                    paymentBranchName: undefined,
                    paymentBankId: undefined,
                }));
            } else {
                setState(prevState => ({ ...prevState, paymentAccountNumber, paymentBranchName, paymentBankId }));
                setFormError(false);
            }
        },
        [currentPaymentAccountNumber, setState, setFormError]
    );

    const handleFboFfcChange = ({ target: { value: fboFfcValue } }: ChangeEvent<HTMLInputElement>) => {
        setState(prevState => ({ ...prevState, fboFfc: fboFfcValue }));
    };

    const handlePaymentMethodChange = (newPaymentMethod: PaymentForm) => {
        setFormError(false);

        setState(prevState => ({
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
        return [
            {
                ariaLabel: t('workflows.paymentStep.paymentMethod.ach'),
                label: t('workflows.paymentStep.paymentMethod.ach'),
                value: PaymentForm.ACH,
            },
            {
                ariaLabel: t('workflows.paymentStep.paymentMethod.check'),
                label: t('workflows.paymentStep.paymentMethod.check'),
                value: PaymentForm.CHECK,
            },
            {
                ariaLabel: t('workflows.paymentStep.paymentMethod.wire'),
                label: t('workflows.paymentStep.paymentMethod.wire'),
                value: PaymentForm.WIRE,
            },
        ];
    }, [t]);

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
            footerContent={<TransactionCta mainCta={mainCta} secondaryCta={secondaryCta} stopLoading={stopLoading} />}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <Typography variant={TypographyVariant.LabelLg}>{subtitle}</Typography>

                    <div className="flex flex-col gap-4">
                        <Typography variant={TypographyVariant.LabelLg}>{t('workflows.paymentStep.moneyOutLabel')}</Typography>
                        <Radio
                            id="payment-method-radio"
                            groupLabel={t('workflows.paymentStep.paymentMethod.label') as string}
                            onValueChange={val => handlePaymentMethodChange(val as PaymentForm)}
                            options={paymentMethodOptions}
                            value={paymentForm}
                        />
                        {paymentForm && (
                            <div className="flex flex-col gap-4">
                                <Label
                                    label={
                                        paymentForm === PaymentForm.CHECK
                                            ? t('workflows.paymentStep.addressDetailsLabel')
                                            : t('workflows.paymentStep.fieldLabel')
                                    }
                                    variant={LabelVariant.FieldLabel}
                                />
                                {paymentForm === PaymentForm.CHECK ? (
                                    <div className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-3">
                                        {addresses?.map(address => (
                                            <AddressDataCard
                                                key={address.addressId}
                                                address={address as AddressOld}
                                                accessibilityClickText={t('ariaLabel.select')}
                                                selectedId={currentPaymentAddressId}
                                                onCardClick={() => {
                                                    handleAddressSelection({
                                                        paymentAddress: address,
                                                        paymentAddressId: address.addressId,
                                                    });
                                                }}
                                                // TODO MG: translate
                                                addressStatus={address.addressType}
                                            />
                                        ))}
                                        <div
                                            aria-hidden
                                            className="flex cursor-not-allowed items-center justify-center gap-1 rounded-md border-2 border-gray-200 bg-gray-100 px-4 py-8 text-gray-300"
                                        >
                                            <AddIcon height={24} width={24} />
                                            <p className="font-primary text-base font-semibold">{t('workflows.paymentStep.addAddress')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-3">
                                        {bankDetails?.map(details => (
                                            <BankDataCard
                                                bankDetails={details as BankAccount}
                                                onCardClick={() => {
                                                    handleBankSelection({
                                                        paymentAccountNumber: details.accountNumber,
                                                        paymentBankId: details.bankId,
                                                        paymentBranchName: details.branchName,
                                                    });
                                                }}
                                                key={details.accountNumber}
                                                selectedId={currentPaymentAccountNumber}
                                                accessibilityClickText={t('ariaLabel.select')}
                                            />
                                        ))}
                                        <div
                                            aria-hidden
                                            className="flex cursor-not-allowed items-center justify-center gap-1 rounded-md border-2 border-gray-200 bg-gray-100 px-4 py-8 text-gray-300"
                                        >
                                            <AddIcon height={24} width={24} />
                                            <p className="font-primary text-base font-semibold">{t('workflows.paymentStep.addBank')}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex w-1/2">
                                    <FieldData
                                        label={
                                            <Label
                                                variant={LabelVariant.FieldLabel}
                                                label={t('workflows.paymentStep.paymentMethod.fboFfc.label')}
                                                tooltipTitle={t('workflows.paymentStep.paymentMethod.fboFfc.tooltipTitle')}
                                                tooltipBody={t('workflows.paymentStep.paymentMethod.fboFfc.tooltipBody')}
                                                sentenceCase={false}
                                                className="mb-1"
                                            />
                                        }
                                        fieldSize={FieldSize.Small}
                                        onChange={handleFboFfcChange}
                                        // TODO MG: radio change is clearing this from state but input value is persisting
                                        value={fboFfc}
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
