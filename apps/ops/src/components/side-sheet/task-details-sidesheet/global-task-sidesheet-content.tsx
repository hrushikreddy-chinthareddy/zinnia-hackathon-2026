import { useUser } from '@auth0/nextjs-auth0/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Icon,
    IconType,
    Loader,
    TabContent,
    TabGroup,
    TabList,
    TabTrigger,
} from '@zinnia/bloom/components';
import { HttpStatusCode } from 'axios';
import clsx from 'clsx';
import dayjs from 'dayjs';
import router from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import CallLogCard from '@deps/components/card/card-call-log/card-call-log';
import Content, { ContentVariant } from '@deps/components/content/content';
import Dropdown from '@deps/components/dropdown/Dropdown';
import IconButton from '@deps/components/icon-button/icon-button';
import CustomLoader from '@deps/components/loader/customLoader';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { AssigneeField } from '@deps/components/side-sheet/task-details-sidesheet/components/assignee-field';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { createViewDownloadAction } from '@deps/containers/subpages/documents-sub-page/documents-results-table';
import { AssigneePopoverPositionMode } from '@deps/containers/task-management-queue/table-elements/assignee-popover';
import TaskQueueDrawer from '@deps/containers/task-management-queue/task-queue-drawer';
import { OPS_MANAGER_VIEW_TASK } from '@deps/containers/task-management-queue/task-queue-table-row';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { formatDateTime, toTitleCase } from '@deps/helpers/string.helpers';
import {
    DEFAULT_ASSIGNEE_FIELDS,
    getUserNameFromEmail,
    findAssignee,
    NO_ASSIGNEE,
} from '@deps/hooks/useTaskManagementQueue';
import { CaseIdentifier } from '@deps/models/case/case';
import {
    includeDocumentTypeForInboundSearch,
    excludeDocumentTypes,
    includeDocumentTypesInbound,
} from '@deps/models/case/document';
import { IdentifierInstance } from '@deps/models/case/identifier-instance';
import { EarlyTaskType, TaskSource } from '@deps/models/case/task';
import {
    TaskStatus,
    TaskLabel,
    DocumentData,
    TaskSideSheetProps,
    TaskComment,
    ManagementTask,
} from '@deps/models/case/task-instance';
import { getUserDataByPartyIds } from '@deps/queries/api/parties';
import { searchUsersInGroupCSR } from '@deps/queries/api/server/fga/searchUsers';
import { ClaimNextTask } from '@deps/queries/api/v1/claim-task';
import { claimTask } from '@deps/queries/api/v1/task';
import {
    assignTaskAsAdmin,
    unAssignTaskAsAdmin,
} from '@deps/queries/api/v1/task-admin';
import { getTaskInstance, updateTask } from '@deps/queries/api/v2/task';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { getDocumentSearchResultsQuery } from '@deps/queries/tanstack/documentQueries/document-queries';
import { ReactComponent as ChevronDownIcon } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as BanIcon } from '@deps/styles/elements/icons/content/ban.svg';
import { ReactComponent as ClipboardIcon } from '@deps/styles/elements/icons/content/clipboard-1.svg';
import { ReactComponent as ClipboardOutlineIcon } from '@deps/styles/elements/icons/icons_outlined/clipboard-copy.svg';
import { ReactComponent as Progress } from '@deps/styles/elements/icons/icons_outlined/clipboard-list.svg';
import { ReactComponent as Pause } from '@deps/styles/elements/icons/icons_outlined/pause.svg';
import { V3DocumentWithSource } from '@deps/types/documents-v3';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { writeToCache } from '@deps/utils/cache';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import { formatTimestamp } from '@deps/utils/dates';
import { isProd } from '@deps/utils/environment.helpers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { parseErrorInformation } from '@deps/utils/server-logging';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';

import styles from './global-task-side-sheet-content.module.css';
import SidesheetButtons from './sidesheet-buttons';
import {
    isAPIErrorInformation,
    isClaimNextTask,
    RequestData,
} from './type-guards';

export enum TabOptions {
    Details = 'Details',
    Documents = 'Documents',
    Comments = 'Comments',
}

export interface DocumentItemProps {
    document: DocumentData;
    taskCarrier: string;
    t: TFunction;
}

const EmptyState = ({ content }: { content: string }) => {
    return (
        <div className="w-full rounded border-2 border-gray-100 bg-gray-50 p-8">
            <AssistiveText
                text={content}
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
    );
};

const DocumentItem = ({ document, taskCarrier, t }: DocumentItemProps) => {
    return (
        <div
            className="my-3 flex w-[436px] rounded border border-gray-100 p-[12px] gap-2"
            key={document.documentId}
        >
            <div>
                <Icon width={20} height={20} type={IconType.DOCUMENT_TEXT} />
            </div>
            <div>
                <div className="text-sm font-bold break-all">
                    <PiiWrapper>{document.displayName ?? ''}</PiiWrapper>
                </div>
                <div className="flex items-center text-sm font-normal text-gray-300 break-all">
                    <PiiWrapper>
                        {t('nigoEntry.documentPanel.documentId') +
                            ': ' +
                            document.documentId}
                    </PiiWrapper>
                </div>
            </div>
            <div className="ml-auto">
                {createViewDownloadAction(
                    document as V3DocumentWithSource,
                    taskCarrier.toUpperCase(),
                    t,
                    'View'
                )}
            </div>
        </div>
    );
};

const DocumentsListComponent = ({
    additionalLoader,
    documentsList,
    errorDocuments,
    task,
    t,
    documentsListType,
}: {
    documentsList: V3DocumentWithSource[];
    task: { carrier: string };
    t: TFunction;
    documentsListType?: string;
    additionalLoader: boolean;
    errorDocuments: boolean;
}) => {
    return (
        <>
            {documentsList.length === 0 ? (
                documentsListType === 'additional' && additionalLoader ? (
                    <div className="flex justify-center items-center">
                        <Loader />
                    </div>
                ) : (
                    <EmptyState
                        content={
                            documentsListType === 'additional' && errorDocuments
                                ? t('sideSheet.task.errorAdditionalDocuments')
                                : t('sideSheet.task.noDocuments')
                        }
                    />
                )
            ) : (
                documentsList.map((document: DocumentData) =>
                    document.documentId ? (
                        <DocumentItem
                            t={t}
                            document={document}
                            taskCarrier={task.carrier}
                            key={document.documentId}
                        />
                    ) : null
                )
            )}
        </>
    );
};

export default function GlobalTaskSideSheet({
    taskId,
    caseId,
    type = 'case',
    taskDescription,
    taskName,
    featureFlagDecisions,
    onTaskClaimSuccess,
    onTaskUpdated,
    mappedDocuments,
}: TaskSideSheetProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(TabOptions.Details);
    const [claimTaskLoader, setClaimTaskLoader] = useState(false);
    const [showAdditionalDocuments, setShowAdditionalDocuments] =
        useState(false);
    const [startLoader, setStartLoader] = useState(false);
    const [goToCaseLoader, setGoToCaseLoader] = useState(false);
    const [errorClaimingTask, setErrorClaimingTask] = useState(false);
    const [claimingTaskErrorMessage, setClaimingTaskErrorMessage] =
        useState('');

    const [assigneeList, setAssigneeList] = useState<
        { user: string; partyId: string }[]
    >([]);
    const [allAssigneeList, setAllAssigneeList] = useState<
        { user: string; partyId: string }[]
    >([]);

    const [assigneeLoading, setAssigneeLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [assignLoader, setAssignLoader] = useState(false);
    const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);

    const handleTabChange = (value: string) =>
        setActiveTab(value as TabOptions);
    const { isZinniaInternalProcessor } = usePermissionsContext();
    const limit = 25;
    const offset = 0;

    const { user } = useUser();
    const sideSheet = useSideSheetContext();
    const isOpsManagerView = type === OPS_MANAGER_VIEW_TASK;

    const {
        data: task,
        isLoading: loading,
        isFetching,
    } = useQuery({
        queryKey: ['taskInstance', taskId, isOpsManagerView],
        queryFn: async () => {
            const data = await getTaskInstance({ taskId });
            if (data && !data.caseId) {
                data.caseId = caseId;
            }
            if (!data) {
                return;
            }

            let finalAssignee = NO_ASSIGNEE;

            if (!isOpsManagerView) {
                finalAssignee = data.assignee ?? data.prefferedAssignee ?? '';
            } else {
                finalAssignee = await resolveAssigneeForTask(data);
            }
            return { ...data, assignee: finalAssignee };
        },
        refetchOnMount: 'always',
    });
    const readOnly = task?.status === TaskStatus.Completed || false;

    const caseDocumentSearchBody = useMemo<SearchRequest | null>(() => {
        if (!task?.caseId || !task?.carrier) {
            return null;
        }

        return {
            parentCarrierCode: task.carrier,
            documentClassification:
                SearchRequest.documentClassification.INBOUND,
            zinniaLiveCaseId: task.caseId,
            excludeDocumentTypes,
            ...(includeDocumentTypeForInboundSearch(task.carrier) &&
                !isZinniaInternalProcessor && {
                    documentType: includeDocumentTypesInbound.join(','),
                }),
        };
    }, [task]);

    const {
        data: {
            data: additionalDocuments = [],
            status: additionalDocumentsStatusCode,
        } = {},
        isLoading: additionalLoader,
    } = useQuery({
        queryKey: [
            'documentSideSheetSearch',
            caseDocumentSearchBody,
            limit,
            offset,
        ],
        queryFn: () =>
            getDocumentSearchResultsQuery(
                caseDocumentSearchBody,
                limit,
                offset
            ),
    });

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

    const handleClaimTask = async () => {
        if (task) {
            setClaimTaskLoader(true);

            let response: ClaimNextTask | RequestData | null = null;

            try {
                response = await claimTask(task.id);

                if (
                    isClaimNextTask(response) &&
                    response?.id == task.id &&
                    user?.email
                ) {
                    queryClient.setQueryData(['taskInstance', taskId], {
                        ...task,
                        assignee: user.email,
                        assigneePartyId: (user.partyId as string) ?? '',
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['taskInstance', taskId],
                    });
                    if (onTaskClaimSuccess) {
                        onTaskClaimSuccess();
                    }
                    setErrorClaimingTask(false);
                    setClaimingTaskErrorMessage('');
                    browserLogInfo(
                        'global-task:handleClaimTask::Successfully claimed task',
                        { taskId: taskId }
                    );
                } else {
                    browserLogInfo(
                        'global-task:handleClaimTask::An error occurred while claiming the task',
                        {
                            taskId: taskId,
                            status: isAPIErrorInformation(response)
                                ? response?.statusCode
                                : HttpStatusCode.InternalServerError,
                        }
                    );
                    setErrorClaimingTask(true);
                    setClaimingTaskErrorMessage(
                        isAPIErrorInformation(response) ? response?.message : ''
                    );
                }
            } catch (e) {
                browserLogError(
                    'global-task:handleClaimTask::Error claiming task',
                    {
                        ...parseErrorInformation(e),
                        taskId: task.id,
                        caseId: task.caseId,
                    }
                );
                setErrorClaimingTask(true);
                setClaimingTaskErrorMessage(
                    isAPIErrorInformation(response) ? response?.message : ''
                );
                return;
            } finally {
                setClaimTaskLoader(false);
            }
        }
    };

    const handleViewTask = async (
        taskId: string,
        editMode: boolean = false
    ) => {
        const openNigoEntry = Object.values(EarlyTaskType).includes(
            task?.taskType as EarlyTaskType
        );

        const getParam = (key: string = '&') =>
            `${editMode ? `${key}mode=edit` : ''}`;

        const url = openNigoEntry
            ? `/nigo-entry?taskId=${taskId}${getParam('&')}`
            : `/task/${taskId}${getParam('?')}`;
        await router.push(url);
        return;
    };

    const handleStart = async (taskId: string, taskStatus: TaskStatus) => {
        try {
            setStartLoader(true);
            if (
                taskStatus === TaskStatus.InProgress ||
                taskStatus === TaskStatus.Completed
            ) {
                await handleViewTask(taskId, true);
            } else {
                // Fetch the task instance
                const taskData = await getTaskInstance({ taskId });
                if (!taskData) {
                    browserLogError(
                        'global-task:handleStartTask::Task data could not be retrieved.',
                        {
                            taskId,
                            fileName: 'global-task-sidesheet-content',
                        }
                    );
                    return;
                }
                const body = {
                    ...taskData,
                    status: TaskStatus.InProgress,
                    source: TaskSource.ZinniaTaskManagement,
                };
                const response = await updateTask(
                    taskData.caseId,
                    taskData.id,
                    body
                );
                if (response) {
                    await queryClient.invalidateQueries({
                        queryKey: ['taskInstance', taskId],
                    });
                    await handleViewTask(taskId, true);
                    return;
                }
            }
        } catch (error) {
            browserLogError(
                'global-task:handleStartTask::Error handling start task',
                {
                    ...parseErrorInformation(error),
                    taskId,
                    fileName: 'global-task-sidesheet-content',
                }
            );
        } finally {
            setStartLoader(false);
        }
    };

    const handleGoToCase = async (caseId: string) => {
        setGoToCaseLoader(true);
        if (caseId) {
            await router.push(`/cases/${caseId}`);
        }
        setGoToCaseLoader(false);
    };
    async function resolveAssigneeForTask(task: ManagementTask) {
        if (!task.assigneePartyId) return NO_ASSIGNEE;

        const { parties } = await getUserDataByPartyIds({
            partyIds: [task.assigneePartyId],
            fields: DEFAULT_ASSIGNEE_FIELDS,
        });

        return findAssignee(parties, task.assigneePartyId);
    }

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );

    if (!task) return null;

    const formattedCreated = formatDateTime(task.createdAt);
    const formattedUpdated = formatDateTime(task.updatedAt);
    const formattedPending = formatDateTime(task.scheduledDate);

    const isUserAssociatedWithTask =
        user?.partyId !== '' && user?.partyId === task?.assigneePartyId;

    const documentsList = transformDocument(
        mappedDocuments ?? task.mappedDocuments ?? []
    );

    let allowedTaskStatusForStartBtnDisplay = [
        TaskStatus.New,
        TaskStatus.InProgress,
        TaskStatus.Scheduled,
        TaskStatus.Completed,
    ];

    allowedTaskStatusForStartBtnDisplay = isOpsManagerView
        ? [...allowedTaskStatusForStartBtnDisplay, TaskStatus.Canceled]
        : allowedTaskStatusForStartBtnDisplay;

    const showStartButton = allowedTaskStatusForStartBtnDisplay.includes(
        task.status
    );
    const statusReason =
        task.status === TaskStatus.Scheduled
            ? task.scheduledReason
            : task.cancellationReason;

    const details = task.taskDetails;

    let badgeIcon, badgeVariant, badgeLabel;

    switch (task.status) {
        case TaskStatus.InProgress:
            badgeIcon = <Progress width={16} height={16} />;
            badgeVariant = BadgeVariant.Info;
            badgeLabel = TaskLabel.InProgress;
            break;
        case TaskStatus.Completed:
            badgeIcon = <CircleCheckIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Success;
            badgeLabel = TaskLabel.Completed;
            break;
        case TaskStatus.Closed:
            badgeIcon = <CircleCheckIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Success;
            badgeLabel = TaskLabel.Closed;
            break;
        case TaskStatus.Canceled:
            badgeIcon = <BanIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Inactive;
            badgeLabel = TaskLabel.Canceled;
            break;
        case TaskStatus.Scheduled:
            badgeIcon = <Pause height={16} width={16} />;
            badgeVariant = BadgeVariant.Error;
            badgeLabel = toTitleCase(TaskStatus.Scheduled);
            break;
        default:
            badgeIcon = <ClipboardIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Default;
            badgeLabel = TaskLabel.New;
            break;
    }

    const NoAssigneeComp = (
        <div className="flex gap-2 text-gray-600">
            <span>No assignee</span>
            {task.status === TaskStatus.New &&
                !isOpsManagerView &&
                (!claimTaskLoader ? (
                    <button
                        tabIndex={0}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                        onClick={handleClaimTask}
                    >
                        {t('sideSheet.task.claimTask')}
                    </button>
                ) : (
                    <CustomLoader size="small" />
                ))}
        </div>
    );

    const openSideSheet = () => {
        const content = (
            <TaskQueueDrawer
                onClose={sideSheet.onClose}
                taskId={task.id}
                caseId={caseId}
                taskStatus={task.status}
                taskDescription={taskDescription}
                taskName={taskName ?? task.taskName}
            />
        );
        sideSheet.changeSideSheetContent(
            t('taskManagementQueue.updateTaskStatusDrawer.updateTaskStatus'),
            content
        );
        sideSheet.handleOpen(true);
    };

    const statuses = [
        {
            label: TaskLabel.Scheduled,
            icon: <Pause width={16} height={16} />,
            onSelect: () => {
                openSideSheet();
            },
        },
    ];

    const renderTaskStatus = (status: TaskStatus) => {
        const validTaskStatuses = [
            TaskStatus.Scheduled,
            TaskStatus.Canceled,
            TaskStatus.Completed,
            TaskStatus.Closed,
        ];

        if (!validTaskStatuses.includes(status)) {
            return null;
        }

        let label = '';
        let timestamp = formattedUpdated
            ? formatTimestamp(formattedUpdated, 'standard')
            : 'N/A';

        switch (status) {
            case TaskStatus.Scheduled:
                label = t('sideSheet.task.pendinglabel');
                timestamp = formattedPending
                    ? formatTimestamp(formattedPending, 'standard')
                    : 'N/A';
                break;
            case TaskStatus.Canceled:
                label = t('sideSheet.task.canceledLabel');
                break;
            case TaskStatus.Closed:
                label = t('sideSheet.task.closedLabel');
                break;
            case TaskStatus.Completed:
                label = t('sideSheet.task.completedLabel');
                break;
            default:
                break;
        }

        return (
            <>
                <div className="col-span-1 text-[--color-base-text-secondary]">
                    {label}
                </div>
                <Typography
                    variant={TypographyVariant.BodySm}
                    className="col-span-2"
                >
                    {timestamp}
                </Typography>
            </>
        );
    };
    const documentNumber = getCaseIdentifierValue(
        task?.identifiers as Array<IdentifierInstance>,
        CaseIdentifier.DocumentNumber
    );

    const goToCase = () => {
        window.open(`/cases/${task.caseId}`, '_blank', 'noopener,noreferrer');
    };

    const isCaseAndStartAble = type === 'case' && showStartButton && !readOnly;

    const isReadOnlyWithFeatureFlag =
        readOnly &&
        featureFlagDecisions?.[FEATURE_FLAGS.READ_ONLY_VIEW_TASK_MANAGEMENT] &&
        showStartButton;

    const shouldRenderStartButton =
        isCaseAndStartAble || isReadOnlyWithFeatureFlag;

    const isTaskUnclaimed =
        !task.assigneePartyId || task.assigneePartyId === '';

    const isStartButtonVisible =
        !isOpsManagerView &&
        task.status !== TaskStatus.Completed &&
        [TaskStatus.Scheduled, TaskStatus.InProgress, TaskStatus.New].includes(
            task.status
        ) &&
        (isUserAssociatedWithTask || isTaskUnclaimed);

    const isStartButtonDisabled =
        startLoader || isTaskUnclaimed || !isUserAssociatedWithTask;

    const isViewTaskButtonVisible = !isOpsManagerView;
    const carrierName =
        getCarrierNameByClientId(task?.carrier) || task?.carrier?.toUpperCase();

    const handleClick = async () => {
        if (assigneeList.length === 0 && !assigneeLoading) {
            try {
                setAssigneeLoading(true);
                const usersData = await searchUsersInGroupCSR({
                    carrier: task.carrier,
                    queue: task.queue,
                    access: 'processor',
                });

                const mappedUsers =
                    usersData?.users.map((u: any) => ({
                        user: getUserNameFromEmail(u.email),
                        partyId: u.id.split(':')[1],
                    })) || [];

                setAssigneeList(mappedUsers);
                setAllAssigneeList(mappedUsers);
            } catch (error) {
                browserLogError('Error fetching assignee list');
            } finally {
                setAssigneeLoading(false);
            }
        }
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);

        if (!value.trim()) {
            setAssigneeList(allAssigneeList);
            return;
        }

        setAssigneeList(
            allAssigneeList.filter((a) =>
                a.user.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    const handleTaskAssignAsAdmin = async (
        taskId: string,
        assigneePartyId: string
    ) => {
        setAssignLoader(true);

        try {
            const updatedTask = await assignTaskAsAdmin(
                taskId,
                assigneePartyId
            );

            if (updatedTask) {
                let resolvedAssignee = NO_ASSIGNEE;

                const { parties } = await getUserDataByPartyIds({
                    partyIds: [assigneePartyId],
                    fields: DEFAULT_ASSIGNEE_FIELDS,
                });

                resolvedAssignee = findAssignee(parties, assigneePartyId);

                const finalTask = {
                    ...task,
                    assignee: resolvedAssignee,
                    assigneePartyId: assigneePartyId,
                };

                //Update the sidesheet UI
                queryClient.setQueryData(['taskInstance', taskId], finalTask);

                // Notify table row
                onTaskUpdated?.(finalTask);

                writeToCache('getTaskInstance', { taskId }, finalTask);
            }
        } finally {
            setAssignLoader(false);
        }
    };

    const handleTaskUnassignAsAdmin = async (
        taskId: string,
        assigneePartyId: string
    ) => {
        setAssignLoader(true);

        try {
            const updatedTask = await unAssignTaskAsAdmin(
                taskId,
                assigneePartyId
            );

            if (updatedTask) {
                const finalTask = {
                    ...task,
                    assignee: NO_ASSIGNEE,
                    assigneePartyId: undefined,
                };

                ////Update the sidesheet UI
                queryClient.setQueryData(['taskInstance', taskId], finalTask);

                // Notify table row
                onTaskUpdated?.(finalTask);

                writeToCache('getTaskInstance', { taskId }, finalTask);
            }
        } finally {
            setAssignLoader(false);
        }
    };

    const hasAssignee = () => {
        if (!task.assignee) return false;

        const value = String(task.assignee).trim();
        return value !== '' && value !== NO_ASSIGNEE;
    };

    const renderDetails = (
        <div className="flex flex-col w-full">
            <label className="font-primary text-lg mt-8">
                {t('sideSheet.task.tabs.details')}
            </label>
            <div className="grid grid-cols-3 gap-2 text-md align-center">
                <div className="col-span-1 mt-4 align-self text-[--color-base-text-secondary]">
                    {t('sideSheet.task.status.label')}{' '}
                </div>
                <div className="col-span-2 mt-2 align-self">
                    {task?.status === TaskStatus.InProgress &&
                    task?.queue &&
                    (task?.assigneePartyId === user?.partyId ||
                        !isOpsManagerView) &&
                    !Object.values(EarlyTaskType).includes(
                        task?.taskType as EarlyTaskType
                    ) ? (
                        <Dropdown
                            triggerIcon={
                                <div className="pb-1">
                                    <Progress width={16} height={16} />
                                </div>
                            }
                            triggerLabel="In Progress"
                            options={statuses}
                        />
                    ) : (
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className="py-2 pr-6 inline-block "
                        >
                            <Badge
                                icon={badgeIcon}
                                variant={badgeVariant}
                                label={badgeLabel}
                                rounded={true}
                                className="flex gap-1 items-center"
                            />
                        </Typography>
                    )}
                </div>

                {((task.status === TaskStatus.Scheduled &&
                    task.scheduledReason) ||
                    (task.status === TaskStatus.Canceled &&
                        task.cancellationReason)) &&
                    !isOpsManagerView && (
                        <>
                            <div className="col-span-1 text-[--color-base-text-secondary]">
                                {' '}
                                {t('sideSheet.task.reasonLabel')}{' '}
                            </div>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="col-span-2"
                            >
                                <Content
                                    truncate
                                    details={statusReason}
                                    variant={ContentVariant.BodySm}
                                    popoverBody={statusReason}
                                    popoverClassName="background-white w-full "
                                    pii={true}
                                />
                            </Typography>
                            {task.data?.scheduledNote && (
                                <>
                                    <div className="col-span-1 text-[--color-base-text-secondary]">
                                        {' '}
                                        {t(
                                            'sideSheet.task.scheduledNoteLabel'
                                        )}{' '}
                                    </div>
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="col-span-2"
                                    >
                                        <Content
                                            truncate
                                            details={task.data?.scheduledNote}
                                            variant={ContentVariant.BodySm}
                                            popoverBody={
                                                task.data?.scheduledNote
                                            }
                                            popoverClassName="background-white w-full "
                                            pii={true}
                                        />
                                    </Typography>
                                </>
                            )}
                        </>
                    )}

                {renderTaskStatus(task.status)}

                <div className={styles.labelCell}>
                    {' '}
                    {t('sideSheet.task.carrier')}{' '}
                </div>

                <Typography
                    variant={TypographyVariant.BodySm}
                    className="col-span-2"
                >
                    {carrierName}
                </Typography>

                <div className={styles.labelCell}>
                    {' '}
                    {t('sideSheet.task.caseId')}{' '}
                </div>
                <div className={styles.valueRow}>
                    <Typography variant={TypographyVariant.BodySm}>
                        {task?.caseId}
                    </Typography>
                    <IconButton onClick={goToCase}>
                        <ClipboardOutlineIcon height={16} width={16} />
                    </IconButton>
                </div>

                {!isProd() && documentNumber && (
                    <>
                        <div className="col-span-1 text-[--color-base-text-secondary]">
                            {' '}
                            {t('sideSheet.task.documentNumber')}{' '}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className="col-span-2"
                        >{`${documentNumber}`}</Typography>
                    </>
                )}

                <div className={styles.labelCell}>
                    {' '}
                    {t('sideSheet.task.assigneeLabel')}{' '}
                </div>
                <div className="col-span-2">
                    {!isOpsManagerView ? (
                        <Typography variant={TypographyVariant.BodySm}>
                            {task.assignee
                                ? task.assignee
                                : task.prefferedAssignee
                                ? task.prefferedAssignee
                                : NoAssigneeComp}
                        </Typography>
                    ) : (
                        <AssigneeField
                            task={task}
                            isOpen={isAssigneePopoverOpen}
                            onOpen={() => setIsAssigneePopoverOpen(true)}
                            onClose={() => setIsAssigneePopoverOpen(false)}
                            actionLoader={assignLoader}
                            isOpsManagerView={isOpsManagerView}
                            assigneeList={assigneeList}
                            assigneeLoading={assigneeLoading}
                            searchValue={searchValue}
                            handleClick={handleClick}
                            handleSearch={handleSearch}
                            hasAssignee={hasAssignee}
                            handleTaskAssignAsAdmin={handleTaskAssignAsAdmin}
                            handleTaskUnassignAsAdmin={
                                handleTaskUnassignAsAdmin
                            }
                            fallback={NoAssigneeComp}
                            positionMode={AssigneePopoverPositionMode.Portal}
                            isAssigning={assignLoader}
                            onTaskUpdated={onTaskUpdated}
                        />
                    )}
                    {errorClaimingTask ? (
                        <AssistiveText
                            variant={AssistiveTextVariant.Error}
                            text={claimingTaskErrorMessage}
                        />
                    ) : null}
                </div>

                <div className={styles.labelCell}>
                    {' '}
                    {t('sideSheet.task.newCreatedLabel')}{' '}
                </div>
                <Typography
                    variant={TypographyVariant.BodySm}
                    className="col-span-2"
                >
                    {formattedCreated
                        ? formatTimestamp(formattedCreated, 'standard')
                        : 'N/A'}
                </Typography>

                {task.taskName && (
                    <>
                        {details && (
                            <>
                                <div className={styles.labelCell}>
                                    {t('sideSheet.task.detailsLabel')}
                                </div>
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className="col-span-2"
                                >
                                    {details}
                                </Typography>
                            </>
                        )}
                    </>
                )}
            </div>

            {!isOpsManagerView &&
                type == 'case' &&
                !isUserAssociatedWithTask &&
                showStartButton &&
                !readOnly && (
                    <div className="bg-black text-white text-sm font-normal rounded-lg shadow p-2  whitespace-nowrap z-10  mt-8 max-w-[240px]">
                        {t('sideSheet.task.noAssignee')}
                    </div>
                )}
            <SidesheetButtons
                className={clsx(
                    styles.buttonContainer,
                    isUserAssociatedWithTask
                        ? styles.buttonContainerWithUser
                        : styles.buttonContainerWithoutUser
                )}
                task={task}
                startLoader={startLoader}
                handleGoToCase={handleGoToCase}
                handleViewTask={handleViewTask}
                handleStart={handleStart}
                isGoToCaseButtonVisible={isOpsManagerView}
                isViewTaskButtonVisible={isViewTaskButtonVisible}
                isViewTaskButtonDisabled={!task.data}
                isStartButtonDisabled={isStartButtonDisabled}
                isStartButtonVisible={
                    shouldRenderStartButton && task.data
                        ? isStartButtonVisible
                        : false
                }
                goToCaseLoader={goToCaseLoader}
            />
        </div>
    );

    const additionalCaseDocuments = transformDocument(
        additionalDocuments || []
    );

    const renderDocuments = (
        <div className="flex flex-col w-full">
            <label className="font-primary text-lg mt-8">
                {t('sideSheet.task.tabs.documents')}
            </label>
            <div className="border-box w-full  mt-2">
                <DocumentsListComponent
                    additionalLoader={additionalLoader}
                    errorDocuments={
                        additionalDocumentsStatusCode !== StatusCode.Okay
                    }
                    documentsList={documentsList}
                    task={task}
                    t={t}
                />
            </div>
            <div className="border-box w-full">
                <div className="flex items-baseline gap-1 mb-4">
                    <ChevronDownIcon
                        className={
                            showAdditionalDocuments
                                ? 'rotate-0 cursor-pointer'
                                : 'rotate-270 cursor-pointer'
                        }
                        width={18}
                        height={18}
                        onClick={() =>
                            setShowAdditionalDocuments(!showAdditionalDocuments)
                        }
                    />
                    <label className="font-primary text-lg mt-10">
                        {t('sideSheet.task.additionalDocuments')}
                    </label>
                </div>
                {showAdditionalDocuments ? (
                    <DocumentsListComponent
                        additionalLoader={additionalLoader}
                        errorDocuments={
                            additionalDocumentsStatusCode !== StatusCode.Okay
                        }
                        documentsList={additionalCaseDocuments}
                        task={task}
                        t={t}
                        documentsListType={'additional'}
                    />
                ) : null}
            </div>
        </div>
    );

    const noCommentsAvailable =
        !task.data || !task.data?.notes || task.data?.notes?.length === 0;
    const descendingByDateComments = task.data?.notes?.sort(
        (a: TaskComment, b: TaskComment) => {
            return dayjs(a.submissionDate).isBefore(b.submissionDate) ? 1 : -1;
        }
    );

    const renderComments = (
        <>
            {task.data?.notes && (
                <div className="w-full">
                    {descendingByDateComments.map(
                        (note: TaskComment, index: number) => {
                            const summary = [
                                note.commentSubCategory,
                                note.commentDetail,
                                note.description,
                                note.comment,
                                note.note,
                                note.title,
                            ]
                                .filter(Boolean)
                                .join('. ');

                            return (
                                <CallLogCard
                                    key={index}
                                    summary={
                                        summary ||
                                        `${t(
                                            'sideSheet.suitability.comments.noSummaryAvailable'
                                        )} Note id: ${note.noteId}`
                                    }
                                    tag={note.commentCategory ?? undefined}
                                    isSecondaryPage
                                    className="px-0 py-4"
                                    createdAt={
                                        note.submissionDate ||
                                        note.createdAt ||
                                        note.date ||
                                        undefined
                                    }
                                    callerName={
                                        note.user || note.createBy || undefined
                                    }
                                />
                            );
                        }
                    )}
                </div>
            )}
        </>
    );

    const renderTabContent = (
        <>
            <TabContent
                className="flex px-10  w-full flex-col items-center"
                value={TabOptions.Details}
            >
                {renderDetails}
            </TabContent>
            <TabContent
                className="flex px-10  w-full flex-col items-center"
                value={TabOptions.Documents}
            >
                {renderDocuments}
            </TabContent>
            {!noCommentsAvailable && (
                <TabContent
                    className="flex px-10  w-full flex-col items-center"
                    value={TabOptions.Comments}
                >
                    {renderComments}
                </TabContent>
            )}
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
                    <TabTrigger value={TabOptions.Details}>
                        {t('sideSheet.task.tabs.details') ?? ''}
                    </TabTrigger>

                    <TabTrigger value={TabOptions.Documents}>
                        {t('sideSheet.task.tabs.documents') ?? ''}
                    </TabTrigger>

                    {!noCommentsAvailable && (
                        <TabTrigger value={TabOptions.Comments}>
                            {t('sideSheet.task.tabs.comments') ?? ''}
                        </TabTrigger>
                    )}
                </TabList>
                {loading || (isFetching && !startLoader) ? (
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
