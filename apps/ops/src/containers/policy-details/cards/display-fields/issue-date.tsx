import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';

interface IssueDateProps {
    issueDate?: string;
}

const IssueDate = ({ issueDate }: IssueDateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.detailCards.policyTimeline',
    });

    return (
        <div>
            <Label label={t('issueDate')} variant={LabelVariant.FieldLabel} />
            <Content details={issueDate} variant={ContentVariant.BodySm} />
        </div>
    );
};

export default IssueDate;
