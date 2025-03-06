import { Link } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import CallLogCard from '@deps/components/card/card-call-log/card-call-log';
import { formatTimestamp } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import Label, { LabelVariant } from '@deps/components/label/label';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { formatDateTime } from '@deps/helpers/string.helper';
import { TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskComment, TaskStatus } from '@deps/models/case/task-instance';
import { getTaskInstance } from '@deps/queries/api/v2/task';
import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as CircleCheckedIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as ChatIcon } from '@deps/styles/elements/icons/icons_outlined/chat-2.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

const SpecificTaskBody = (task: ManagementTask) => {
    const { t } = useTranslation();
    let body;

    switch (task.taskType) {
        case TaskType.SuitabilityReview:
            body = (
                <div className="flex flex-col items-start gap-8 border-b-2 border-gray-100 p-8 last:border-b-0">
                    <div className="flex flex-row">
                        <Link href={`/task/${task.id}`} text="Start task" variant="button" size="small"></Link>
                    </div>
                </div>
            );
            break;
        case 'Suitability':
        case 'SDP Suitability':
            body = (
                <div className="flex flex-col items-start gap-8 border-b-2 border-gray-100 p-8 last:border-b-0">
                    <div className="flex flex-row">
                        <Label
                            label={t('sideSheet.suitability.suitabilityStatus.header')}
                            variant={LabelVariant.FieldLabel}
                            className="w-[140px] py-1"
                        />
                        <Typography variant={TypographyVariant.BodySm}>{task.data?.suitabilityStatus || DEFAULT_ERROR_STRING}</Typography>
                    </div>
                </div>
            );
            break;
        default:
            body = null;
            break;
    }
    return body;
};

export default function TaskSideSheet({ taskId }: { taskId: string }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<ManagementTask | null>(null);

    useEffect(() => {
        const getTaskData = async () => {
            const data = await getTaskInstance({ taskId });
            setTask(data);
            setLoading(false);
        };
        getTaskData();
    }, [taskId]);

    if (loading) return <PageLoader variant={PageLoaderVariant.Center} />;

    if (!task) return null;

    const formattedCreated = formatDateTime(task.createdAt);
    const formattedUpdated = formatDateTime(task.updatedAt);
    const isClosed = task.status === TaskStatus.Closed;
    const closedContext = isClosed && formattedUpdated ? formatTimestamp(formattedUpdated) : DEFAULT_ERROR_STRING;

    const noCommentsAvailable = !task.data || !task.data?.notes || task.data?.notes?.length === 0;
    const descendingByDateComments = task.data?.notes?.sort((a: TaskComment, b: TaskComment) => {
        return dayjs(a.submissionDate).isBefore(b.submissionDate) ? 1 : -1;
    });

    return (
        <div className="flex flex-col">
            <div className="flex flex-col items-start justify-center gap-1 border-b-2 border-gray-100 p-8 last:border-b-0">
                <div className="flex flex-row items-center gap-1">
                    <Label
                        label={t('sideSheet.suitability.taskLabel')}
                        sentenceCase={false}
                        variant={LabelVariant.FieldLabel}
                        className="w-[75px] py-2"
                    />
                    <Typography variant={TypographyVariant.BodySm}>{task.id}</Typography>
                </div>

                <div className="flex flex-row items-center gap-1">
                    <Label label={t('sideSheet.suitability.status.label')} variant={LabelVariant.FieldLabel} className="w-[75px] py-2" />
                    <div className="flex items-center">
                        {task.status == 'Open' && <NotStartedIcon width={16} height={16} className="mr-2 text-gray-300" />}
                        {task.status == 'Closed' && <CircleCheckedIcon width={16} height={16} className="mr-1 text-semantic-success" />}
                        <Typography variant={TypographyVariant.BodySm} className="py-2 pr-6">
                            {task.status}
                        </Typography>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-1">
                    <Label label={t('sideSheet.suitability.createdLabel')} variant={LabelVariant.FieldLabel} className="w-[75px] py-2" />
                    <Typography variant={TypographyVariant.BodySm} className="py-2">
                         {formattedCreated ? formatTimestamp(formattedCreated) : 'N/A'}
                    </Typography>
                </div>

                <div className="flex flex-row items-center gap-1">
                    <Label label={t('sideSheet.suitability.closedLabel')} variant={LabelVariant.FieldLabel} className="w-[75px] py-2" />
                    <Typography variant={TypographyVariant.BodySm}>{closedContext}</Typography>
                </div>
            </div>
            <SpecificTaskBody {...task} />
            <div className="flex flex-col items-start border-gray-100 p-8">
                <Typography variant={TypographyVariant.H3} className="">
                    {t('sideSheet.suitability.comments.header')}
                </Typography>

                {task.data?.notes && (
                    <div className="w-full">
                        {descendingByDateComments.map((note: TaskComment, index: number) => {
                            const summary = [note.commentSubCategory, note.commentDetail, note.description, note.comment]
                                .filter(Boolean)
                                .join('. ');

                            return (
                                <CallLogCard
                                    key={index}
                                    summary={summary || `${t('sideSheet.suitability.comments.noSummaryAvailable')} Note id: ${note.noteId}`}
                                    tag={note.commentCategory ?? undefined}
                                    isSecondaryPage
                                    className="px-0 py-4"
                                    createdAt={note.submissionDate ?? undefined}
                                />
                            );
                        })}
                    </div>
                )}
                {noCommentsAvailable && (
                    <div className="mt-4 flex w-[-webkit-fill-available] flex-row items-center rounded border-2 border-dashed border-gray-100 bg-gray-50 p-4">
                        <ChatIcon width={16} height={16} className="mr-1" />
                        <Typography variant={TypographyVariant.Label}>{t('sideSheet.suitability.comments.noComments')}</Typography>
                    </div>
                )}
            </div>
        </div>
    );
}
