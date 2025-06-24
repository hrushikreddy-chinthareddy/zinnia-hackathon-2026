import { useQuery } from '@tanstack/react-query';
import { Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import BadgeWithTooltip from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import PageHeader from '@deps/components/page-header/page-header';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Tooltip from '@deps/components/tooltip/tooltip';
import { TranslationFiles } from '@deps/config/translations';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helpers';
import { numberFormatify, percentFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { LoansTest } from '@deps/jest/constants/test-id-constants';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { getBorrowingInterestRate, getLoanInterestRate } from '@deps/queries/api/product-rate';
import { checkNewLoanEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

interface LoansContainerProps {
    policy: Policy;
    loanCarryingBalance: boolean;
}

const LoansPageHeaderContainer = ({ policy, loanCarryingBalance }: LoansContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const [availableLoanInterestRate, setAvailableLoanInterestRate] = useState(t('general.loadingThing', { thing: t('general.rate') }));
    const [availableLoanCreditRate, setAvailableLoanCreditRate] = useState(t('general.loadingThing', { thing: t('general.rate') }));
    const policyDetails = new PolicyDetails(policy);

    useEffect(() => {
        const getLoanRates = async () => {
            const [loanInterestRate, loanCreditRate] = await Promise.all([
                getLoanInterestRate(policyDetails),
                getBorrowingInterestRate(policyDetails),
            ]);
            setAvailableLoanCreditRate(percentFormatify(loanCreditRate, { isInteger: true }));
            setAvailableLoanInterestRate(percentFormatify(loanInterestRate, { isInteger: true }));
        };

        getLoanRates();
    }, []);

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

    const { data: newLoanEligibility, isLoading: isLoadingNewLoanEligibility } = useQuery({
        queryKey: ['checkNewLoanEligibility', policy.product?.planCode, policy.policyNumber, policy.loanValues?.maximumLoanAmount],
        queryFn: () =>
            checkNewLoanEligibilityQuery(
                policy.product?.planCode as string,
                policy.policyNumber as string,
                policy.loanValues?.maximumLoanAmount
            ),
        placeholderData: previousData => previousData,
        select: data => {
            return {
                ...data,
                isEligibleNewLoan: data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const headerTextSiblingsGroupOne = (
        <>
            {!isLoadingNewLoanEligibility && (
                <BadgeWithTooltip
                    className="mb-2 mt-2 self-center"
                    label={newLoanEligibility?.isEligibleNewLoan ? 'Eligible' : 'Ineligible'}
                    variant={newLoanEligibility?.isEligibleNewLoan ? BadgeVariant.Positive : BadgeVariant.Negative}
                    tooltipPlacement={PopoverPlacement.BottomRight}
                    tooltip={
                        t(
                            `transactions.loans.header.${newLoanEligibility?.isEligibleNewLoan ? 'eligiblePopover' : 'ineligiblePopover'}`
                        ) as string
                    }
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
                {newLoanEligibility?.isEligibleNewLoan ? (
                    <NavElement
                        className="mr-5"
                        data-testid={LoansTest.START_LOAN_LINK}
                        href={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/loans/new-loan`}
                        size={NavElementSize.Small}
                        type={NavElementType.Link}
                    >
                        {t('transactions.loans.header.startLoan')}
                    </NavElement>
                ) : (
                    <Tooltip placement={PopoverPlacement.TopRight} body={formatValidationResult(newLoanEligibility?.validationResult)}>
                        <NavElement
                            className="mr-5"
                            data-testid={LoansTest.START_LOAN_LINK}
                            href={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/loans/new-loan`}
                            size={NavElementSize.Small}
                            type={NavElementType.Link}
                            disabled={true}
                        >
                            {t('transactions.loans.header.startLoan')}
                        </NavElement>
                    </Tooltip>
                )}
            </div>
        </>
    );

    return (
        <PageHeader
            headerText={t(`pageHeader.loans.headerText`) || ''}
            headerTextSiblingsGroupOne={headerTextSiblingsGroupOne}
            headerRowFlexClassNames={headerRowFlexClassNames}
            groupOneFlexClassNames={groupOneFlexClassNames}
            belowHeaderTextChildren={belowHeaderTextChildren}
        />
    );
};

export default LoansPageHeaderContainer;
