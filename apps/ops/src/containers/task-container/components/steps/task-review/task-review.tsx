import { Icon, IconType } from '@zinnia/bloom/components';
import { convertToCamelCase } from '@zinnia/utils';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import Radio from '@deps/components/radio/radio';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';

import { useGetCaseDocs } from './task-review.helper';

interface TaskReviewProps {
    caseId: string;
    clientCode: string;
    docType: string;
    activeDocType: DocumentTypeView;
    taskType: string;
}

export const TaskReview = ({ clientCode, activeDocType, taskType }: TaskReviewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${convertToCamelCase(taskType)}.taskReview` });
    const { setIsReadyForDataEntry, isReadyForDataEntry } = useContext(TaskDataContext);

    const [sectionOption, setSectionOption] = useState(isReadyForDataEntry ? 'true' : 'false');
    const [loading, getCaseDocs, workingDocument] = useGetCaseDocs();
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
        getCaseDocs();
    }, [getCaseDocs]);

    const onOptionSelection = (value: string) => {
        setSectionOption(value);
        setIsReadyForDataEntry(value === 'true');
    };

    const { documentName, documentId } = workingDocument?.[0] || {};

    return (
        <>
            <div className="flex flex-col">
                {!loading && workingDocument && (
                    <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]">
                        <div>
                            <Icon width={20} height={20} type={IconType.DOCUMENT_TEXT} />{' '}
                        </div>
                        <div>
                            <div className="text-sm font-bold">{documentName}</div>
                        </div>
                        <div className="flex items-center">
                            <DocumentPreviewer
                                className="flex gap-1"
                                activeDocType={activeDocType}
                                carrier={clientCode?.toUpperCase()}
                                documentId={documentId || ''}
                                displayName={documentName ?? ''}
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
