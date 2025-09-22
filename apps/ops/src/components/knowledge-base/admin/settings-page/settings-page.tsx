import { IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';

import CommonHeader from '../../common-header/common-header';
import SettingsTab, { SettingsTabEnum } from '../settings-tab/settings-tab';
import SystemUsersTab from '../system-users/system-users-tab';
import TenantsTab from '../tenants/tenants-tab';

const SettingsPage = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const settingsPages = [
        {
            label: t('admin.tenants.header'),
            value: SettingsTabEnum.TENANTS,
            icon: IconType.USER_GROUP,
            content: <TenantsTab />,
        },
        {
            label: t('admin.users.header'),
            value: SettingsTabEnum.SYSTEM_USERS,
            icon: IconType.TEMPLATE,
            content: <SystemUsersTab />,
        },
    ];
    return (
        <div className="flex flex-col gap-8 px-6">
            <CommonHeader />
            <div>
                <SettingsTab tabs={settingsPages} />
            </div>
        </div>
    );
};

export default SettingsPage;
