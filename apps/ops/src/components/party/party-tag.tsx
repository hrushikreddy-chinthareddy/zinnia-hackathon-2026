import { Tag, type TagProps } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import { PartyStatus } from '@zinnia/api-types/types/sor';

interface PartyTagProps extends TagProps {
    partyStatus?: PartyStatus;
    text: string;
}

const PartyTag = ({ partyStatus, text, ...props }: PartyTagProps) => {
    const { t } = useTranslation();
    let displayText = text;

    // DEPU-3651 we need to append the unapproved tag.
    // It's intentially translated separately from the original tag
    // update language to excluded DEPU-3697
    if (partyStatus === PartyStatus.NOTAPPROVED) {
        displayText = `${displayText} - ${t('excluded')}`;
    }
    return (
        <Tag text={displayText} {...props}>
            {displayText}
        </Tag>
    );
};

export default PartyTag;
