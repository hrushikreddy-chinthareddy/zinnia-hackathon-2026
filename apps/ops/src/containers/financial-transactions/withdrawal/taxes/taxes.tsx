import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import xss from 'xss';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, {
    FieldFormat,
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldLabel from '@deps/components/fields/field-label';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { TransactionStep } from '@deps/types/segment-analytics';
import { TaxWithholdingType } from '@zinnia/api-types/types/bpm';
import { Policy, TransactionType } from '@zinnia/api-types/types/sor';

import {
    Errors,
    getFormErrors,
    getOwnersTaxJurisdictionState,
    mapTaxWithholdingInstructionsFromViewModel,
    mapTaxWithholdingInstructionsToViewModel,
} from './taxes.helpers';
import { WithdrawalType } from '../amount/types';

interface TaxesProps {
    policy: Policy;
}

const Taxes = ({ policy }: TaxesProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'withdrawals.taxes',
    });

    const { withdrawal, setWithdrawal } = useWithdrawal();
    const { goToNext } = useWorkflow();

    const { taxWithholdingInstructions } = withdrawal;
    const federalWithholdings = taxWithholdingInstructions.find(
        (tw) => tw.taxWithholdingType === TaxWithholdingType.FEDERAL
    );
    const stateWithholdings = taxWithholdingInstructions.find(
        (tw) => tw.taxWithholdingType === TaxWithholdingType.STATE
    );
    const { policyNumber, product } = policy;
    const numberFormat = {
        type: 'number' as FieldFormat,
        decimalPlaces: 2,
        format: '',
    };

    const [federalTaxWithholdings, setFederalTaxWithholdings] = useState(
        mapTaxWithholdingInstructionsToViewModel(federalWithholdings)
    );
    const [stateTaxWithholdings, setStateTaxWithholdings] = useState(
        mapTaxWithholdingInstructionsToViewModel(stateWithholdings)
    );

    const [currentErrors, setCurrentErrors] = useState<Errors>({});
    const ownerTaxState = getOwnersTaxJurisdictionState(policy);

    const transactionType = useMemo(() => {
        return withdrawal.type === WithdrawalType.Surrender
            ? TransactionType.FULL_SURRENDER
            : TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME;
    }, [withdrawal.type]);

    const handleContinue = () => {
        const errors = getFormErrors(
            federalTaxWithholdings,
            stateTaxWithholdings
        );

        setCurrentErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const withholdingInstuctions = [
            mapTaxWithholdingInstructionsFromViewModel(
                federalTaxWithholdings,
                TaxWithholdingType.FEDERAL
            ),
            mapTaxWithholdingInstructionsFromViewModel(
                stateTaxWithholdings,
                TaxWithholdingType.STATE
            ),
        ];

        setWithdrawal({
            ...withdrawal,
            taxWithholdingInstructions: withholdingInstuctions,
        });

        goToNext();
    };

    return (
        <WorkflowCard
            title={t('label')}
            footerContent={
                <TransactionNavigationButtons
                    handleContinue={handleContinue}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    parentPage={ParentPage.Withdrawals}
                    trackEventProps={{
                        type: transactionType,
                        step: TransactionStep.Taxes,
                    }}
                />
            }
        >
            <div className="flex flex-col gap-4">
                <Typography variant={TypographyVariant.LabelLg}>
                    {t('title')}
                </Typography>

                <div className="flex flex-wrap gap-10 md:flex-nowrap">
                    <div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <FieldLabel
                                    label={t('federalLabel') as string}
                                    labelTooltip={t('federalLabel') as string}
                                    labelTooltipBody={
                                        t('federalTooltip') as string
                                    }
                                />
                                <div className="flex gap-4">
                                    <div className="flex basis-2/5">
                                        <Field
                                            formatOptions={numberFormat}
                                            max={100}
                                            onChange={(e) =>
                                                setFederalTaxWithholdings(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        percentAmount: xss(
                                                            e?.target?.value
                                                        ),
                                                    })
                                                )
                                            }
                                            size={FieldSize.Small}
                                            trailing={<span>%</span>}
                                            type={FieldType.BaseActive}
                                            value={
                                                federalTaxWithholdings.percentAmount
                                            }
                                            variant={
                                                federalTaxWithholdings.withholdMinimum ||
                                                federalTaxWithholdings.withholdNone
                                                    ? FieldVariant.Inactive
                                                    : currentErrors.federalBothInputs
                                                    ? FieldVariant.Error
                                                    : FieldVariant.Default
                                            }
                                        />
                                    </div>
                                    <div className="flex basis-3/5">
                                        <Field
                                            formatOptions={numberFormat}
                                            leading={<div>$</div>}
                                            min={1}
                                            onBlur={(event) => {
                                                const { target } = event;
                                                const value = target?.value;

                                                if (
                                                    !isNullEmptyOrUndefined(
                                                        value
                                                    )
                                                ) {
                                                    const num = Number(
                                                        value.replaceAll(
                                                            ',',
                                                            ''
                                                        )
                                                    );
                                                    const formattedValue =
                                                        num.toFixed(2);

                                                    setFederalTaxWithholdings(
                                                        (prevState) => ({
                                                            ...prevState,
                                                            dollarAmount:
                                                                formattedValue,
                                                        })
                                                    );
                                                }
                                            }}
                                            onChange={(e) =>
                                                setFederalTaxWithholdings(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        dollarAmount: xss(
                                                            e?.target?.value
                                                        ),
                                                    })
                                                )
                                            }
                                            size={FieldSize.Small}
                                            type={FieldType.BaseActive}
                                            value={
                                                federalTaxWithholdings.dollarAmount
                                            }
                                            variant={
                                                federalTaxWithholdings.withholdMinimum ||
                                                federalTaxWithholdings.withholdNone
                                                    ? FieldVariant.Inactive
                                                    : currentErrors.federalBothInputs
                                                    ? FieldVariant.Error
                                                    : FieldVariant.Default
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {currentErrors.federalBothInputs && (
                                <AssistiveText
                                    text={t('bothInputsSelected')}
                                    variant={AssistiveTextVariant.Error}
                                />
                            )}

                            <CheckboxText
                                checked={federalTaxWithholdings.withholdMinimum}
                                label={t('withholdMiniumum', {
                                    type: t('federal'),
                                })}
                                onChange={(checked) =>
                                    setFederalTaxWithholdings((prevState) => ({
                                        ...prevState,
                                        withholdMinimum: checked,
                                        withholdNone: checked
                                            ? false
                                            : prevState.withholdNone,
                                    }))
                                }
                            />
                            <CheckboxText
                                checked={federalTaxWithholdings.withholdNone}
                                label={t('dontWithhold', {
                                    type: t('federal'),
                                })}
                                onChange={(checked) =>
                                    setFederalTaxWithholdings((prevState) => ({
                                        ...prevState,
                                        withholdNone: checked,
                                        withholdMinimum: checked
                                            ? false
                                            : prevState.withholdMinimum,
                                        dollarAmount: checked ? xss('0') : '',
                                        percentAmount: checked ? xss('0') : '',
                                    }))
                                }
                            />
                        </div>
                        {currentErrors.federalNothing && (
                            <AssistiveText
                                className="mt-2"
                                text={t('detailsMissing')}
                                variant={AssistiveTextVariant.Error}
                            />
                        )}
                        {currentErrors.federalBothCheckboxes && (
                            <AssistiveText
                                className="mt-2"
                                text={t('bothCheckboxesSelected')}
                                variant={AssistiveTextVariant.Error}
                            />
                        )}
                    </div>
                    <div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <FieldLabel
                                    label={
                                        t('stateLabel', {
                                            state: ownerTaxState,
                                        }) as string
                                    }
                                    labelTooltip={
                                        t('stateLabel', {
                                            state: ownerTaxState,
                                        }) as string
                                    }
                                    labelTooltipBody={
                                        t('stateTooltip') as string
                                    }
                                />
                                <div className="flex gap-4">
                                    <div className="flex basis-2/5">
                                        <Field
                                            formatOptions={numberFormat}
                                            max={100}
                                            onChange={(e) =>
                                                setStateTaxWithholdings(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        percentAmount: xss(
                                                            e?.target?.value
                                                        ),
                                                    })
                                                )
                                            }
                                            size={FieldSize.Small}
                                            trailing={<span>%</span>}
                                            type={FieldType.BaseActive}
                                            value={
                                                stateTaxWithholdings.percentAmount
                                            }
                                            variant={
                                                stateTaxWithholdings.withholdMinimum ||
                                                stateTaxWithholdings.withholdNone
                                                    ? FieldVariant.Inactive
                                                    : currentErrors.stateBothInputs
                                                    ? FieldVariant.Error
                                                    : FieldVariant.Default
                                            }
                                        />
                                    </div>
                                    <div className="flex basis-3/5">
                                        <Field
                                            formatOptions={numberFormat}
                                            leading={<div>$</div>}
                                            min={1}
                                            onBlur={(event) => {
                                                const { target } = event;
                                                const value = target?.value;

                                                if (
                                                    !isNullEmptyOrUndefined(
                                                        value
                                                    )
                                                ) {
                                                    const num = Number(
                                                        value.replaceAll(
                                                            ',',
                                                            ''
                                                        )
                                                    );
                                                    const formattedValue =
                                                        num.toFixed(2);

                                                    setStateTaxWithholdings(
                                                        (prevState) => ({
                                                            ...prevState,
                                                            dollarAmount:
                                                                formattedValue,
                                                        })
                                                    );
                                                }
                                            }}
                                            onChange={(e) =>
                                                setStateTaxWithholdings(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        dollarAmount: xss(
                                                            e?.target?.value
                                                        ),
                                                    })
                                                )
                                            }
                                            size={FieldSize.Small}
                                            type={FieldType.BaseActive}
                                            value={
                                                stateTaxWithholdings.dollarAmount
                                            }
                                            variant={
                                                stateTaxWithholdings.withholdMinimum ||
                                                stateTaxWithholdings.withholdNone
                                                    ? FieldVariant.Inactive
                                                    : currentErrors.stateBothInputs
                                                    ? FieldVariant.Error
                                                    : FieldVariant.Default
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {currentErrors.stateBothInputs && (
                                <AssistiveText
                                    text={t('bothInputsSelected')}
                                    variant={AssistiveTextVariant.Error}
                                />
                            )}

                            <CheckboxText
                                checked={stateTaxWithholdings.withholdMinimum}
                                label={t('withholdMiniumum', {
                                    type: t('state'),
                                })}
                                onChange={(checked) =>
                                    setStateTaxWithholdings((prevState) => ({
                                        ...prevState,
                                        withholdMinimum: checked,
                                        withholdNone: checked
                                            ? false
                                            : prevState.withholdNone,
                                    }))
                                }
                            />
                            <CheckboxText
                                checked={stateTaxWithholdings.withholdNone}
                                label={t('dontWithhold', { type: t('state') })}
                                onChange={(checked) =>
                                    setStateTaxWithholdings((prevState) => ({
                                        ...prevState,
                                        withholdNone: checked,
                                        withholdMinimum: checked
                                            ? false
                                            : prevState.withholdMinimum,
                                        dollarAmount: checked ? xss('0') : '',
                                        percentAmount: checked ? xss('0') : '',
                                    }))
                                }
                            />
                        </div>
                        {currentErrors.stateNothing && (
                            <AssistiveText
                                className="mt-2"
                                text={t('detailsMissing')}
                                variant={AssistiveTextVariant.Error}
                            />
                        )}
                        {currentErrors.stateBothCheckboxes && (
                            <AssistiveText
                                className="mt-2"
                                text={t('bothCheckboxesSelected')}
                                variant={AssistiveTextVariant.Error}
                            />
                        )}
                    </div>
                </div>
            </div>
        </WorkflowCard>
    );
};

export default Taxes;
