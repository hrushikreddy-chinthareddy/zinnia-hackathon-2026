import { Icon, IconType } from '@zinnia/bloom/components';
import { convertToCamelCase } from '@zinnia/utils';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import Radio from '@deps/components/radio/radio';
import Select from '@deps/components/select/select';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { ExceptionRef } from '@deps/models/case/task';
import { searchNigoExceptionRefs } from '@deps/queries/api/v1/exceptionRefs';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { useGetCaseDocs } from './task-review.helpers';

interface TaskReviewProps {
    caseId: string;
    clientCode: string;
    activeDocType: DocumentTypeView;
    taskType: string;
    setNmDetails: (nmDetails: { nmId: string; nmDetails: string }) => void;
    selectedExceptionDetails: string[];
    setSelectedExceptionDetails: (selectedExceptionDetails: string[]) => void;
}

export const TaskReview = ({
    clientCode,
    activeDocType,
    taskType,
    setNmDetails,
    selectedExceptionDetails,
    setSelectedExceptionDetails,
}: TaskReviewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${convertToCamelCase(taskType)}.taskReview` });
    const { setIsReadyForDataEntry, isReadyForDataEntry } = useContext(TaskDataContext);

    const [sectionOption, setSectionOption] = useState(isReadyForDataEntry === true ? 'true' : '');

    const [loading, getCaseDocs, workingDocument] = useGetCaseDocs();
    const [selectedOption, setSelectedOption] = useState<{ [key: string]: string }>({});
    const [exceptionOptions, setExceptionOptions] = useState<ExceptionRef[]>([]);

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
    const missingDetailsNmId = 'SU.EM.048';

    useEffect(() => {
        getCaseDocs();
    }, [getCaseDocs]);

    useEffect(() => {
        const fetchExceptionRefs = async () => {
            try {
                const data = await searchNigoExceptionRefs();

                const missingInfoReason = data.find((item: any) => item.nmId === missingDetailsNmId);
                if (missingInfoReason) {
                    const uniqueExceptions = missingInfoReason.exceptionSubRefs.reduce((unique: ExceptionRef[], item: ExceptionRef) => {
                        const exists = unique.some(u => u.subNmIdDetail === item.subNmIdDetail);
                        if (!exists) {
                            unique.push(item);
                        }
                        return unique;
                    }, []);

                    setExceptionOptions(uniqueExceptions);
                    setNmDetails({
                        nmId: missingInfoReason.nmId,
                        nmDetails: missingInfoReason.reason,
                    });
                }
            } catch (error) {
                browserLogError('fetchExceptionRefs::Error fetching refs', {
                    ...parseErrorInformation(error),
                });
            }
        };

        fetchExceptionRefs();
    }, [setNmDetails]);

    const onOptionSelection = (value: string) => {
        setSectionOption(value);
        setIsReadyForDataEntry(value === 'true');
    };

    const handleExceptionChange = (subNmIdDetail: string) => {
        setSelectedOption(prevOptions => {
            if (prevOptions[subNmIdDetail]) {
                const { [subNmIdDetail]: removed, ...rest } = prevOptions;
                return rest;
            } else {
                return { ...prevOptions, [subNmIdDetail]: subNmIdDetail };
            }
        });

        const exists = selectedExceptionDetails.includes(subNmIdDetail);
        if (exists) {
            setSelectedExceptionDetails(selectedExceptionDetails.filter(item => item !== subNmIdDetail));
        } else {
            setSelectedExceptionDetails([...selectedExceptionDetails, subNmIdDetail]);
        }
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
                {sectionOption === 'false' && (
                    <div className="ml-6">
                        <div className="mb-4 mt-12 w-[436px]">
                            <Select
                                isMultiselect
                                options={exceptionOptions.reduce(
                                    (unique, item, index) => {
                                        const existingItem = unique.find(u => u.value === item.subNmIdDetail);
                                        if (!existingItem) {
                                            unique.push({
                                                key: `option-${item.subNmId}-${index}`,
                                                label: item.subNmIdDetail,
                                                value: item.subNmIdDetail,
                                                displayText: item.subNmIdDetail,
                                            });
                                        }
                                        return unique;
                                    },
                                    [] as Array<{
                                        key: string;
                                        label: string;
                                        value: string;
                                        displayText: string;
                                    }>
                                )}
                                value={selectedOption}
                                onChange={handleExceptionChange}
                                placeholder={t('selectException') as string}
                            />
                        </div>
                        {selectedExceptionDetails?.length > 0 && (
                            <div className="bg-[--color-grayscale-color-100-gray] p-5 w-[500px] rounded-md">
                                <Typography variant={TypographyVariant.LabelAlt} className="mb-2">
                                    These issues will be created for the Case:
                                </Typography>
                                <ul className="list-disc pl-5">
                                    {selectedExceptionDetails.map((detail, index) => (
                                        <li key={index}>
                                            <Typography variant={TypographyVariant.BodyParagraph} className="text-gray-700">
                                                {detail}
                                            </Typography>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};
