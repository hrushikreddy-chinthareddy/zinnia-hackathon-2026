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
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { PolicyDocument } from '@deps/models/case/document';
import { Policy } from '@zinnia/api-types/types/sor';

import { useGetPolicyTypeDocs } from '../steps/service-form-review/service-form-review.helpers';

export enum TabOptions {
    Working = 'Working',
    Related = 'Related',
}

type DocumentViewProps = {
    policy?: Policy;
    documentNumber: string;
    docType: string;
    policyNumber: string;
    clientCode: string;
};

const DocumentPortalPanel = ({
    documentNumber,
    docType,
    policyNumber,
    clientCode,
}: DocumentViewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'nigoEntry.documentPanel',
    });
    const [activeTab, setActiveTab] = useState(TabOptions.Working);
    const [loading, getPolicyDocs, workingDocument, relatedDocument] =
        useGetPolicyTypeDocs(policyNumber, clientCode, docType, documentNumber);

    useEffect(() => {
        getPolicyDocs();
    }, []);

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
                            {t('documentId') + ': ' + document.documentNumber}
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

    const displayNoFormAvailable = () => {
        return (
            <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]">
                <div className="text-sm font-bold">
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
        );
    };

    const renderTabContent = (
        <>
            <TabContent
                className="flex w-full flex-col items-center"
                value={TabOptions.Working}
            >
                {workingDocument &&
                    renderDocumentSection(
                        workingDocument,
                        workingDocument?.displayName || '',
                        clientCode
                    )}
                {isNullEmptyOrUndefined(workingDocument) &&
                    displayNoFormAvailable()}
            </TabContent>
            <TabContent
                className="flex w-full flex-col items-center"
                value={TabOptions.Related}
            >
                {relatedDocument?.length !== 0 && (
                    <>
                        {relatedDocument?.map((item: PolicyDocument) =>
                            renderDocumentSection(
                                item,
                                item?.displayName || '',
                                clientCode
                            )
                        )}
                    </>
                )}
                {relatedDocument?.length === 0 && displayNoFormAvailable()}
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
