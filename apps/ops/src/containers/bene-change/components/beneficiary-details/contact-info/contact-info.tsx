import { useTranslation } from 'next-i18next';

import Radio, { RadioItem } from '@deps/components/radio/radio';
import { TranslationFiles } from '@deps/config/translations';
import { PreferredCommunicationType } from '@deps/models/policy/sor-policy';

export default function ContactInfo() {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange.beneDetails.contactInfo' });

    const items: RadioItem[] = [
        { label: t('labels.options.phone'), value: PreferredCommunicationType.PHONE },
        { label: t('labels.options.email'), value: PreferredCommunicationType.EMAIL },
        { label: t('labels.options.fax'), value: PreferredCommunicationType.FAX },
    ];

    return (
        <div>
            <Radio 
                label={t('labels.preferredContactMethod') as string}
                items={items} required={true}
                value={''} 
                onChange={() => {}} 
            />
        </div>
    );
}



