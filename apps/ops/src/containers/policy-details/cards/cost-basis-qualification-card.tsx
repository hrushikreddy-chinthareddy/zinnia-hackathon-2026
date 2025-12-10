import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Toggle, {
    ToggleSize,
    ToggleVariant,
} from '@deps/components/toggle/toggle';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { getStateName } from '@deps/helpers/states.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export const CostBasisQualificationCard = ({
    policy,
}: BasePolicyComponentArgs) => {
    const { t } = useTranslation();

    const [showAdditional, setShowAdditional] = useState(false);

    const handleToggle = () => {
        setShowAdditional(!showAdditional);
    };

    const currencyFormat: Intl.NumberFormatOptions = {
        currency: policy.currency ?? 'USD',
        style: 'currency',
    };
    const { costBasis, issueState, qualificationType } = policy;
    const qualificationTypeValue = t(`enums.${qualificationType || ''}`);
    const {
        preTaxEquityAndFiscalResponsibilityActBasis,
        preTechnicalAndMiscellaneousRevenueActAmount,
        postTechnicalAndMiscellaneousRevenueActAmount,
    } = policy.costBasisDetails ?? {};

    const renderCurrencyField = (
        labelKey: string,
        value: number | undefined
    ) => (
        <div>
            <Label
                label={t(`policy.detailCards.policyDetails.${labelKey}`)}
                variant={LabelVariant.FieldLabel}
            />
            <Content
                details={numberFormatify(value ?? 0, currencyFormat)}
                variant={ContentVariant.BodySm}
            />
        </div>
    );

    const renderTextField = (labelKey: string, value: string) => (
        <div>
            <Label
                label={t(`policy.detailCards.policyDetails.${labelKey}`)}
                variant={LabelVariant.FieldLabel}
            />
            <Content
                details={value ?? DEFAULT_ERROR_STRING}
                variant={ContentVariant.BodySm}
            />
        </div>
    );

    const label = t('policy.detailCards.policyDetails.showdetailedCostBasis');

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <div className="flex flex-row justify-between items-center">
                <Typography variant={TypographyVariant.H2}>
                    {t(
                        'policy.detailCards.policyDetails.costBasisAndQualification'
                    )}
                </Typography>
                <Toggle
                    ariaLabel={label}
                    handleToggle={handleToggle}
                    size={ToggleSize.Default}
                    text={label}
                    value={showAdditional}
                    variant={ToggleVariant.Default}
                    data-testid="cost-basis-toggle"
                />
            </div>
            <div className="mt-4 flex flex-row gap-8 ">
                {renderCurrencyField('costBasis', costBasis as number)}
                {showAdditional && (
                    <>
                        {renderCurrencyField(
                            'preTefraBasis',
                            preTaxEquityAndFiscalResponsibilityActBasis as number
                        )}
                        {renderCurrencyField(
                            'preTamraBasis',
                            preTechnicalAndMiscellaneousRevenueActAmount as number
                        )}
                        {renderCurrencyField(
                            'postTamraBasis',
                            postTechnicalAndMiscellaneousRevenueActAmount as number
                        )}
                    </>
                )}
                {renderTextField('qualificationType', qualificationTypeValue)}
                {renderTextField(
                    'issueState',
                    getStateName(issueState) ?? DEFAULT_ERROR_STRING
                )}
            </div>
        </CardContainer>
    );
};
