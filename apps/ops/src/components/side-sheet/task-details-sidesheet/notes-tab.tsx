import { useQuery } from '@tanstack/react-query';
import { Icon, IconType, Loader } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useMemo, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import UnauthorizedCard from '@deps/components/card/card-unauthorized';
import PaginationControls from '@deps/components/pagination/pagination';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { createViewDownloadAction } from '@deps/containers/subpages/documents-sub-page/documents-results-table';
import { DocumentWithSource } from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { sortByAndThenBy } from '@deps/helpers/sort.helpers';
import { TaskType } from '@deps/models/case/task';
import { ManagementTask, Note } from '@deps/models/case/task-instance';
import { NotesResponse, searchNotesByCaseId } from '@deps/queries/api/notes';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    DEFAULT_DATE_DISPLAY_FORMAT,
    DEFAULT_DATETIME_DISPLAY_FORMAT,
} from '@deps/types/constants';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { DocumentTypeView } from '../documents/DocumentTypeView';

const NotesTab = ({ task }: { task: ManagementTask }) => {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const isCarrierExternalTaskNotesEnabled =
        featureFlags?.[FEATURE_FLAGS.CREATE_CARRIER_EXTERNAL_TASK] ?? false;
    const [notesOffset, setNotesOffset] = useState(0);

    const limit = 25;

    const {
        data: notesData,
        isLoading: notesIsLoading,
        isError: notesIsError,
        error: notesError,
    } = useQuery<NotesResponse[] | null, Error>({
        queryKey: ['taskNotes', task?.externalId, notesOffset],
        queryFn: () =>
            searchNotesByCaseId({
                externalTaskId: task?.externalId ?? '',
                entityType: 'TASK_NOTES',
            }),
        enabled: !!task?.externalId && isCarrierExternalTaskNotesEnabled,
    });

    const goToPage = useCallback(
        (pageNumber: number) => {
            setNotesOffset((pageNumber - 1) * limit);
        },
        [limit]
    );

    const processedNotes = useMemo(() => {
        if (!notesData) {
            return [];
        }

        const allNotes: Note[] = notesData.flatMap(
            (record) => record.entity.notesDetails.notes
        );

        const sortedNotes = sortByAndThenBy(allNotes, 'commentedOn').reverse();

        const groupedByDate = sortedNotes.reduce((acc, note) => {
            const date = dayjs(note.commentedOn).format(
                DEFAULT_DATE_DISPLAY_FORMAT
            );
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(note);
            return acc;
        }, {} as Record<string, Note[]>);

        const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
            return (
                dayjs(b, DEFAULT_DATE_DISPLAY_FORMAT).valueOf() -
                dayjs(a, DEFAULT_DATE_DISPLAY_FORMAT).valueOf()
            );
        });

        return sortedDates.map((date) => {
            const notes = groupedByDate[date];
            return {
                date,
                items: notes.flatMap((note) => {
                    const details: any[] = [];
                    const time = dayjs(note.commentedOn).format(
                        DEFAULT_DATETIME_DISPLAY_FORMAT
                    );

                    if (note.taskType === TaskType.External) {
                        if (note.result) {
                            details.push({
                                label: t('allFields.carrierResponse'),
                                value: note.result,
                            });
                        }
                        if (note.comments) {
                            details.push({
                                label: t('allFields.carrierNotes'),
                                value: note.comments,
                                attachments: note.attachments,
                                time: time,
                            });
                        }
                    } else if (note.taskType === TaskType.Internal) {
                        if (note.comments) {
                            details.push({
                                label: t('allFields.processorNotes'),
                                value: note.comments,
                                attachments: note.attachments,
                                time: time,
                            });
                        }
                    }
                    return details;
                }),
            };
        });
    }, [notesData, t]);
    if (notesIsLoading) {
        return (
            <div className="p-8">
                <Loader />
            </div>
        );
    }

    if ((notesError as any)?.response?.status === StatusCode.Forbidden) {
        return <UnauthorizedCard />;
    }

    if (notesIsError || !notesData?.length) {
        return (
            <div className="flex justify-center">
                <CardInfo
                    icon={
                        <Icon
                            width={50}
                            height={50}
                            className="text-gray-300"
                            type={IconType.DOCUMENT_TEXT}
                        />
                    }
                    title={t('sideSheet.notesEmptyTitle')}
                    subtitle={t('sideSheet.notesEmptyText')}
                    className="mt-8"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full">
            <label className="font-primary text-lg mt-8">
                {t('sideSheet.task.tabs.notes')}
            </label>
            {processedNotes.map((group, groupIndex) => (
                <div
                    key={groupIndex}
                    className={`pt-6 ${
                        groupIndex > 0 ? 'border-t border-gray-100' : ''
                    }`}
                >
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="font-bold mb-4"
                    >
                        {group.date}
                    </Typography>
                    <div className="grid grid-cols-3 gap-y-4 text-sm">
                        {group.items.map((item: any, itemIndex: number) => (
                            <React.Fragment key={itemIndex}>
                                <div className="col-span-1 text-gray-500">
                                    {item.label}
                                </div>
                                <div className="col-span-2 flex flex-col">
                                    <span>{item.value}</span>
                                    {item.attachments &&
                                        item.attachments.map(
                                            (
                                                attachment: any,
                                                attIndex: number
                                            ) => {
                                                const doc = {
                                                    documentId:
                                                        attachment.documentId,
                                                    displayName:
                                                        attachment.documentName,
                                                    documentSource:
                                                        DocumentTypeView.Correspondence,
                                                    fileType: 'pdf',
                                                } as DocumentWithSource;
                                                return (
                                                    <div
                                                        key={attIndex}
                                                        className="mt-1"
                                                    >
                                                        {createViewDownloadAction(
                                                            doc,
                                                            task.carrier,
                                                            t,
                                                            attachment.documentName
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    {item.time && (
                                        <span className="text-gray-400 mt-1 text-xs">
                                            {item.time}
                                        </span>
                                    )}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            ))}
            <div className="mx-auto my-6">
                <PaginationControls
                    total={processedNotes.length as number}
                    limit={limit}
                    offset={notesOffset}
                    goToPage={goToPage}
                />
            </div>
        </div>
    );
};

export default NotesTab;
