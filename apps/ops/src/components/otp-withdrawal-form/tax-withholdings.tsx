import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { USStates } from '@deps/constants/geography/us-states';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    TaxWithholding,
    TaxWithholdingPlace,
    AmountType,
    WithholdingType,
} from '@deps/models/case/withdrawal/case';

import MartialStatusAllowancesWithholdings, {
    MaritalStatusAllowances,
} from './maritial-status-allowance-withholdings';
import TaxWithholdingRow, { WithholdingView } from './tax-withholding-row';
import TaxWithholdingSpecified from './tax-withholding-specified';

export const toFormTaxWithholding = (
    withholding: WithholdingView | undefined,
    maritalAllowances?: Pick<
        TaxWithholding,
        'multipleAllowances' | 'exemption' | 'allowances' | 'filingStatus'
    >
): TaxWithholding[] | undefined => {
    const formTaxWithholdings = [];
    if (!withholding) {
        return undefined;
    }

    const baseFormWithholding = {
        ...baseWithholding,
        place: { text: withholding.place },
    };
    if (withholding.dontWithhold) {
        const noWithholding = {
            type: {
                text: WithholdingType.NoTaxWithholding,
            },
            ...maritalAllowances,
        };
        formTaxWithholdings.push({ ...baseFormWithholding, ...noWithholding });
    }

    if (
        withholding.specified &&
        [withholding.dollarAmount, withholding.percentAmount].every(
            (val) => val === null
        )
    ) {
        const specifiedWithholding = {
            type: {
                text: WithholdingType.SpecifiedTaxWithholding,
            },
            amount: {
                text: null,
                amountType: null,
            },
        };
        formTaxWithholdings.push({
            ...baseFormWithholding,
            ...specifiedWithholding,
        });
    }

    if (withholding.dollarAmount) {
        const dollarTaxWithholding = {
            type: {
                text: WithholdingType.SpecifiedTaxWithholding,
            },
            amount: {
                text: withholding.dollarAmount || null,
                amountType: AmountType.Dollar || null,
            },
            ...maritalAllowances,
        };
        formTaxWithholdings.push({
            ...baseFormWithholding,
            ...dollarTaxWithholding,
        });
    }

    if (withholding.percentAmount) {
        const percentageTaxWithholding = {
            type: {
                text: WithholdingType.SpecifiedTaxWithholding,
            },
            amount: {
                text: withholding?.percentAmount,
                amountType: AmountType.Percent,
            },
            ...maritalAllowances,
        };
        formTaxWithholdings.push({
            ...baseFormWithholding,
            ...percentageTaxWithholding,
        });
    }

    if (withholding.selectMinimum) {
        const minTaxWithholding = {
            type: {
                text: WithholdingType.MinimumTaxWithholding,
            },
            additionalAmount: {
                text: withholding?.additionalPercentAmount,
                amountType: AmountType.Percent,
            },
            ...maritalAllowances,
        };
        formTaxWithholdings.push({
            ...baseFormWithholding,
            ...minTaxWithholding,
        });
    }
    return formTaxWithholdings;
};

const baseWithholding = {
    place: {
        text: null,
    },
    type: {
        text: null,
    },
    amount: {
        text: null,
        amountType: null,
    },
    additionalAmount: {
        text: null,
        amountType: null,
    },
    filingStatus: {
        text: null,
    },
    exemption: {
        text: null,
    },
};

export const toViewTaxWithholding = (
    withholdings: TaxWithholding[] | undefined
): WithholdingView | undefined => {
    if (!Array.isArray(withholdings)) {
        return undefined;
    }

    return withholdings.reduce((result, item) => {
        if (item.type?.text === WithholdingType.NoTaxWithholding) {
            result.dontWithhold = true;
        }
        if (item.type?.text === WithholdingType.SpecifiedTaxWithholding) {
            result.specified = true;
        }
        if (item?.amount?.amountType === AmountType.Percent) {
            result.percentAmount = item?.amount?.text;
        }
        if (item?.place.text) {
            result.place = item?.place.text as TaxWithholdingPlace;
        }

        if (item?.type?.text === WithholdingType.MinimumTaxWithholding) {
            result.selectMinimum = true;
        }
        if (item?.amount?.amountType === AmountType.Dollar) {
            result.dollarAmount = item?.amount?.text;
        }

        if (item?.additionalAmount?.amountType === AmountType.Percent) {
            result.additionalPercentAmount = item?.additionalAmount?.text;
        }

        return result;
    }, {} as WithholdingView);
};

export type AdditionalWithHoldingConfig = { amountType: AmountType };
export type AdditionalWithHoldingRecord = {
    [key in keyof typeof TaxWithholdingPlace]?: AdditionalWithHoldingConfig;
};

interface TaxWithholdingsProps {
    ownerStateOfResidence?: string | null;
    className?: string | '';
    isMaritalStatusAllowances?: boolean | false;
    specifiedView?: boolean | false;
    additionalWithHoldingConfig?: AdditionalWithHoldingRecord;
    isFormStateReadOnly?: boolean;
    meritalStatusAllowanceConfig?: {
        label: string;
        maritalStatusAllowancesOptions: {
            label: string;
            value: MaritalStatusAllowances;
        }[];
    };
}

export default function TaxWithholdings({
    ownerStateOfResidence,
    className,
    isMaritalStatusAllowances,
    additionalWithHoldingConfig,
    specifiedView,
    isFormStateReadOnly,
    meritalStatusAllowanceConfig,
}: TaxWithholdingsProps) {
    const { formTaxWithholding, setFormTaxWithholding } =
        useContext(FormDataContext);
    const maritalAllowancesTax = formTaxWithholding.taxWithholding?.find(
        (tw) =>
            tw.place.text === TaxWithholdingPlace.State &&
            tw?.multipleAllowances?.text === true
    );
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.taxWithholdings',
    });
    const isIowaResident = ownerStateOfResidence === USStates.IOWA;
    const IOWAChecked =
        isIowaResident &&
        formTaxWithholding.taxWithholding?.some(
            (tw) =>
                tw.place.text === TaxWithholdingPlace.State &&
                tw.type.text === WithholdingType.NoTaxWithholding
        );
    const [federalWithholding, setFederalWithholding] = useState(
        toViewTaxWithholding(
            formTaxWithholding.taxWithholding?.filter(
                (tw) =>
                    tw.place.text === TaxWithholdingPlace.Federal &&
                    tw.type.text !== WithholdingType.NoTaxWithholdingAllowed
            )
        )
    );
    const [stateWithholding, setStateWithholding] = useState(
        toViewTaxWithholding(
            !IOWAChecked
                ? formTaxWithholding.taxWithholding?.filter(
                      (tw) =>
                          tw.place.text === TaxWithholdingPlace.State &&
                          tw.type.text !==
                              WithholdingType.NoTaxWithholdingAllowed
                  )
                : undefined
        )
    );

    const [noWithholdings, setNoWithholdings] = useState<boolean>(
        IOWAChecked || false
    );
    const [maritalAllowances, setMaritalAllowances] = useState<
        Pick<
            TaxWithholding,
            'multipleAllowances' | 'noOfallowances' | 'allowances'
        >
    >({ ...maritalAllowancesTax });

    useEffect(() => {
        const withholdings = [];
        const IOWAWithholding = {
            dollarAmount: null,
            dontWithhold: true,
            na: false,
            percentAmount: null,
            additionalPercentAmount: null,
            place: TaxWithholdingPlace.State,
            selectMinimum: false,
        };

        const fed = toFormTaxWithholding(federalWithholding);
        const state = noWithholdings
            ? toFormTaxWithholding(IOWAWithholding)
            : toFormTaxWithholding(stateWithholding, {
                  ...maritalAllowances,
                  filingStatus: {
                      text: maritalAllowancesTax?.filingStatus?.text ?? null,
                  },
              });

        if (fed) {
            withholdings.push(...fed);
        }

        if (state) {
            withholdings.push(...state);
        }

        setFormTaxWithholding({
            taxWithholding: withholdings.length ? withholdings : undefined,
        });
    }, [
        federalWithholding,
        stateWithholding,
        noWithholdings,
        maritalAllowances,
    ]);

    return (
        <CardContainer
            containerClassNames={`${className} border-b-2 border-gray-100`}
        >
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {t('title')}
            </Typography>
            <TaxWithholdingRow
                className="mb-4"
                label={t('federal')}
                onDataChange={setFederalWithholding}
                place={TaxWithholdingPlace.Federal}
                withholding={federalWithholding}
                additionalWithHoldingConfig={
                    additionalWithHoldingConfig?.Federal
                }
                isFormStateReadOnly={isFormStateReadOnly}
            />
            {specifiedView && (
                <TaxWithholdingSpecified
                    label={t('state')}
                    onDataChange={setStateWithholding}
                    place={TaxWithholdingPlace.State}
                    withholding={stateWithholding}
                    additionalWithHoldingConfig={
                        additionalWithHoldingConfig?.State
                    }
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            )}

            {!specifiedView && (
                <TaxWithholdingRow
                    label={t('state')}
                    onDataChange={setStateWithholding}
                    place={TaxWithholdingPlace.State}
                    withholding={stateWithholding}
                    additionalWithHoldingConfig={
                        additionalWithHoldingConfig?.State
                    }
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            )}

            {isIowaResident && (
                <div className="mt-4">
                    <CheckboxText
                        label={t(`iowaResident`)}
                        checked={noWithholdings}
                        onChange={() => setNoWithholdings(!noWithholdings)}
                        isDisabled={isFormStateReadOnly}
                    />
                </div>
            )}
            {isMaritalStatusAllowances ? (
                <div>
                    <MartialStatusAllowancesWithholdings
                        maritalAllowances={maritalAllowances}
                        setMaritalAllowances={setMaritalAllowances}
                        isFormStateReadOnly={isFormStateReadOnly}
                        meritalStatusAllowanceConfig={
                            meritalStatusAllowanceConfig
                        }
                    />
                </div>
            ) : null}
        </CardContainer>
    );
}
