import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';

const PendingTag = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactions.pendingTag',
    });

    return (
        <div className="my-[3px] ml-1 inline-flex items-center justify-center rounded-md border border-semantic-pending bg-semantic-pending-light px-2">
            <p className="font-primary text-[12px] font-semibold leading-[16px] text-semantic-pending">
                {t('label')}
            </p>
        </div>
    );
};

export default PendingTag;
