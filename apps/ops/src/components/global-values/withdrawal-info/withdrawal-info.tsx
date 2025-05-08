import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

interface WithdrawalInfoProps {
    amount: number;
}

export const WithdrawalInfo = ({ amount }: WithdrawalInfoProps) => {
    const { t } = useTranslation();

    return (
        <div className="mt-4 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-8 lg:mt-0 xl:justify-between">
            <div className="flex shrink-0 flex-row gap-8">
                <div className="flex flex-col gap-[5px]">
                    <Label
                        variant={LabelVariant.FieldLabel}
                        label={t('withdrawals.requestedWithdrawal.label')}
                        tooltipTitle={t('withdrawals.requestedWithdrawal.label')}
                        tooltipBody={t('withdrawals.requestedWithdrawal.tooltip')}
                    />
                    <Content variant={ContentVariant.Value} details={numberFormatify(amount)} />
                </div>
                {/* this should be conditional showing on step 4 */}
                <div className="flex flex-col gap-[5px]">
                    <Label
                        variant={LabelVariant.FieldLabel}
                        label={t('withdrawals.totalPayment.label')}
                        tooltipTitle={t('withdrawals.totalPayment.label')}
                        tooltipBody={t('withdrawals.totalPayment.tooltip')}
                    />
                    <Content variant={ContentVariant.Value} details={numberFormatify(amount)} />
                </div>
            </div>
        </div>
    );
};
