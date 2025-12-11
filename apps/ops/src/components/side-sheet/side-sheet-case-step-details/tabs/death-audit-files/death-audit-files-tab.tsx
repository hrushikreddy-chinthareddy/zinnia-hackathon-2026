import {
    TabContent,
    TabGroup,
    TabList,
    TabTrigger,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { CaseAdditionalStepData as CaseAdditionalStepDataBase } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

import DeathAuditFiles from './death-audit-files';
import {
    DeathAuditCaseFileTypes,
    DeathAuditFileTypes,
} from './death-audit-files.types';

export interface DeathAuditFileProcessingProps {
    stepAdditionalData: CaseAdditionalStepDataBase;
}

enum DeathAuditTabOptions {
    matchedCase = 'Matched Case',
    cancelledCase = 'Cancelled Case',
}

const DeathAuditFilesTab = ({
    stepAdditionalData,
}: DeathAuditFileProcessingProps) => {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState(
        DeathAuditTabOptions.matchedCase
    );

    const handleTabChange = (value: string) =>
        setActiveTab(value as DeathAuditTabOptions);

    const renderTabContent = (
        <>
            <TabContent
                className="flex w-full flex-col py-6"
                value={DeathAuditTabOptions.matchedCase}
            >
                <DeathAuditFiles
                    stepAdditionalData={stepAdditionalData}
                    prop={DeathAuditFileTypes.INBOUND}
                    objectKey={DeathAuditCaseFileTypes.MATCHED_CASES_FILE}
                    title={t('deathAuditFiles.tabs.matchedCase')}
                />
            </TabContent>
            <TabContent
                className="flex w-full flex-col py-6"
                value={DeathAuditTabOptions.cancelledCase}
            >
                <DeathAuditFiles
                    stepAdditionalData={stepAdditionalData}
                    prop={DeathAuditFileTypes.INBOUND}
                    objectKey={DeathAuditCaseFileTypes.CANCELLED_CASES_FILE}
                    title={t('deathAuditFiles.tabs.cancelledCase')}
                />
            </TabContent>
        </>
    );

    return (
        <div>
            <TabGroup
                defaultValue={activeTab}
                value={activeTab}
                activationMode="manual"
                onValueChange={handleTabChange}
            >
                <TabList className="!mb-0 w-full pt-4">
                    <TabTrigger value={DeathAuditTabOptions.matchedCase}>
                        {t('deathAuditFiles.tabs.matchedCase')}
                    </TabTrigger>
                    <TabTrigger value={DeathAuditTabOptions.cancelledCase}>
                        {t('deathAuditFiles.tabs.cancelledCase')}
                    </TabTrigger>
                </TabList>
                {renderTabContent}
            </TabGroup>
        </div>
    );
};

export default DeathAuditFilesTab;
