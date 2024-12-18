import { useUser } from '@auth0/nextjs-auth0/client';
import { Icon, IconType, Link, Loader, TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Label, { LabelVariant } from '@deps/components/label/label';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { parseAndFormatDate, toSentenceCase } from '@deps/helpers/string.helper';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { getTaskInstance } from '@deps/queries/api/v2/task';
import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as CircleCheckedIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as CircleStoppedIcon } from '@deps/styles/elements/icons/circles/stop-circle.svg';
import { ReactComponent as UserCircleIcon } from '@deps/styles/elements/icons/icons_outlined/user-circle.svg';
import { DEFAULT_DATE_FORMAT, NUMERIC_DATE_FORMAT } from '@deps/types/constants';

const TaskTypeMap: Record<string, string> = {
    ['SUITABILITY_REVIEW']: 'suitability review',
};

export enum TabOptions {
    Details = 'Details',
    History = 'History',
    Documents = 'Documents',
}

export default function NewTaskSideSheet({ taskId }: { taskId: string }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<ManagementTask | null>(null);
    const [activeTab, setActiveTab] = useState(TabOptions.Details);
    const { user } = useUser();

    const handleTabChange = (value: string) => setActiveTab(value as TabOptions);

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

    const { unit: createdUnit, count: createdCount } = getTimeAgoUnitValue(task.createdAt) || {};
    const formattedCreated = parseAndFormatDate(NUMERIC_DATE_FORMAT, DEFAULT_DATE_FORMAT, task.createdAt);

    const renderDetails = (
        <div className="flex flex-col w-full">
            <label className="font-primary text-lg mt-10">{t('sideSheet.task.tabs.details')}</label>
            <div className="flex flex-col items-start justify-center gap-1 border-b-2 border-gray-100 py-4 last:border-b-0">
                <div className="flex flex-row items-center gap-1">
                    <Label label={t('sideSheet.task.status.label')} variant={LabelVariant.FieldLabel} className="w-[100px] py-2" />
                    <div className="flex items-center">
                        {task.status == TaskStatus.New && <NotStartedIcon width={16} height={16} className="text-gray-300" />}
                        {task.status == TaskStatus.InProgress && (
                            <CircleCheckedIcon width={16} height={16} className="mr-1 text-semantic-success" />
                        )}
                        {task.status == TaskStatus.Completed && <CircleStoppedIcon width={16} height={16} className="mr-2 text-gray-300" />}

                        <Typography variant={TypographyVariant.BodySm} className="py-2 pr-6">
                            {toSentenceCase(task.status)}
                        </Typography>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-1">
                    <Label label={t('sideSheet.task.assigneeLabel')} variant={LabelVariant.FieldLabel} className="w-[100px] py-2" />
                    <div className="flex p-1 shrink-0 rounded border-gray-200">
                        <div className="pt-2">
                            <UserCircleIcon width={24} height={24} />
                        </div>

                        <Typography variant={TypographyVariant.BodySm} className="py-2 px-2">
                            {user?.name}
                        </Typography>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-1">
                    <Label label={t('sideSheet.task.createdLabel')} variant={LabelVariant.FieldLabel} className="w-[100px] py-2" />
                    <Typography variant={TypographyVariant.BodySm} className="py-2">
                        {formattedCreated}
                        <span className="text-gray-600">
                            &nbsp;
                            {`(${t('temporal.timeago', { formattedDate: '', count: createdCount, unit: createdUnit }).trim()})`}
                        </span>
                    </Typography>
                </div>

                <div className="flex flex-row items-center gap-1">
                    <Label label={t('sideSheet.task.stepLabel')} variant={LabelVariant.FieldLabel} className="w-[100px] py-2" />
                    <Typography variant={TypographyVariant.BodySm} className="py-2">
                        {toSentenceCase(task.taskName)}
                    </Typography>
                </div>

                <div className="flex flex-row items-center gap-1">
                    <Label label={t('sideSheet.task.issueLabel')} variant={LabelVariant.FieldLabel} className="w-[100px] py-2" />
                    <Typography variant={TypographyVariant.BodySm} className="text-semantic-error py-2">
                        {t('sideSheet.task.commonTaskIssues', {
                            taskType: TaskTypeMap[task.taskType],
                        })}
                    </Typography>
                </div>

                <div className="flex flex-row items-center gap-1">
                    <Label label={t('sideSheet.task.detailsLabel')} variant={LabelVariant.FieldLabel} className="w-[100px] py-2" />
                    <div className="pl-14">
                        <Typography variant={TypographyVariant.BodySm} className="py-2">
                            {t('sideSheet.task.taskDetails', {
                                taskType: TaskTypeMap[task.taskType],
                            })}
                        </Typography>
                    </div>
                </div>
                {(task.status === TaskStatus.New || task.status === TaskStatus.InProgress) && (
                    <div className="flex flex-row items-center gap-1 pt-8">
                        <Link href={`/task/${task.id}`} text="Start task" variant="button" size="small"></Link>
                    </div>
                )}
            </div>
        </div>
    );

    const renderHistory = (
        <div className="flex flex-col w-full">
            <label className="font-primary text-lg mt-10">{t('sideSheet.task.tabs.history')}</label>
            <div className="border-box w-full  mt-2">
                <div className="w-full rounded border-2 border-gray-100 bg-gray-50 p-8">
                    <AssistiveText
                        text={t('sideSheet.task.noDataAvailable')}
                        variant={AssistiveTextVariant.Default}
                        iconOverride={<Icon width={16} height={16} type={IconType.DOCUMENT_TEXT} />}
                    />
                </div>
            </div>
        </div>
    );
    const renderDocuments = (
        <div className="flex flex-col w-full">
            <label className="font-primary text-lg mt-10">{t('sideSheet.task.tabs.documents')}</label>
            <div className="border-box w-full  mt-2">
                <div className="w-full rounded border-2 border-gray-100 bg-gray-50 p-8">
                    <AssistiveText
                        text={t('sideSheet.task.noDataAvailable')}
                        variant={AssistiveTextVariant.Default}
                        iconOverride={<Icon width={16} height={16} type={IconType.DOCUMENT_TEXT} />}
                    />
                </div>
            </div>
        </div>
    );

    const renderTabContent = (
        <>
            <TabContent className="flex px-10 flex-col items-center" value={TabOptions.Details}>
                {renderDetails}
            </TabContent>
            <TabContent className="flex px-10 w-full flex-col items-center" value={TabOptions.History}>
                {renderHistory}
            </TabContent>
            <TabContent className="flex px-10  w-full flex-col items-center" value={TabOptions.Documents}>
                {renderDocuments}
            </TabContent>
        </>
    );

    return (
        <div>
            <TabGroup defaultValue={activeTab} value={activeTab} activationMode="manual" onValueChange={handleTabChange}>
                <TabList className="!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8">
                    <TabTrigger value={TabOptions.Details}>{t('sideSheet.task.tabs.details') ?? ''}</TabTrigger>
                    <TabTrigger value={TabOptions.History}>{t('sideSheet.task.tabs.history') ?? ''}</TabTrigger>
                    <TabTrigger value={TabOptions.Documents}>{t('sideSheet.task.tabs.documents') ?? ''}</TabTrigger>
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
}
