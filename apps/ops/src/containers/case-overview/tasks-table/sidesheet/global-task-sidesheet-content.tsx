import { useUser } from '@auth0/nextjs-auth0/client';
import { Button, Icon, IconType, Loader, TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helper';
import Content, { ContentVariant } from '@deps/components/content/content';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { parseAndFormatDate, toSentenceCase } from '@deps/helpers/string.helper';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import { ManagementTask, TaskStatus, TaskLabel, DocumentData } from '@deps/models/case/task-instance';
import { claimTask } from '@deps/queries/api/v1/task';
import { getTaskInstance, updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as ChevronDownIcon } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as BanIcon } from '@deps/styles/elements/icons/content/ban.svg';
import { ReactComponent as ClipboardIcon } from '@deps/styles/elements/icons/content/clipboard-1.svg';
import { ReactComponent as ClipboardListIcon } from '@deps/styles/elements/icons/content/clipboard-list.svg';
import { ReactComponent as Pause } from '@deps/styles/elements/icons/icons_outlined/pause.svg';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_DISPLAY_FORMAT, NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { writeToCache } from '@deps/utils/cache';
import { parseErrorInformation } from '@deps/utils/server-logging';
import router from 'next/router';
import { TaskSource } from '@deps/models/case/task';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { searchDocumentsV3 } from '@deps/queries/api/client/documents/v3/search';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { createAction } from '@deps/containers/subpages/documents-sub-page/documents-results-table';
import { V3DocumentWithSource } from '@deps/types/documents-v3';
import CustomLoader from '@deps/components/loader/customLoader';
import { DocumentsLimit } from '@deps/constants/case';

export enum TabOptions {
    Details = 'Details',
    Documents = 'Documents',
}

export interface DocumentItemProps {
    document: DocumentData;
    taskCarrier: string;
}

export default function GlobalTaskSideSheet({ taskId, type = 'case' }: { taskId: string; type?: string }) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<ManagementTask | null>(null);
    const [activeTab, setActiveTab] = useState(TabOptions.Details);
    const [claimTaskLoader, setClaimTaskLoader] = useState(false);
    const [additionalDocuments, setAdditionalDocuments] = useState<DocumentData[]>([]);
    const [showAdditionalDocuments, setShowAdditionalDocuments] = useState(false);
    const [errorDocuments, setErrorDocuments] = useState(false);
    const [startLoader, setStartLoader] = useState(false);

    const handleTabChange = (value: string) => setActiveTab(value as TabOptions);
    const [timer] = useState(performance.now());

    const { user } = useUser();
    const sideSheet = useSideSheetContext();

    const transformDocument = (documents: DocumentData[]) => {
        const transformedDocuments = documents.map((doc: DocumentData) => ({
            documentId: doc.documentId || doc.documentID,
            displayName: doc.displayName
                ? doc.displayName
                : doc.documentName
                ? doc.documentName
                : doc.sourceFileName
                ? doc.sourceFileName
                : '',
            documentNumber: doc.documentNumber,
            fileType: doc.fileType || doc.documentSource || 'pdf',
            documentSource: DocumentTypeView.Case,
        }));
        return transformedDocuments;
    };

    const fetchAdditionalDocuments = async ({ carrier, caseId }: { carrier: string; caseId: string }) => {
        let searchBody: SearchRequest = {
            documentClassification: SearchRequest.documentClassification.INBOUND,
            zinniaLiveCaseId: caseId,
            parentCarrierCode: carrier,
        };
        try {
            const { data, error } = await searchDocumentsV3({ limit: DocumentsLimit, offset: 0, searchBody });

            if (data?.documents) {
                const filteredDocuments = transformDocument(data.documents);
                setAdditionalDocuments(filteredDocuments);
            } else if (error) {
                setErrorDocuments(true);
                browserLogError('fetchAdditionalDocuments::Error fetching additional documents', {
                    ...parseErrorInformation(error),
                    carrier,
                    caseId,
                    fileName: 'global-task-sidesheet-content',
                });
            }
        } catch (err) {
            setErrorDocuments(true);
            browserLogError('fetchAdditionalDocuments::Unexpected error occurred', {
                ...parseErrorInformation(err),
                carrier,
                caseId,
                fileName: 'global-task-sidesheet-content',
            });
        }
    };

    const handleClaimTask = async () => {
        if (task) {
            setClaimTaskLoader(true);
            try {
                const response = await claimTask(task.caseId, task.id);
                if (response.id == task.id && user?.email) {
                    setTask({
                        ...task,
                        assignee: user.email,
                    });
                    writeToCache(
                        'getTaskInstance',
                        { taskId },
                        {
                            ...task,
                            assignee: user.email,
                        }
                    );
                    browserLogInfo('task-queue:handleClaimTask::Successfully claimed task', { taskId: taskId });
                } else {
                    browserLogInfo('task-queue:handleClaimTask::An error occurred while claiming the task', {
                        taskId: taskId,
                        status: response?.status,
                    });
                }
            } catch (e) {
                browserLogError('task-queue:handleClaimTask::Error claiming task', {
                    ...parseErrorInformation(e),
                    taskId: task.id,
                    caseId: task.caseId,
                });
                return;
            } finally {
                setClaimTaskLoader(false);
            }
        }
    };

    const handleStart = async (taskId: string, taskStatus: TaskStatus) => {
        try {
            setStartLoader(true);
            if (taskStatus === TaskStatus.InProgress) {
                await router.push(`/task/${taskId}`);
            } else {
                // Fetch the task instance
                const taskData = await getTaskInstance({ taskId });
                if (!taskData) {
                    browserLogError('handleStartTask::Task data could not be retrieved.', {
                        taskId,
                        fileName: 'global-task-sidesheet-content',
                    });
                    return;
                }
                const body = {
                    ...taskData,
                    status: TaskStatus.InProgress,
                    source: TaskSource.ZinniaTaskManagement,
                };
                const response = await updateTask(taskData.caseId, taskData.id, body, timer);
                if (response) {
                    await router.push(`/task/${taskId}`);
                    return;
                }
            }
        } catch (error) {
            browserLogError('handleStartTask::Error handling start task', {
                ...parseErrorInformation(error),
                taskId,
                fileName: 'global-task-sidesheet-content',
            });
        } finally {
            setStartLoader(false);
        }
    };

    useEffect(() => {
        const getTaskData = async () => {
            const data = await getTaskInstance({ taskId });
            if (data && data.carrier && data.caseId) {
                fetchAdditionalDocuments({ carrier: data.carrier, caseId: data.caseId });
            }
            setTask(data);
            setLoading(false);
        };
        getTaskData();
    }, [taskId]);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );

    if (!task) return null;

    const { unit: createdUnit, count: createdCount } = getTimeAgoUnitValue(task.createdAt) || {};
    const formattedCreated = parseAndFormatDate(NUMERIC_DATE_FORMAT, DEFAULT_DATE_FORMAT, task.createdAt);
    const formattedUpdated = parseAndFormatDate(NUMERIC_DATE_FORMAT, DEFAULT_DATE_FORMAT, task.updatedAt);
    const formattedPending = parseAndFormatDate(NUMERIC_DATE_FORMAT, DEFAULT_DATE_FORMAT, task.impededTillDate);

    const userExists =
        user?.email?.toLowerCase() !== '' &&
        (user?.email?.toLowerCase() === task.assignee?.toLowerCase() ||
            task.prefferedAssignee?.toLowerCase() === user?.email?.toLowerCase());

    const documentsList = transformDocument(task.mappedDocuments || []);

    const showStartButton = task.status === TaskStatus.New || task.status === TaskStatus.InProgress || task.status === TaskStatus.Pending;
    const statusReason = task.status === TaskStatus.Pending ? task.impededReason : task.cancellationReason;

    let badgeIcon, badgeVariant, badgeLabel;

    switch (task.status) {
        case TaskStatus.Completed:
            badgeIcon = <CircleCheckIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Success;
            badgeLabel = TaskLabel.Completed;
            break;
        case TaskStatus.Canceled:
            badgeIcon = <BanIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Inactive;
            badgeLabel = TaskLabel.Canceled;
            break;
        case TaskStatus.InProgress:
            badgeIcon = <ClipboardListIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Info;
            badgeLabel = TaskLabel.InProgress;
            break;
        case TaskStatus.Pending:
            badgeIcon = <Pause height={16} width={16} />;
            badgeVariant = BadgeVariant.Error;
            badgeLabel = TaskLabel.Pending;
            break;
        default:
            badgeIcon = <ClipboardIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Info;
            badgeLabel = TaskLabel.New;
            break;
    }

    const NoAssigneeComp = (
        <div className="flex gap-2 text-gray-600">
            <span>No assignee</span>
            {task.status === TaskStatus.New &&
                (!claimTaskLoader ? (
                    <button className="text-blue-600 hover:text-blue-700 hover:underline focus:outline-none" onClick={handleClaimTask}>
                        {t('sideSheet.task.claimTask')}
                    </button>
                ) : (
                    <CustomLoader />
                ))}
        </div>
    );


    const EmptyState = ({ content }: { content: string }) => {
        return (
            <div className="w-full rounded border-2 border-gray-100 bg-gray-50 p-8">
                <AssistiveText
                    text={content}
                    variant={AssistiveTextVariant.Default}
                    iconOverride={<Icon width={16} height={16} type={IconType.DOCUMENT_TEXT} />}
                />
            </div>
        );
    };

    const DocumentItem = ({ document, taskCarrier }: DocumentItemProps) => {
        return (
            <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px] gap-2" key={document.documentId}>
                <div>
                    <Icon width={20} height={20} type={IconType.DOCUMENT_TEXT} />
                </div>
                <div>
                    <div className="text-sm font-bold break-all">
                        <PiiWrapper>{document.displayName ?? ''}</PiiWrapper>
                    </div>
                    <div className="flex items-center text-sm font-normal text-gray-300 break-all">
                        <PiiWrapper>{t('nigoEntry.documentPanel.documentId') + ': ' + document.documentId}</PiiWrapper>
                    </div>
                </div>
                {createAction(document as V3DocumentWithSource, taskCarrier.toUpperCase(), t, 'View')}
            </div>
        );
    };

    const renderDetails = (
        <div className="flex flex-col w-full">
            <label className="font-primary text-lg mt-8">{t('sideSheet.task.tabs.details')}</label>
            <div className="grid grid-cols-3 gap-2 text-md align-center">
                <div className="col-span-1 mt-4 align-self text-[--color-base-text-text-secondary]">
                    {' '}
                    {t('sideSheet.task.status.label')}{' '}
                </div>
                <div className="col-span-2 mt-2 align-self">
                    <Typography variant={TypographyVariant.BodySm} className="py-2 pr-6 ">
                        <Badge
                            icon={badgeIcon}
                            variant={badgeVariant}
                            label={badgeLabel}
                            rounded={true}
                            className="flex gap-1 items-center"
                        />
                    </Typography>
                </div>

                {((task.status === TaskStatus.Pending && task.impededReason) ||
                    (task.status === TaskStatus.Canceled && task.cancellationReason)) && (
                    <>
                        <div className="col-span-1 text-[--color-base-text-text-secondary]"> {t('sideSheet.task.reasonLabel')} </div>
                        <Typography variant={TypographyVariant.BodySm} className="col-span-2">
                            <Content
                                truncate
                                details={statusReason}
                                variant={ContentVariant.BodySm}
                                popoverBody={statusReason}
                                popoverClassName="background-white w-full "
                                pii={true}
                            />
                            {task.status === TaskStatus.Pending ? task.impededReason : task.cancellationReason}
                        </Typography>
                    </>
                )}
                {(task.status === TaskStatus.Pending || task.status === TaskStatus.Canceled || task.status === TaskStatus.Completed) && (
                    <>
                        <div className="col-span-1 text-[--color-base-text-text-secondary]">
                            {task.status === TaskStatus.Pending
                                ? t('sideSheet.task.pendinglabel')
                                : task.status === TaskStatus.Canceled
                                ? t('sideSheet.task.canceledLabel')
                                : t('sideSheet.task.completedLabel')}
                        </div>
                        <Typography variant={TypographyVariant.BodySm} className="col-span-2">
                            {task.status === TaskStatus.Pending
                                ? formattedPending
                                    ? dayjs(formattedPending).format(DEFAULT_DATETIME_DISPLAY_FORMAT)
                                    : 'N/A'
                                : formattedUpdated
                                ? dayjs(formattedUpdated).format(DEFAULT_DATETIME_DISPLAY_FORMAT)
                                : 'N/A'}
                        </Typography>
                    </>
                )}

                <div className="col-span-1 text-[--color-base-text-text-secondary]"> {t('sideSheet.task.assigneeLabel')} </div>
                <div className="col-span-2">
                    <Typography variant={TypographyVariant.BodySm}>
                        {task.assignee ? task.assignee : task.prefferedAssignee ? task.prefferedAssignee : NoAssigneeComp}
                    </Typography>
                </div>

                <div className="col-span-1 text-[--color-base-text-text-secondary]"> {t('sideSheet.task.newCreatedLabel')} </div>
                <Typography variant={TypographyVariant.BodySm} className="col-span-2">
                    {dayjs(formattedCreated).format(DEFAULT_DATETIME_DISPLAY_FORMAT)}
                    <span className="text-gray-600">
                        &nbsp;
                        {`(${t('temporal.timeago', { formattedDate: '', count: createdCount, unit: createdUnit }).trim()})`}
                    </span>
                </Typography>

                {task.taskName && type == 'case' && (
                    <>
                        <div className="col-span-1 text-[--color-base-text-text-secondary]">{t('sideSheet.task.stepLabel')}</div>
                        <Typography variant={TypographyVariant.BodySm} className="col-span-2">
                            {toSentenceCase(task.taskName)}
                        </Typography>

                        <div className="col-span-1 text-[--color-base-text-text-secondary]">{t('sideSheet.task.detailsLabel')}</div>
                        <Typography variant={TypographyVariant.BodySm} className="col-span-2">
                            {t('sideSheet.task.taskDetails', {
                                taskType: toSentenceCase(task.taskName),
                            })}
                        </Typography>
                    </>
                )}
            </div>

            {type == 'case' && !userExists && showStartButton && (
                <div className="bg-black text-white text-sm font-normal rounded-lg shadow p-2  whitespace-nowrap z-10  mt-8 max-w-[240px]">
                    {t('sideSheet.task.noAssignee')}
                </div>
            )}

            {type == 'case' && showStartButton && (
                <div className={!userExists ? 'flex flex-row items-center gap-1 pt-2' : 'flex flex-row items-center gap-1 pt-8'}>
                    <Button
                        mode="primary"
                        disabled={!userExists || startLoader}
                        onClick={() => handleStart(task.id, task.status)}
                        data-testid="start-task-btm"
                        aria-label={t('ariaLabel.startTask') as string}
                        type="submit"
                        size={startLoader ? 'large' : 'small'}
                    >
                        {!startLoader ? t('sideSheet.task.startTask') : <CustomLoader />}
                    </Button>
                </div>
            )}
        </div>
    );

    const DocumentsListComponent: React.FC<{
        documentsList: DocumentData[];
        task: { carrier: string };
        t: (key: string) => string;
        documentsListType?: string;
    }> = ({ documentsList, task, t, documentsListType }) => {
        return (
            <>
                {documentsList.length === 0 ? (
                    <EmptyState
                        content={
                            documentsListType === 'additional' && errorDocuments
                                ? t('sideSheet.task.errorAdditionalDocuments')
                                : t('sideSheet.task.noDocuments')
                        }
                    />
                ) : (
                    documentsList.map((document: DocumentData) =>
                        document.documentId ? (
                            <DocumentItem document={document} taskCarrier={task.carrier} key={document.documentId} />
                        ) : null
                    )
                )}
            </>
        );
    };

    const renderDocuments = (
        <div className="flex flex-col w-full">
            <label className="font-primary text-lg mt-8">{t('sideSheet.task.tabs.documents')}</label>
            <div className="border-box w-full  mt-2">
                <DocumentsListComponent documentsList={documentsList} task={task} t={t} />
            </div>
            <div className="border-box w-full">
                <div className="flex items-baseline gap-1 mb-4">
                    <ChevronDownIcon
                        className={showAdditionalDocuments ? 'rotate-0 cursor-pointer' : 'rotate-270 cursor-pointer'}
                        width={18}
                        height={18}
                        onClick={() => setShowAdditionalDocuments(!showAdditionalDocuments)}
                    />
                    <label className="font-primary text-lg mt-10">{t('sideSheet.task.additionalDocuments')}</label>
                </div>
                {showAdditionalDocuments ? (
                    <DocumentsListComponent documentsList={additionalDocuments} task={task} t={t} documentsListType={'additional'} />
                ) : null}
            </div>
        </div>
    );

    const renderTabContent = (
        <>
            <TabContent className="flex px-10  w-full flex-col items-center" value={TabOptions.Details}>
                {renderDetails}
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
                    <TabTrigger value={TabOptions.Documents}>{t('sideSheet.task.tabs.documents') ?? ''}</TabTrigger>
                </TabList>
                {loading ? (
                    <div className="flex justify-center items-center h-screen">
                        <Loader />
                    </div>
                ) : (
                    renderTabContent
                )}
            </TabGroup>
        </div>
    );
}
