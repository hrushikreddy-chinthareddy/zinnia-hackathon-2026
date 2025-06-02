import { LoanSegment } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import { TFunction, useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import PolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { useContentContext } from '@deps/contexts/LayoutContexts/StaticContentContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { rateFormatted } from '@deps/helpers/data-transform.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString, isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { ReactComponent as CircleExclamationIcon } from '@deps/styles/elements/icons/circles/circle-exclamation.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import SideSheetLoanAdditionalInfo from './side-sheet-loan-additional-info';

interface ActiveCardProps {
    currency?: string;
    lastLoanInterestDueDate?: string;
    loanNumber: number;
    loanSegment: LoanSegment;
    t: TFunction;
    totalActiveLoans: number;
}

interface OutstandingLoansCardProps {
    currency?: string;
    loanSegments?: LoanSegment[];
    lastLoanInterestDueDate?: string;
}

const ActiveCard = ({ currency, lastLoanInterestDueDate, loanNumber, loanSegment, t, totalActiveLoans }: ActiveCardProps) => {
    const { globalValuesData } = useContentContext();
    const sideSheet = useSideSheetContext();
    const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency };

    const { loanBalance, startDate, loanAccruedInterest, loanInterestRate } = loanSegment;

    const loanBalanceValue = !isNullEmptyOrUndefined(loanBalance)
        ? numberFormatify(loanBalance as number, currencyFormat)
        : DEFAULT_ERROR_STRING;
    const ytdInterestValue = !isNullEmptyOrUndefined(loanAccruedInterest)
        ? numberFormatify(loanAccruedInterest as number, currencyFormat)
        : DEFAULT_ERROR_STRING;
    const loanInterestRateValue = rateFormatted(loanInterestRate);

    const openSideSheet = () => {
        sideSheet.changeSideSheetContent(
            <PolicyInfo tooltipPlacements={PopoverPlacement.BottomLeft} {...globalValuesData} openSideSheet={undefined} />,
            <SideSheetLoanAdditionalInfo currencyFormat={currencyFormat} loanRepaymentType={'UL'} loanSegment={loanSegment} />
        );
        sideSheet.handleOpen(true);
    };

    return (
        <div
            className={clsx(
                'relative flex flex-col flex-wrap items-start justify-between gap-x-8 gap-y-6 self-stretch overflow-hidden rounded-md border-2 border-gray-100 p-4 md:flex-row md:p-6 lg:p-8',
                { 'pt-[44px]': totalActiveLoans > 1 }
            )}
        >
            {totalActiveLoans > 1 && (
                <p className="absolute left-0 top-0 bg-gray-900 px-2 py-1 font-primary text-sm font-semibold text-white">
                    {t('loanNumber', { loanNumber })}
                </p>
            )}
            <div className="grid grid-cols-[repeat(2,minmax(min-content,max-content))] gap-x-8 gap-y-4 md:flex md:flex-wrap">
                <div>
                    <Label className="flex h-[24px] items-center" label={t('loanBalance')} variant={LabelVariant.FieldLabel} />
                    <Content details={loanBalanceValue} variant={ContentVariant.Value} />
                    {!isNullEmptyOrUndefined(startDate) && (
                        <Content
                            className="text-gray-600"
                            details={t('loanStartDate', { loanStartDate: convertKebabedDateString(startDate) }) as string}
                            variant={ContentVariant.Caption}
                        />
                    )}
                </div>
                <div>
                    <Label
                        className="flex h-[24px] items-center"
                        label={t('ytdInterest')}
                        sentenceCase={false}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content details={ytdInterestValue} variant={ContentVariant.Value} />
                    {!isNullEmptyOrUndefined(lastLoanInterestDueDate) && (
                        <Content
                            className="text-gray-600"
                            details={t('interestDate', { interestDate: convertKebabedDateString(lastLoanInterestDueDate) }) as string}
                            variant={ContentVariant.Caption}
                        />
                    )}
                </div>
                <div>
                    <Label
                        className="flex h-[24px] items-center"
                        label={t('interestRate')}
                        tooltipBody={t('interestRateTooltip')}
                        tooltipTitle={t('interestRate')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content details={loanInterestRateValue} variant={ContentVariant.Value} />
                </div>
            </div>
            <NavElement
                onClick={openSideSheet}
                size={NavElementSize.Small}
                type={NavElementType.Button}
                variant={NavElementVariant.Default}
            >
                {t('additionalLoanInformation')}
            </NavElement>
        </div>
    );
};

const InactiveCard = ({ t }: { t: TFunction }) => {
    return (
        <div className="flex gap-1 rounded-md border-2 border-dashed border-gray-100 bg-gray-50 p-8">
            <CircleExclamationIcon width={16} height={16} role="presentation" />
            <p className="font-primary text-content-caption font-semibold">{t('inactiveCard')}</p>
        </div>
    );
};

const OutstandingLoansCard = ({ currency, loanSegments = [], lastLoanInterestDueDate }: OutstandingLoansCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'transactions.loans.detailCards.outstandingLoans' });
    const activeLoanSegments = loanSegments.filter(loanSegment => Number(loanSegment?.loanBalance) > 0);
    const activeCards = activeLoanSegments.map((loanSegment, index) => (
        <ActiveCard
            currency={currency}
            key={loanSegment.segmentId}
            lastLoanInterestDueDate={lastLoanInterestDueDate}
            loanNumber={index + 1}
            loanSegment={loanSegment}
            totalActiveLoans={activeLoanSegments.length}
            t={t}
        />
    ));
    return (
        <CardContainer containerClassNames="rounded-b">
            <Typography variant={TypographyVariant.H2}>{t('headline')}</Typography>
            <div className="flex flex-col gap-1">{activeCards.length ? activeCards : <InactiveCard t={t} />}</div>
        </CardContainer>
    );
};

export default OutstandingLoansCard;
