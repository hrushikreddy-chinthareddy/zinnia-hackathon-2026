import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import BadgeWithTooltip from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helper';
import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import TempNavInactive, { isStillInactive } from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import PageHeader from '@deps/components/page-header/page-header';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Tooltip from '@deps/components/tooltip/tooltip';
import { TranslationFiles } from '@deps/config/translations';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helper';
import { numberFormatify, percentFormatify } from '@deps/helpers/numbers.helper';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { LoansTest } from '@deps/jest/constants/test-id-constants';
import { Policy } from '@deps/models/policy/sor-policy';
import { checkEligibilityNewLoan } from '@deps/queries/api/bpm';
import { getBorrowingInterestRate, getLoanInterestRate } from '@deps/queries/api/product-rate';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

interface LoansContainerProps {
    policy: Policy;
    loanCarryingBalance: boolean;
    breadcrumbText?: string;
    breadcrumbUrl?: string;
}

const LoansPageHeaderContainer = ({ policy, breadcrumbText, breadcrumbUrl, loanCarryingBalance }: LoansContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const [isEligible, setIsEligible] = useState<boolean | null>(null);
    const [ineligibilityMessage, setIneligibityMessage] = useState('');

    const [availableLoanInterestRate, setAvailableLoanInterestRate] = useState(t('general.loadingThing', { thing: t('general.rate') }));
    const [availableLoanCreditRate, setAvailableLoanCreditRate] = useState(t('general.loadingThing', { thing: t('general.rate') }));

    useEffect(() => {
        const getLoanRates = async () => {
            const [loanInterestRate, loanCreditRate] = await Promise.all([getLoanInterestRate(policy), getBorrowingInterestRate(policy)]);
            setAvailableLoanCreditRate(percentFormatify(loanCreditRate, { isInteger: true }));
            setAvailableLoanInterestRate(percentFormatify(loanInterestRate, { isInteger: true }));
        };

        getLoanRates();
    }, []);
    useEffect(() => {
        const checkEligibility = async () => {
            const eligibilityResponse = await checkEligibilityNewLoan(policy.product?.planCode, policy.policyNumber);
            const eligible = eligibilityResponse.status === 'success';
            setIsEligible(eligible);
            !eligible && setIneligibityMessage(formatValidationResult(eligibilityResponse?.validationResult));
        };
        checkEligibility();
    }, [policy.policyNumber, policy.product?.planCode]);

    const { currency, loanValues, coverage } = policy;
    const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency };
    const totalLoanBalanceValue = !isNullEmptyOrUndefined(loanValues?.totalLoanBalance)
        ? numberFormatify(loanValues?.totalLoanBalance, currencyFormat)
        : DEFAULT_ERROR_STRING;
    const eligibleForLoanValue = !isNullEmptyOrUndefined(loanValues?.maximumLoanAmount)
        ? numberFormatify(loanValues?.maximumLoanAmount, currencyFormat)
        : DEFAULT_ERROR_STRING;
    const totalNumberOfLoans = !isNullEmptyOrUndefined(loanValues?.totalNumberOfLoan) ? loanValues?.totalNumberOfLoan : 0;
    const estimatedNetDeathBenefit = coverage?.netDeathBenefit ? numberFormatify(coverage?.netDeathBenefit) : DEFAULT_ERROR_STRING;

    const headerRowFlexClassNames = 'mb-4';
    const groupOneFlexClassNames = 'flex gap-4';

    const headerTextSiblingsGroupOne = (
        <>
            {isEligible !== null && (
                <BadgeWithTooltip
                    className="mb-2 mt-2 self-center"
                    label={isEligible ? 'Eligible' : 'Ineligible'}
                    variant={isEligible ? BadgeVariant.Positive : BadgeVariant.Negative}
                    tooltipPlacement={PopoverPlacement.BottomRight}
                    tooltip={t(`transactions.loans.header.${isEligible ? 'eligiblePopover' : 'ineligiblePopover'}`) as string}
                />
            )}
        </>
    );

    const belowHeaderTextChildren = (
        <>
            <div className="grid grid-cols-[repeat(2,minmax(min-content,max-content))] gap-x-8 gap-y-4 md:grid-cols-[repeat(3,minmax(min-content,max-content))] md:gap-y-6 lg:flex lg:flex-wrap">
                <FieldData label={t('pageHeader.loans.fields.totalLoans')} variant={FieldDataVariant.Large}>
                    {`${totalNumberOfLoans} ${t('pageHeader.loans.fields.numOfLoans', {
                        count: loanValues?.totalNumberOfLoan || 0,
                    })}`}
                </FieldData>
                <FieldData label={t('pageHeader.loans.fields.totalLoanBalance')} variant={FieldDataVariant.Large}>
                    {totalLoanBalanceValue}
                </FieldData>
                <FieldData
                    tooltipTitle={t('pageHeader.loans.fields.eligibleForLoan')}
                    tooltipBody={t('pageHeader.loans.fields.eligibleForLoanPopover')}
                    tooltipPlacement={PopoverPlacement.TopLeft}
                    label={t('pageHeader.loans.fields.eligibleForLoan')}
                    variant={FieldDataVariant.Large}
                >
                    {eligibleForLoanValue}
                </FieldData>
                {loanCarryingBalance ? (
                    <FieldData
                        label={t('pageHeader.loans.fields.estimatedNetDeathBenefit')}
                        variant={FieldDataVariant.Large}
                        tooltipTitle={t('pageHeader.loans.fields.estimatedNetDeathBenefit') as string}
                        tooltipBody={t('pageHeader.loans.fields.estimatedNetDeathBenefitPopover') as string}
                        tooltipPlacement={PopoverPlacement.TopLeft}
                    >
                        {estimatedNetDeathBenefit}
                    </FieldData>
                ) : (
                    <>
                        <FieldData
                            label={t('pageHeader.loans.fields.availableLoanInterestRate')}
                            variant={FieldDataVariant.Large}
                            tooltipTitle={t('pageHeader.loans.fields.availableLoanInterestRate') as string}
                            tooltipBody={t('pageHeader.loans.fields.availableLoanInterestRatePopover') as string}
                            tooltipPlacement={PopoverPlacement.TopLeft}
                        >
                            {availableLoanInterestRate}
                        </FieldData>
                        <FieldData
                            label={t('pageHeader.loans.fields.availableLoanCreditRate')}
                            variant={FieldDataVariant.Large}
                            tooltipTitle={t('pageHeader.loans.fields.availableLoanCreditRate') as string}
                            tooltipBody={t('pageHeader.loans.fields.availableLoanCreditRatePopover') as string}
                            tooltipPlacement={PopoverPlacement.TopLeft}
                        >
                            {availableLoanCreditRate}
                        </FieldData>
                    </>
                )}
            </div>
            <div className="mt-8 bg-gray-50 px-8 py-4">
                {isStillInactive.loanPageHeader ? (
                    // https://zinnia.atlassian.net/browse/DEPU-1936
                    <TempNavInactive tooltipBody={isStillInactive.loanPageHeader}>
                        {t('transactions.loans.header.startLoan')}
                    </TempNavInactive>
                ) : isEligible ? (
                    <NavElement
                        data-testid={LoansTest.START_LOAN_LINK}
                        size={NavElementSize.Small}
                        className="mr-5"
                        type={NavElementType.Button}
                    >
                        {t('transactions.loans.header.startLoan')}
                    </NavElement>
                ) : (
                    <Tooltip placement={PopoverPlacement.TopRight} body={ineligibilityMessage}>
                        <span
                            className="mr-8 cursor-not-allowed font-primary text-links-sm font-semibold text-gray-300"
                            data-testid={LoansTest.START_LOAN_LINK_DISABLED}
                        >
                            {t('transactions.loans.header.startLoan')}
                        </span>
                    </Tooltip>
                )}
            </div>
        </>
    );

    return (
        <PageHeader
            headerText={t(`transactions.loans.header.loansTitle`) || ''}
            breadcrumbText={breadcrumbText}
            breadcrumbUrl={breadcrumbUrl}
            headerTextSiblingsGroupOne={headerTextSiblingsGroupOne}
            headerRowFlexClassNames={headerRowFlexClassNames}
            groupOneFlexClassNames={groupOneFlexClassNames}
            belowHeaderTextChildren={belowHeaderTextChildren}
        />
    );
};
export default LoansPageHeaderContainer;
