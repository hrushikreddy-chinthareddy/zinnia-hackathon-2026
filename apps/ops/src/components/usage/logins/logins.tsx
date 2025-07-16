import { useTranslation } from 'react-i18next';

import { MyPolicyViewUniqueLogins } from './mypolicyview-unique-logins';
import { ZinniaLiveUniqueLogins } from './zinnia-live-unique-logins';

export const Logins = () => {
    const { t } = useTranslation();

    return (
        <div className="flex gap-4 m-4">
            <ZinniaLiveUniqueLogins
                title={t('usage.logins.zinniaLive.title')}
            />
            <MyPolicyViewUniqueLogins
                title={t('usage.logins.myPolicyView.title')}
            />
        </div>
    );
};
