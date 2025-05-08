import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';

interface IssueDateProps {
    issueDate?: string;
}

const IssueDate = ({ issueDate }: IssueDateProps) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);

    return (
        <div>
            <Label variant={LabelVariant.FieldLabel} label={t('colDefs:policySummary.issueDate')} />
            <Content details={convertKebabedDateString(issueDate)} variant={ContentVariant.BodySm} />
        </div>
    );
};

export default IssueDate;
