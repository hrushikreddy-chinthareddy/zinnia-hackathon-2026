import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    isNullEmptyOrUndefined,
    toSentenceCase,
} from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { LoanValues } from '@zinnia/api-types/types/sor';

export interface LoanRulesCardProps {
    currency?: string;
    loanValues?: LoanValues;
}

const LoanRulesCard = ({ currency, loanValues }: LoanRulesCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactions.loans.detailCards.loanRules',
    });

    const { loanInterestMethod, maximumLoanAmount, minimumLoanAmount } =
        loanValues ?? {};

    const currencyFormat: Intl.NumberFormatOptions = {
        style: 'currency',
        currency,
    };
    const minimumLoanAmountValue = !isNullEmptyOrUndefined(minimumLoanAmount)
        ? numberFormatify(minimumLoanAmount, currencyFormat)
        : numberFormatify(0, currencyFormat);
    const maximumLoanAmountValue = !isNullEmptyOrUndefined(maximumLoanAmount)
        ? numberFormatify(maximumLoanAmount, currencyFormat)
        : DEFAULT_ERROR_STRING;
    const loanInterestMethodValue = !isNullEmptyOrUndefined(loanInterestMethod)
        ? toSentenceCase(loanInterestMethod as string)
        : DEFAULT_ERROR_STRING;

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H2}>
                {t('headline')}
            </Typography>
            <div className="mt-4 grid grid-cols-[repeat(2,minmax(min-content,max-content))] gap-x-8 gap-y-4 md:flex md:flex-wrap">
                <div>
                    <Label
                        label={t('minLoanAmt')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={minimumLoanAmountValue}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label
                        label={t('maxLoanAmt')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={maximumLoanAmountValue}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label
                        label={t('loanInterestMethod')}
                        tooltipBody={t('loanInterestMethodTooltip')}
                        tooltipTitle={t('loanInterestMethod')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={loanInterestMethodValue as string}
                        variant={ContentVariant.BodySm}
                    />
                </div>
            </div>
        </CardContainer>
    );
};

export default LoanRulesCard;
