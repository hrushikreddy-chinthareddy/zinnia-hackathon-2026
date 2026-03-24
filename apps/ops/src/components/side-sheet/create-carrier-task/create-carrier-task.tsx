import { useUser } from '@auth0/nextjs-auth0/client';
import {
    BannerAlert,
    BannerVariant,
    TabContent,
    TabGroup,
    TabList,
    TabTrigger,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import { useContext, useMemo, useState } from 'react';

import Button, {
    ButtonSize,
    ButtonVariant,
} from '@deps/components/button/button';
import InputCheckBox from '@deps/components/checkbox-v2/input-checkbox';
import FileListing from '@deps/components/dynamic-form/customization/components/file-listing/file-listing';
import { StandaloneFileSearchField } from '@deps/components/dynamic-form/customization/components/file-search-field/standalone-file-search-field';
import FileWidget from '@deps/components/dynamic-form/customization/widgets/file-widget/file-widget';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getIdentifierValue } from '@deps/containers/case-sub-page/case-helpers';
import { FormBridgeContext } from '@deps/contexts/FormBridgeContext';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { ActionTypes } from '@deps/models/case/task';
import {
    ManagementTask,
    DocumentData,
    TaskDocument,
} from '@deps/models/case/task-instance';
import { createExternalTask } from '@deps/queries/api/create-external-task';
import { browserLogError } from '@deps/utils/browser-logging';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { MetadataSearchResponse } from '@zinnia/api-types/types/documents-v3';

export enum TabOptions {
    Details = 'Details',
    Notes = 'Notes',
}

export interface DocumentItemProps {
    document: DocumentData;
    taskCarrier: string;
    t: TFunction;
}

interface CreateCarrierTaskSideSheetProps {
    task: ManagementTask;
    attachments?: TaskDocument[];
    readonly?: boolean;
}

interface BannerTextProps {
    taskName?: string;
    t: TFunction;
}

function BannerText({ taskName, t }: BannerTextProps) {
    return (
        <div>
            {t('sideSheet.task.bannerAlert', {
                taskName: toTitleCase(taskName),
            })}
        </div>
    );
}

export default function CreateCarrierTaskSideSheet({
    task,
    attachments,
    readonly,
}: CreateCarrierTaskSideSheetProps) {
    const { t } = useTranslation();

    const [attachmentsState, setAttachmentsState] = useState<TaskDocument[]>(
        []
    );
    const [selectedIssues, setSelectedIssues] = useState<Record<string, any>[]>(
        []
    );
    const router = useRouter();
    const [comments, setComments] = useState<string>('');
    const [activeTab, setActiveTab] = useState(TabOptions.Details);
    const [submiting, setSubmitting] = useState(false);
    const handleTabChange = (value: string) =>
        setActiveTab(value as TabOptions);

    const { user } = useUser();
    const { featureFlags } = useOptimizely();
    const sideSheet = useSideSheetContextLegacy();
    const { formContext } = useContext(FormBridgeContext);

    const isCreateCarrierExternalTaskEnabled =
        featureFlags?.[FEATURE_FLAGS.CREATE_CARRIER_EXTERNAL_TASK] ?? false;

    const handleDocumentSelection = async (
        document: MetadataSearchResponse
    ) => {
        const displayName =
            'displayName' in document
                ? document.displayName
                : (document as TaskDocument).documentName;

        const attachment = {
            documentId: document?.documentId || '',
            docCategory: document?.documentCategory || '',
            documentType: document?.documentType || '',
            documentExt: document?.fileType || '',
            documentName: displayName || '',
        };

        const isAlreadySelected =
            attachments?.some(
                (attachment: any) =>
                    attachment.documentId === document.documentId
            ) ||
            attachmentsState.some((a) => a.documentId === document.documentId);

        if (!isAlreadySelected) {
            setAttachmentsState((prev) => [...prev, attachment]);
        }
    };

    const handleSetAttachments = (file: TaskDocument, op?: ActionTypes) => {
        setAttachmentsState((prev) => {
            switch (op) {
                case 'ADD':
                    return prev.some((a) => a.documentId === file.documentId)
                        ? prev
                        : [...prev, file];
                case 'REMOVE':
                    return prev.filter((a) => a.documentId !== file.documentId);
                default:
                    return prev;
            }
        });
    };

    const issuesList = useMemo(() => {
        const data = task?.data ?? {};
        const raw = (data.issuesList ?? data.rules ?? []) as Record<
            string,
            any
        >[];

        return raw.map((issue) => ({
            ...issue,
            displayValue:
                issue.processingReason &&
                issue.processingReason !== 'N/A' &&
                issue.processingReason !== 'NA'
                    ? issue.processingReason
                    : issue.processingResolution ??
                      issue.rule ??
                      issue.applicationValue ??
                      issue.processingInstruction ??
                      '',
            id: issue.externalId ?? issue.id,
        }));
    }, [task?.data]);

    const handleIssueToggle = (issue: Record<string, any>) => {
        setSelectedIssues((prev) =>
            prev.some((s) => s.id === issue.id)
                ? prev.filter((s) => s.id !== issue.id)
                : [...prev, issue]
        );
    };

    const handleSubmit = async () => {
        if (!isCreateCarrierExternalTaskEnabled) {
            return;
        }
        const issuesToSubmit = (
            issuesList.length > 0 ? selectedIssues : issuesList
        ).map(({ displayValue, id, ...rest }) => rest);

        const payload = {
            correlationId: formContext?.customData?.correlationId || '',
            externalTaskData: {
                issuesList: issuesToSubmit,
                comments,
                userDetails: { partyId: user?.partyId, name: user?.name },
                attachments: attachmentsState,
            },
            taskDetails: {
                taskId: task.id,
                caseId: task?.caseId,
                taskName: task?.taskName,
                taskType: task?.taskType,
                externalId: task?.externalId,
                carrier: task?.carrier,
            },
        };

        setSubmitting(true);

        try {
            const submitResult = await createExternalTask(payload);
            if (submitResult) {
                sideSheet.onClose();
                router.push(`/cases/${task?.caseId}/progress`);
            }
        } catch (error) {
            setSubmitting(false);
            browserLogError('Error::submitting carrier external task', payload);
        }
    };

    const renderDetails = (
        <>
            <div className="flex flex-col w-full">
                <BannerAlert
                    className="mt-4 mb-8"
                    bodyText={<BannerText taskName={task?.taskName} t={t} />}
                    variant={BannerVariant.Information}
                />
            </div>
            {issuesList.length > 0 && (
                <div className="w-full mb-6">
                    <Typography variant={TypographyVariant.FieldLabel}>
                        {t('allFields.selectIssues')}
                    </Typography>
                    <div className="mt-2">
                        {issuesList.map((issue) => (
                            <div key={issue.id} className="mb-4 flex text-sm">
                                <InputCheckBox
                                    checked={selectedIssues.some(
                                        (s) => s.id === issue.id
                                    )}
                                    onChange={() => handleIssueToggle(issue)}
                                    isDisabled={readonly || submiting}
                                    className="mr-2"
                                />
                                {issue.displayValue}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="w-full mb-4">
                <Typography variant={TypographyVariant.FieldLabel}>
                    {t('allFields.addComments')}
                </Typography>
                <div
                    className={`w-full border-2 border-gray-200 mt-2 mb-6 min-h-[80px] rounded-lg `}
                >
                    <textarea
                        className={
                            'mt-1 w-full min-h-[80px] resize-none border-none text-md px-4 py-2 !outline-none !ring-0'
                        }
                        onChange={(e) => {
                            setComments(e.target.value);
                        }}
                        disabled={readonly || submiting}
                        value={comments as string}
                    ></textarea>
                </div>
            </div>
            <div className="w-full flex flex-start gap-2">
                <StandaloneFileSearchField
                    carrier={task?.carrier}
                    caseId={task?.caseId}
                    linkedDocuments={attachments}
                    onSelectDocument={handleDocumentSelection}
                    disabled={readonly || submiting}
                />
                <span className="mt-2">or</span>
                <FileWidget
                    isStandalone
                    disabled={readonly || submiting}
                    multiple
                    contextData={{
                        carrier: task?.carrier,
                        caseId: task?.caseId,
                        correlationId:
                            getIdentifierValue(
                                task?.identifiers,
                                'correlationId'
                            ) ?? '',
                    }}
                    standaloneBehavior="preview"
                    onUploadComplete={(docs) => {
                        setAttachmentsState((prev) => {
                            const newDocs = [...prev];
                            docs.forEach((d) => {
                                if (
                                    !newDocs.some(
                                        (x) => x.documentId === d.documentId
                                    )
                                ) {
                                    newDocs.push(d);
                                }
                            });
                            return newDocs;
                        });
                    }}
                    onSubmitStandalone={(files) =>
                        handleDocumentSelection(
                            files[0] as MetadataSearchResponse
                        )
                    }
                />
            </div>
            {attachmentsState?.length ? (
                <div className="text-left w-full">
                    <FileListing
                        attachments={attachmentsState}
                        setAttachments={handleSetAttachments}
                        widgetProps={{ readonly: false, disabled: submiting }}
                    />
                </div>
            ) : null}
            <div className="w-full flex flex-start gap-4 py-6">
                <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Default}
                    onClick={handleSubmit}
                    disabled={submiting || !isCreateCarrierExternalTaskEnabled}
                >
                    Submit
                </Button>
                <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Selected}
                    onClick={sideSheet.onClose}
                    disabled={submiting}
                >
                    {t('allFields.cancel')}
                </Button>
            </div>
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
                </TabList>
                {renderTabContent}
            </TabGroup>
        </div>
    );
}
