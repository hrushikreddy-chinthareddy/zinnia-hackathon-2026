import { Loader, TabGroup, TabList, TabTrigger, TabContent, Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { TranslationFiles } from '@deps/config/translations';
import { createAction } from '@deps/containers/subpages/documents-sub-page/documents-results-table';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { PolicyDocument } from '@deps/models/case/document';
import { Policy } from '@deps/models/policy/sor-policy';

import { useGetPolicyTypeDocs } from '../steps/service-form-review/service-form-review.helper';

export enum TabOptions {
    Working = 'Working',
    Related = 'Related',
}

type DocumentViewProps = {
    policy?: Policy;
    documentNumber: string;
    docType: string;
};

const DocumentPortalPanel = ({ policy, documentNumber, docType }: DocumentViewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.documentPanel' });
    const [activeTab, setActiveTab] = useState(TabOptions.Working);
    const clientCode = policy?.carrierId || '';
    const [loading, getPolicyDocs, workingDocument, relatedDocument] = useGetPolicyTypeDocs(
        policy?.policyNumber || '',
        policy?.carrierId || '',
        docType,
        documentNumber
    );

    useEffect(() => {
        getPolicyDocs();
    }, []);

    const handleTabChange = (value: string) => setActiveTab(value as TabOptions);

    console.log("??relatedDocument", relatedDocument);
    console.log("??workingDocument", workingDocument)
    const renderDocumentSection = (document: any, displayName: string, clientCode: string) => {
        return (
            <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]" key={document.documentId}>
                <div>
                    <Icon width={20} height={20} type={IconType.DOCUMENT_TEXT} />{' '}
                </div>
                <div>
                    <div className="text-sm font-bold"><PiiWrapper>{displayName}</PiiWrapper></div>
                    <div className="flex items-center text-sm font-normal text-gray-300">
                        <PiiWrapper>
                            {t('documentId') + ': ' + document.documentNumber}
                        </PiiWrapper>
                    </div>
                </div>
                <div className="flex items-center">
                    {createAction(document, clientCode.toUpperCase(), t)}
                </div>
            </div>
        );
    };

    const renderTabContent = (
        <>
            <TabContent className="flex w-full flex-col items-center" value={TabOptions.Working}>
                {workingDocument && renderDocumentSection(workingDocument, workingDocument?.displayName || '', clientCode)}
                {isNullEmptyOrUndefined(workingDocument) &&
                <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]">
                <div className="text-sm font-bold"><PiiWrapper>Looks like there is't any documents to display.</PiiWrapper></div>
            </div>
                }
            </TabContent>
            <TabContent className="flex w-full flex-col items-center" value={TabOptions.Related}>
                {relatedDocument?.length !== 0 && (
                    <>
                        {relatedDocument?.map((item: PolicyDocument) => (
                            renderDocumentSection(item, item?.displayName || '', clientCode)
                        ))}
                    </>
                )}
                {relatedDocument?.length === 0 || isNullEmptyOrUndefined(relatedDocument) && (
                    <div className="border-box w-full lg:px-[30px] mt-2">
                        <div className="w-full rounded border-2 border border-gray-100 bg-gray-50 p-8">
                            <AssistiveText
                                text={t('noFormAvailable')}
                                variant={AssistiveTextVariant.Default}
                                iconOverride={<Icon width={16} height={16} type={IconType.DOCUMENT_TEXT} />}
                            />
                        </div>
                    </div>
                )}
            </TabContent>
        </>
    );

    return (
        <div>
            <TabGroup defaultValue={activeTab} value={activeTab} activationMode="manual" onValueChange={handleTabChange}>
                <TabList className="!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8">
                    <TabTrigger value={TabOptions.Working}>{t('tabs.working') ?? ''}</TabTrigger>
                    <TabTrigger value={TabOptions.Related}>{t('tabs.related') ?? ''}</TabTrigger>
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
