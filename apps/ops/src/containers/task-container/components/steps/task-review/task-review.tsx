import { Icon, IconType } from '@zinnia/bloom/components';
import { convertToCamelCase } from '@zinnia/utils';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import Radio from '@deps/components/radio/radio';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import { TranslationFiles } from '@deps/config/translations';

import { useGetPolicyTypeDocs } from './task-review.helper';

interface TaskReviewProps {
    policyNumber: string;
    clientCode: string;
    docType: string;
    documentNumber: string;
    activeDocType: DocumentTypeView;
    taskType: string;
}

export const TaskReview = ({ policyNumber, clientCode, docType, documentNumber, taskType, activeDocType }: TaskReviewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${convertToCamelCase(taskType)}.taskReview` });

    const [sectionOption, setSectionOption] = useState('true');
    const [loading, getPolicyDocs, workingDocument] = useGetPolicyTypeDocs(policyNumber, clientCode, docType, documentNumber);
    const sectionOptions = [
        {
            label: t('options.allSectionsAreComplete'),
            value: 'true',
        },
        {
            label: t('options.missingDetails'),
            value: 'false',
        },
    ];

    useEffect(() => {
        getPolicyDocs();
    }, []);

    const onOptionSelection = (value: string) => {
        setSectionOption(value);
    };

    const { displayName } = workingDocument || {};

    return (
        <>
            <div className="flex flex-col">
                {!loading && workingDocument && (
                    <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]">
                        <div>
                            <Icon width={20} height={20} type={IconType.DOCUMENT_TEXT} />{' '}
                        </div>
                        <div>
                            <div className="text-sm font-bold">{displayName}</div>
                            <div className="flex items-center text-sm font-normal text-gray-300">
                                {t('documentId') + ' ' + documentNumber}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <DocumentPreviewer
                                className="flex gap-1"
                                activeDocType={activeDocType}
                                carrier={clientCode?.toUpperCase()}
                                documentId={workingDocument?.documentId ?? (workingDocument?.documentID as string)}
                                displayName={displayName}
                            >
                                <>{t('view')}</>
                            </DocumentPreviewer>
                        </div>
                    </div>
                )}
                <Radio items={sectionOptions} label={''} onChange={event => onOptionSelection(event.target.value)} value={sectionOption} />
            </div>
        </>
    );
};
