import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';

interface FreeLookCancelDateProps {
    freeLookCancelDate?: string;
}

const FreeLookCancelDate = ({
    freeLookCancelDate,
}: FreeLookCancelDateProps) => {
    const { t } = useTranslation([TranslationFiles.COMMON]);

    return (
        <div>
            <Label
                variant={LabelVariant.FieldLabel}
                label={t(
                    'policy.detailCards.policyTimeline.freeLookExpiration'
                )}
            />
            <Content
                details={convertKebabedDateString(freeLookCancelDate)}
                variant={ContentVariant.BodySm}
            />
        </div>
    );
};

export default FreeLookCancelDate;
