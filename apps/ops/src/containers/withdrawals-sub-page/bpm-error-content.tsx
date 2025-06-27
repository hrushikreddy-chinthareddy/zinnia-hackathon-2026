import { ArrangementType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { FieldSize, FieldType } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';

export const BPMErrorContent = ({
    effectiveDate,
    label,
    type,
}: {
    effectiveDate?: string;
    label?: string;
    type: ArrangementType;
}) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'transactions.cancelAutopay',
    });
    return (
        <div className="flex flex-col">
            <div
                className="flex gap-1 cursor-pointer text-[#00628B]"
                id="cancel_systematic_withdrawal"
            >
                {type === ArrangementType.WITHDRAWAL
                    ? t('cancelWithdrawal')
                    : t('cancelRmd')}
            </div>
            <div>
                <div className="gap-3 max-w-[160px] pt-6">
                    <FieldDateSelect
                        label={t('effectiveDate') as string}
                        id="effectiveDate"
                        isFutureDateDisabled={false}
                        onChange={() => {}}
                        formatOptions={{ format: '##/##/####' }}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={effectiveDate ?? ''}
                        labelTooltip={t(`effectivedate`) as string}
                        labelTooltipBody={t(`effectivedate`) as string}
                        placeholder={t(`selectdate`) as string}
                        isPastDateDisabled
                    />
                </div>

                <div className="pt-6">
                    <CheckboxText
                        label={label ?? ''}
                        checked={true}
                        isDisabled
                    />
                </div>
            </div>
        </div>
    );
};
