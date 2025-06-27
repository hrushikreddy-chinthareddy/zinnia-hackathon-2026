import { LoanSegment, LoanType } from '@zinnia/api-types/types/sor';
import { TFunction, useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { rateFormatted } from '@deps/helpers/data-transform.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export type SideSheetLoanAdditionalInfoProps = {
    currencyFormat: Intl.NumberFormatOptions;
    loanRepaymentType: string | null;
    loanSegment: LoanSegment;
};

const getLoanRepaymentType = (
    loanRepaymentType: string | null,
    t: TFunction
) => {
    if (loanRepaymentType === null) {
        return DEFAULT_ERROR_STRING;
    }

    return loanRepaymentType === 'UL'
        ? t('interestFirst')
        : t('principalFirst');
};

export default function SideSheetLoanAdditionalInfo({
    currencyFormat,
    loanRepaymentType,
    loanSegment,
}: SideSheetLoanAdditionalInfoProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactions.loans.detailCards.additionalInformation',
    });
    const {
        loanPrincipal,
        loanCollateralAmount: loanCollateralAmount,
        loanCreditRate,
        loanCollateralAccruedInterest,
        generalLedgerFundCode,
        loanType,
    } = loanSegment;
    const formattedLoanType =
        loanType === LoanType.NONPREFERREDSTANDARDLOAN
            ? t('standard')
            : t('preferred');
    const repaymentType = getLoanRepaymentType(loanRepaymentType, t);

    return (
        <div className="flex flex-col p-8">
            <Typography variant={TypographyVariant.H2}>
                {t('header')}
            </Typography>
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="w-250">
                    <Label
                        label={t('loanPrincipal')}
                        tooltipBody={t('loanPrincipalTooltip')}
                        tooltipTitle={t('loanPrincipal')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={numberFormatify(
                            loanPrincipal as number,
                            currencyFormat
                        )}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div className="w-250">
                    <Label
                        label={t('loanCollateral')}
                        tooltipBody={t('loanCollateralTooltip')}
                        tooltipTitle={t('loanCollateral')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={numberFormatify(
                            loanCollateralAmount as number,
                            currencyFormat
                        )}
                        variant={ContentVariant.BodySm}
                    />
                    <Content
                        className="text-gray-600"
                        details={`YTD credit ${numberFormatify(
                            loanCollateralAccruedInterest as number,
                            currencyFormat
                        )}`}
                        variant={ContentVariant.Caption}
                    />
                </div>
                <div className="w-250">
                    <Label
                        label={t('creditRate')}
                        tooltipBody={t('creditRateTooltip')}
                        tooltipTitle={t('creditRate')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        // details={`${percentFormatify((loanCreditRate as number) * 100, { isInteger: true })}`}
                        details={rateFormatted(loanCreditRate)}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div className="w-250">
                    <Label
                        label={t('glLoanCode')}
                        variant={LabelVariant.FieldLabel}
                        sentenceCase={false}
                    />
                    <Content
                        details={generalLedgerFundCode ?? DEFAULT_ERROR_STRING}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div className="w-250">
                    <Label
                        label={t('loanType')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={formattedLoanType}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div className="w-250">
                    <Label
                        label={t('loanRepaymentType')}
                        tooltipBody={t('loanRepaymentTypeTooltip')}
                        tooltipTitle={t('loanRepaymentType')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={repaymentType}
                        variant={ContentVariant.BodySm}
                    />
                </div>
            </div>
        </div>
    );
}
