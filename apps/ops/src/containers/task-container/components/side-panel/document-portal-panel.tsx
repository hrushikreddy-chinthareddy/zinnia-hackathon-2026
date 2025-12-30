import {
    Loader,
    TabGroup,
    TabList,
    TabTrigger,
    TabContent,
    Icon,
    IconType,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { TranslationFiles } from '@deps/config/translations';
import { createViewDownloadAction } from '@deps/containers/subpages/documents-sub-page/documents-results-table';
import { TaskDocument } from '@deps/models/case/task-instance';

import { useGetCaseDocs } from '../steps/task-review/task-review.helpers';

export enum TabOptions {
    Working = 'Working',
    Related = 'Related',
}

type DocumentViewProps = {
    clientCode: string;
    documents: TaskDocument[];
};

const DocumentPortalPanel = ({ clientCode, documents }: DocumentViewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'task.documentPanel',
    });

    const [activeTab, setActiveTab] = useState(TabOptions.Working);

    const [loading, getCaseDocs, workingDocument, relatedDocument] =
        useGetCaseDocs();

    useEffect(() => {
        getCaseDocs(documents);
    }, [documents]);

    const handleTabChange = (value: string) =>
        setActiveTab(value as TabOptions);

    const renderDocumentSection = (
        document: any,
        displayName: string,
        clientCode: string
    ) => {
        return (
            <div
                className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]"
                key={document.documentId}
            >
                <div>
                    <Icon
                        width={20}
                        height={20}
                        type={IconType.DOCUMENT_TEXT}
                    />{' '}
                </div>
                <div>
                    <div className="text-sm font-bold">
                        <PiiWrapper>{displayName}</PiiWrapper>
                    </div>
                    <div className="flex items-center text-sm font-normal text-gray-300">
                        <PiiWrapper>
                            {t('documentId') + ': ' + document.documentId}
                        </PiiWrapper>
                    </div>
                </div>
                <div className="flex items-center">
                    {createViewDownloadAction(
                        document,
                        clientCode.toUpperCase(),
                        t
                    )}
                </div>
            </div>
        );
    };

    const renderTabContent = (
        <>
            <TabContent
                className="flex w-full flex-col items-center"
                value={TabOptions.Working}
            >
                {workingDocument &&
                    workingDocument?.length !== 0 &&
                    workingDocument?.map((item: TaskDocument) =>
                        renderDocumentSection(
                            item,
                            item?.documentName || '',
                            clientCode
                        )
                    )}

                {(!workingDocument || workingDocument?.length === 0) && (
                    <div className="border-box w-full lg:px-[30px] mt-2">
                        <div className="w-full rounded border-2 border-gray-100 bg-gray-50 p-8">
                            <AssistiveText
                                text={t('noFormAvailable')}
                                variant={AssistiveTextVariant.Default}
                                iconOverride={
                                    <Icon
                                        width={16}
                                        height={16}
                                        type={IconType.DOCUMENT_TEXT}
                                    />
                                }
                            />
                        </div>
                    </div>
                )}
            </TabContent>
            <TabContent
                className="flex w-full flex-col items-center"
                value={TabOptions.Related}
            >
                {relatedDocument &&
                    relatedDocument?.length !== 0 &&
                    relatedDocument?.map((item: TaskDocument) =>
                        renderDocumentSection(
                            item,
                            item?.documentName || '',
                            clientCode
                        )
                    )}
                {(!relatedDocument || relatedDocument?.length === 0) && (
                    <div className="border-box w-full lg:px-[30px] mt-2">
                        <div className="w-full rounded border-2  border-gray-100 bg-gray-50 p-8">
                            <AssistiveText
                                text={t('noFormAvailable')}
                                variant={AssistiveTextVariant.Default}
                                iconOverride={
                                    <Icon
                                        width={16}
                                        height={16}
                                        type={IconType.DOCUMENT_TEXT}
                                    />
                                }
                            />
                        </div>
                    </div>
                )}
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
                <TabList className="!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8">
                    <TabTrigger value={TabOptions.Working}>
                        {t('tabs.working') ?? ''}
                    </TabTrigger>
                    <TabTrigger value={TabOptions.Related}>
                        {t('tabs.related') ?? ''}
                    </TabTrigger>
                </TabList>
                {loading ? (
                    <div className="my-5 flex flex-col items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    renderTabContent
                )}
            </TabGroup>
        </div>
    );
};

export default DocumentPortalPanel;
