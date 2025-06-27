import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

interface AccountValueProps {
    accountValue?: number;
}

const AccountValue = ({ accountValue }: AccountValueProps) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);

    return (
        <div>
            <Label
                variant={LabelVariant.FieldLabel}
                label={t('colDefs:policySummary.accountValue')}
                tooltipTitle={t('colDefs:policySummary.accountValue')}
                tooltipBody={t('colDefs:policySummary.accountValueTooltip')}
            />
            <Content
                details={numberFormatify(accountValue)}
                variant={ContentVariant.BodySm}
            />
        </div>
    );
};

export default AccountValue;
