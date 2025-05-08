import { DisbursementType } from '@zinnia/api-types/types/bpm';
import { TransactionType } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { TFunction, useTranslation } from 'next-i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import ButtonGroup from '@deps/components/button-group/button-group';
import { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import SelectSimple from '@deps/components/select/select';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { WithdrawalType, useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import { LabelValue } from '@deps/types/data';
import { TransactionStep } from '@deps/types/segment-analytics';

import { WithdrawalContainerProps } from '../withdrawal-container';
import PartialViewContainer from './partial-view-container/partial-view-container';

export type AmountType = {
    amount: number;
    disbursementType: DisbursementType;
    effectiveDate: string;
    paymentAmount: string;
    type: WithdrawalType;
    withdrawalAmount?: string;
    withdrawalCustomAmount?: string;
};

const Amount = ({ policy }: WithdrawalContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'withdrawals.amount' });
    const { goToNext } = useWorkflow();
    const { withdrawal, setWithdrawal } = useWithdrawal();
    const { disbursementType, type: withdrawalType, effectiveDate } = withdrawal;
    const [formError, setFormError] = useState<null | string>(null);

    const incompleteError = t('incompleteForm');
    const missingAmountError = t('missingAmount');
    const exceedMaximumError = t('exceedMaximum', {
        maxAmountToWithdrawal: numberFormatify(policy.withdrawalValues?.maximumWithdrawalAmount),
    });
    const invalidDate = t('effectiveDateError');

    const isSurrender = withdrawalType === WithdrawalType.Surrender;
    const isPartial = withdrawalType === WithdrawalType.Partial;

    const disbursementTypes = [
        {
            label: t('gross'),
            value: DisbursementType.GROSS as string,
        },
    ];

    withdrawalType === WithdrawalType.Partial &&
        disbursementTypes.push({
            label: t('net'),
            value: DisbursementType.NET as string,
        });

    const toggleLabels = (t: TFunction): LabelValue<WithdrawalType>[] => [
        {
            label: `${t('surrender')} (${numberFormatify(policy.accountValues?.surrenderValue || 0)})`,
            value: WithdrawalType.Surrender,
            testId: WithdrawalType.Surrender,
        },
        // TODO MG: do eligibilty check and disable if they cant do a partial
        {
            label: t('partial'),
            value: WithdrawalType.Partial,
            testId: WithdrawalType.Partial,
        },
    ];

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = event.target.value;
        setWithdrawal({ ...withdrawal, effectiveDate: dateValue });
    };

    const isDateValid = (date: string): boolean => {
        return dayjs(date, NUMERIC_DATE_FORMAT).isValid() && date !== '';
    };

    const handleContinue = useCallback(() => {
        if (!isSurrender && !isPartial) {
            return setFormError(incompleteError);
        }

        // Cleaning formatted string dollar to parseable number string
        const isCustom = Number((withdrawal.withdrawalAmount as string).replace(/[^0-9.-]+/g, '')) === 0;
        const withdrawalAmount = isCustom ? withdrawal.withdrawalCustomAmount : withdrawal.withdrawalAmount;
        const roundedMaxAmt = Math.round(Number(policy.withdrawalValues?.maximumWithdrawalAmount) * 100) / 100;

        if (isPartial && !withdrawalAmount) {
            return setFormError(missingAmountError);
        }

        if (isPartial && roundedMaxAmt < parseFloat((withdrawalAmount as string).replace(/[^0-9.-]+/g, ''))) {
            return setFormError(exceedMaximumError);
        }

        if (isDateValid(effectiveDate) === false) {
            return setFormError(invalidDate);
        }

        goToNext();
    }, [
        isSurrender,
        isPartial,
        withdrawal.withdrawalAmount,
        withdrawal.withdrawalCustomAmount,
        policy.withdrawalValues?.maximumWithdrawalAmount,
        effectiveDate,
        goToNext,
        incompleteError,
        missingAmountError,
        exceedMaximumError,
        invalidDate,
    ]);

    useEffect(() => {
        if (isSurrender) {
            setWithdrawal(prevState => ({ ...prevState, disbursementType: DisbursementType.GROSS }));
        }
    }, [isSurrender, setWithdrawal]);

    useEffect(() => {
        if (withdrawalType === WithdrawalType.Surrender) {
            setWithdrawal(prevState => ({ ...prevState, amount: parseFloat((policy.accountValues?.surrenderValue || 0).toFixed(2)) }));
        } else {
            const isCustom = Number((withdrawal.withdrawalAmount as string).replace(/[^0-9.-]+/g, '')) === 0;
            const partialAmount = isCustom ? withdrawal.withdrawalCustomAmount : withdrawal.withdrawalAmount;
            const partialAmountNum = Number(partialAmount?.replace(/[^0-9.-]+/g, '')) || 0;

            setWithdrawal(prevState => ({ ...prevState, amount: partialAmountNum }));
        }
    }, [
        policy.accountValues?.surrenderValue,
        setWithdrawal,
        withdrawal.withdrawalAmount,
        withdrawal.withdrawalCustomAmount,
        withdrawalType,
    ]);
    // TODO MG: pass in trackEventProps so we dont have to do this in every step
    const transactionType = useMemo(() => {
        return withdrawal.type === WithdrawalType.Surrender ? TransactionType.FULL_SURRENDER : TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME;
    }, [withdrawal.type]);

    return (
        <WorkflowCard
            title={t('label')}
            footerContent={
                <TransactionNavigationButtons
                    handleContinue={handleContinue}
                    parentPage={ParentPage.Withdrawals}
                    planCode={policy.product?.planCode}
                    policyNumber={policy.policyNumber}
                    trackEventProps={{ type: transactionType, step: TransactionStep.Amount }}
                />
            }
        >
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4" data-testid="withdrawal-amount">
                    <Typography variant={TypographyVariant.LabelLg} data-testid="withdrawal-amount-label">
                        {t('withdrawalTypeLabel')}
                    </Typography>
                    <div className="flex flex-col" data-testid="withdrawal-amount-radio">
                        <div
                            className={withdrawalType === WithdrawalType.Partial ? 'mb-6 flex flex-col gap-2' : 'flex flex-col gap-2'}
                            data-testid={WithdrawalType}
                        >
                            <ButtonGroup
                                activeValue={withdrawalType}
                                groupLabel={t('distributionType')}
                                labels={toggleLabels(t)}
                                toggle={value => setWithdrawal({ ...withdrawal, type: value as WithdrawalType })}
                            />
                            {isSurrender && <AssistiveText variant={AssistiveTextVariant.Info} text={t('assistiveText')}></AssistiveText>}
                        </div>
                        {withdrawalType !== WithdrawalType.Default && (
                            <>
                                <SelectSimple
                                    className={isSurrender ? 'my-6 flex max-w-[155px]' : 'mb-6 flex max-w-[155px]'}
                                    labelTooltip={t('disbursementType') as string}
                                    labelTooltipBody={t('disbursementTypeTooltip') as string}
                                    label={t('disbursementType') as string}
                                    aria-label={t('disbursementType') as string}
                                    options={disbursementTypes}
                                    value={disbursementType}
                                    onChange={value => {
                                        if (isPartial) {
                                            setWithdrawal({ ...withdrawal, disbursementType: value as DisbursementType });
                                        }
                                    }}
                                    disabled={isSurrender}
                                    size={FieldSize.Small}
                                    variant={isSurrender ? FieldVariant.Inactive : undefined}
                                />
                                <FieldDateSelect
                                    isFutureDateDisabled={false}
                                    formatOptions={{ format: '##/##/####' }}
                                    className="flex max-w-[155px]"
                                    labelTooltip={t('effectiveDate') as string}
                                    labelTooltipBody={t('effectiveDateTooltip') as string}
                                    label={t('effectiveDate') as string}
                                    value={effectiveDate}
                                    onChange={handleDateChange}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    variant={isDateValid(effectiveDate) ? FieldVariant.Default : FieldVariant.Error}
                                    message={isDateValid(effectiveDate) ? undefined : invalidDate}
                                />
                            </>
                        )}
                        {withdrawalType === WithdrawalType.Partial && (
                            <PartialViewContainer
                                policy={policy}
                                formError={formError}
                                exceedMaximumError={exceedMaximumError}
                                missingAmountError={missingAmountError}
                            />
                        )}
                        {!!formError &&
                            formError !== exceedMaximumError &&
                            formError !== invalidDate &&
                            formError !== missingAmountError &&
                            !withdrawalType && (
                                <AssistiveText className="mt-2" variant={AssistiveTextVariant.Error} text={formError}></AssistiveText>
                            )}
                    </div>
                </div>
            </div>
        </WorkflowCard>
    );
};

export default Amount;
