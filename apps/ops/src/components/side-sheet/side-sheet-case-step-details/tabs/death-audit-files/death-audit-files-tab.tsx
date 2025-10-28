import { useQuery } from '@tanstack/react-query';
import {
    TabContent,
    TabGroup,
    TabList,
    TabTrigger,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { CaseAdditionalStepData as CaseAdditionalStepDataBase } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';

import DeathAuditFiles from './death-audit-files';
import { getDetails } from './death-audit-files.helpers';
import {
    DeathAuditCaseFileTypes,
    DeathAuditFileTypes,
} from './death-audit-files.types';

export interface DeathAuditFileProcessingProps {
    stepAdditionalData: CaseAdditionalStepDataBase;
    prop: string;
    objectKey?: string;
}

enum DeathAuditTabOptions {
    matchedCase = 'Matched Case',
    cancelledCase = 'Cancelled Case',
}

const DeathAuditFilesTab = ({
    stepAdditionalData,
    prop,
    objectKey = '',
}: DeathAuditFileProcessingProps) => {
    const { t } = useTranslation();
    const entityId = stepAdditionalData.value;

    const [activeTab, setActiveTab] = useState(
        DeathAuditTabOptions.matchedCase
    );
    const handleTabChange = (value: string) =>
        setActiveTab(value as DeathAuditTabOptions);
    const {
        data: transactionEntity,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['deathAuditFileRecord', entityId],
        queryFn: () => getTransactionEntityQuery(entityId),
    });

    const { files, summary } = getDetails(
        transactionEntity,
        prop,
        objectKey
    ) || {
        files: [],
        summary: {},
    };

    const displayIsLoading = () => {
        return (
            <div className="flex w-full flex-col">
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        className="shrink-0 text-gray-600 transform-origin-center duration-5000 animate-spin ease-linear"
                        aria-hidden={true}
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className="text-gray-600"
                    >
                        {t('deathAuditQualification.loadingTransactions')}
                    </Typography>
                </div>
            </div>
        );
    };

    const displayError = () => {
        return (
            <div className="flex w-full flex-col">
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        aria-hidden={true}
                        className="shrink-0 text-gray-600"
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className="text-gray-600"
                    >
                        {t('receiveNewDocument.errorGettingTransactions')}
                    </Typography>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return displayIsLoading();
    }

    if (isError) {
        return displayError();
    }

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
