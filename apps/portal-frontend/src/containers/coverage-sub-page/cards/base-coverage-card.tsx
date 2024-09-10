import { useTranslation } from 'next-i18next';

import { getBadgeStatus, getBadgeStatusVariant } from '@deps/components/badge/badge.helper';
import Content, { ContentVariant } from '@deps/components/content/content';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helper';
import PolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import SideSheetCoverage from '@deps/components/side-sheet/side-sheet-base-coverage/side-sheet-base-coverage';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getTotalMinRequiredAmount } from '@deps/helpers/global-values';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { convertKebabedDateString, isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { formatDate } from '@deps/helpers/string.helper';
import { Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as DollarsIcon } from '@deps/styles/elements/icons/currency/dollars.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

const BASE_KEY = 'policy.detailCards.baseCoverage';

interface BaseCoverageCardProps {
    policy: Policy;
}

const BaseCoverageCard = ({ policy }: BaseCoverageCardProps) => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();

    const { coverage, currency, policyNumber, policyStatus, policyDates, product, policyFeatures } = policy;
    const { marketingName, productType } = product ?? {};
    const { issueDate } = policyDates ?? {};
    const { coverageLayers } = coverage ?? {};

    const totalMinRequiredAmount = getTotalMinRequiredAmount(policyFeatures ?? []);

    const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency };

    // for the MVP we will only have one entry in coverage layers- 'base coverage'
    const {
        coverageChangeEffectiveDate,
        currentAmount: baseDeathBenefit,
        originalCoverageAmount: originalDeathBenefit,
    } = coverageLayers?.[0] ?? {};
    const baseDeathBenefitValue = !isNullEmptyOrUndefined(baseDeathBenefit)
        ? numberFormatify(baseDeathBenefit as number, currencyFormat)
        : DEFAULT_ERROR_STRING;
    const originalDeathBenefitValue = !isNullEmptyOrUndefined(originalDeathBenefit)
        ? numberFormatify(originalDeathBenefit as number, currencyFormat)
        : DEFAULT_ERROR_STRING;

    const openSidesheet = () => {
        sideSheet.changeSideSheetContent(header, <SideSheetCoverage policy={policy} />);
        sideSheet.handleOpen(true);
    };

    const header = (
        <PolicyInfo
            carrierId={policy.carrierId}
            marketingName={marketingName}
            productType={productType}
            policyNumber={policyNumber}
            status={t(getBadgeStatus(policyStatus))}
            tooltip={
                t(getPolicyBadgeStatusTooltip(policyStatus), {
                    tooltipDate: formatDate(issueDate),
                    tooltipAmount: numberFormatify(totalMinRequiredAmount),
                }) ?? ''
            }
            variant={getBadgeStatusVariant(policyStatus)}
            tooltipPlacements={PopoverPlacement.BottomLeft}
        />
    );

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <div className="flex flex-wrap gap-4 sm:justify-start md:justify-between">
                <div className="flex gap-2 sm:basis-full md:basis-6/12">
                    <DollarsIcon className="mt-1 text-primary" role="presentation" width={24} height={24} />
                    <Typography variant={TypographyVariant.H2}>{t(`${BASE_KEY}.baseCoverage`)}</Typography>
                </div>
                <NavElement
                    type={NavElementType.Button}
                    size={NavElementSize.Small}
                    variant={NavElementVariant.Default}
                    onClick={openSidesheet}
                >
                    {t(`${BASE_KEY}.coverageChangeRules`)}
                </NavElement>
            </div>

            <div className="mt-4 flex flex-col gap-8 md:flex-row lg:ml-8">
                <div>
                    <Label
                        label={t(`${BASE_KEY}.baseDeathBenefit`)}
                        variant={LabelVariant.FieldLabel}
                        tooltipTitle={t(`${BASE_KEY}.baseDeathBenefit`) as string}
                        tooltipBody={t(`${BASE_KEY}.baseDeathBenefitPopover`) as string}
                    />
                    <Content details={baseDeathBenefitValue} variant={ContentVariant.BodySm} />
                </div>

                {coverageChangeEffectiveDate && (
                    <>
                        <div>
                            <Label
                                label={t(`${BASE_KEY}.originalDeathBenefit`)}
                                variant={LabelVariant.FieldLabel}
                                tooltipTitle={t(`${BASE_KEY}.originalDeathBenefit`) as string}
                                tooltipBody={t(`${BASE_KEY}.originalDeathBenefitPopover`) as string}
                            />
                            <Content details={originalDeathBenefitValue} variant={ContentVariant.BodySm} />
                        </div>

                        <div>
                            <Label label={t(`${BASE_KEY}.lastCoverageChange`)} variant={LabelVariant.FieldLabel} />
                            <Content details={convertKebabedDateString(coverageChangeEffectiveDate)} variant={ContentVariant.BodySm} />
                        </div>
                    </>
                )}
            </div>
        </CardContainer>
    );
};

export default BaseCoverageCard;
