import { Loader , TabGroup, TabList, TabTrigger, TabContent } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyDocument } from '@deps/models/case/document';
import { Policy } from '@deps/models/policy/sor-policy';

import DocumentItem from './document-portal-item';
import { useGetPolicyTypeDocs } from '../steps/service-form-review/service-form-review.helper';

export enum TabOptions {
    Working = 'Working',
    Related = 'Related',
}

type DocumentViewProps = {
    policy: Policy;
    documentNumber: string;
    docType: string;
};

const DocumentPortalPanel = ({ policy, documentNumber, docType }: DocumentViewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.documentPanel' });
    const [activeTab, setActiveTab] = useState(TabOptions.Working);

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

    const renderTabContent = (
        <>
            <TabContent className="flex w-full flex-col items-center" value={TabOptions.Working}>
                <DocumentItem
                    document={workingDocument}
                    documentNumber={documentNumber}
                    policy={policy}
                    activeDocType={DocumentTypeView.Policy}
                />
            </TabContent>
            <TabContent className="flex w-full flex-col items-center" value={TabOptions.Related}>
                {relatedDocument?.length !== 0 && (
                    <>
                        {relatedDocument?.map((item: PolicyDocument) => (
                            <DocumentItem
                                key={item?.documentNumber}
                                document={item}
                                documentNumber={item?.documentNumber}
                                policy={policy}
                                activeDocType={DocumentTypeView.Policy}
                            />
                        ))}
                    </>
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
