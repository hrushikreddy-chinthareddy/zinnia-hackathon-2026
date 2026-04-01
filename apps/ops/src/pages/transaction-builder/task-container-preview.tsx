import Head from 'next/head';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import TaskContainer from '@deps/containers/task-container/task-container';
import { TaskProvider } from '@deps/containers/task-container/task-provider';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import type { FullRjsfOutput } from '@deps/lib/transaction-builder/pipeline-types';
import {
    TASK_CONTAINER_PREVIEW_STORAGE_KEY,
    type TaskContainerPreviewPayload,
} from '@deps/lib/transaction-builder/preview-storage';
import type { FormMetadata } from '@deps/models/case/task';
import {
    TaskStatus,
    type ManagementTask,
} from '@deps/models/case/task-instance';
import nextI18nextConfig from 'next-i18next.config';

import type { GetServerSideProps } from 'next';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeTitle(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function toTaskMetadata(output: FullRjsfOutput): FormMetadata[] {
    // TaskContainer appends its own final Confirm step; avoid duplicate confirm tabs.
    return output.schemaContent.tabSchemas
        .filter((tab) => normalizeTitle(tab.title) !== 'confirm')
        .map((tab) => ({
            title: tab.title,
            formSchema: isRecord(tab.formSchema)
                ? tab.formSchema
                : { type: 'object', properties: {} },
            uiSchema: isRecord(tab.uiSchema)
                ? tab.uiSchema
                : { 'ui:submitButtonOptions': { norender: true } },
        }));
}

function buildPreviewDebug(output: FullRjsfOutput): {
    createdFromTaskType: string;
    tabTitles: string[];
    transactionTabFields: string[];
} {
    const tabs = output.schemaContent.tabSchemas;
    const transactionTab =
        tabs.find((tab) => normalizeTitle(tab.title).includes('beneficiary')) ??
        tabs[1];
    const formSchema =
        transactionTab && isRecord(transactionTab.formSchema)
            ? transactionTab.formSchema
            : {};
    const properties = isRecord(formSchema.properties)
        ? formSchema.properties
        : {};

    return {
        createdFromTaskType: output.taskType,
        tabTitles: tabs.map((tab) => tab.title),
        transactionTabFields: Object.keys(properties),
    };
}

function buildObjectTemplateFromSchema(
    schema: unknown
): Record<string, unknown> {
    if (!isRecord(schema)) return {};
    const properties = isRecord(schema.properties) ? schema.properties : {};
    const out: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
        if (!isRecord(value)) {
            out[key] = undefined;
            continue;
        }
        const type = typeof value.type === 'string' ? value.type : '';
        if (Object.prototype.hasOwnProperty.call(value, 'default')) {
            out[key] = value.default;
            continue;
        }
        if (type === 'object') {
            out[key] = buildObjectTemplateFromSchema(value);
            continue;
        }
        if (type === 'array') {
            out[key] = [];
            continue;
        }
        out[key] = undefined;
    }

    return out;
}

function seedPreviewTaskData(output: FullRjsfOutput): Record<string, unknown> {
    const seeded: Record<string, unknown> = {};

    for (const tab of output.schemaContent.tabSchemas) {
        const formSchema = isRecord(tab.formSchema) ? tab.formSchema : {};
        const properties = isRecord(formSchema.properties)
            ? formSchema.properties
            : {};

        for (const [fieldKey, propertySchema] of Object.entries(properties)) {
            if (Object.prototype.hasOwnProperty.call(seeded, fieldKey)) {
                continue;
            }
            if (!isRecord(propertySchema)) {
                continue;
            }

            const type =
                typeof propertySchema.type === 'string'
                    ? propertySchema.type
                    : '';
            if (
                Object.prototype.hasOwnProperty.call(propertySchema, 'default')
            ) {
                seeded[fieldKey] = propertySchema.default;
                continue;
            }

            if (type === 'array') {
                const itemsSchema = isRecord(propertySchema.items)
                    ? propertySchema.items
                    : null;
                if (
                    itemsSchema &&
                    (itemsSchema.type === 'object' ||
                        isRecord(itemsSchema.properties))
                ) {
                    const minItems =
                        typeof propertySchema.minItems === 'number' &&
                        Number.isFinite(propertySchema.minItems)
                            ? Math.max(0, Math.floor(propertySchema.minItems))
                            : 0;
                    const rowCount = Math.max(1, minItems);
                    seeded[fieldKey] = Array.from({ length: rowCount }, () =>
                        buildObjectTemplateFromSchema(itemsSchema)
                    );
                } else if (
                    typeof propertySchema.minItems === 'number' &&
                    Number.isFinite(propertySchema.minItems) &&
                    propertySchema.minItems > 0
                ) {
                    seeded[fieldKey] = Array.from(
                        { length: Math.floor(propertySchema.minItems) },
                        () => undefined
                    );
                } else {
                    seeded[fieldKey] = [];
                }
                continue;
            }

            if (type === 'object') {
                seeded[fieldKey] =
                    buildObjectTemplateFromSchema(propertySchema);
            } else {
                seeded[fieldKey] = undefined;
            }
        }
    }

    return seeded;
}

function buildMockTask(output: FullRjsfOutput): ManagementTask {
    const now = new Date().toISOString();

    return {
        id: `mock-task-${Date.now()}`,
        caseId: 'MOCK-CASE-001',
        carrier: 'FNWL',
        createdAt: now,
        updatedAt: now,
        process: output.process || 'Policy Update',
        status: TaskStatus.Open,
        taskName: output.processSubType || 'Generated Paper Flow Preview',
        taskType: 'AI_PAPER_PREVIEW_TASK',
        queue: 'MOCK_QUEUE',
        data: seedPreviewTaskData(output),
        mappedDocuments: [],
        assigneePartyId: 'mock-assignee',
    };
}

export default function TaskContainerPreviewPage() {
    const [payload, setPayload] = useState<TaskContainerPreviewPayload | null>(
        null
    );
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const raw = window.sessionStorage.getItem(
            TASK_CONTAINER_PREVIEW_STORAGE_KEY
        );
        if (!raw) {
            setLoadError(
                'No preview payload found. Generate schema first in Transaction Builder, then click "Open In TaskContainer (Mocked)".'
            );
            return;
        }

        try {
            const parsed = JSON.parse(raw) as TaskContainerPreviewPayload;
            if (!parsed || !parsed.fullRjsfOutput) {
                setLoadError('Preview payload is invalid.');
                return;
            }
            setPayload(parsed);
            setLoadError(null);
        } catch {
            setLoadError('Failed to parse preview payload.');
        }
    }, []);

    const taskMetadata = useMemo(
        () => (payload ? toTaskMetadata(payload.fullRjsfOutput) : []),
        [payload]
    );
    const mockTask = useMemo(
        () => (payload ? buildMockTask(payload.fullRjsfOutput) : null),
        [payload]
    );
    const previewDebug = useMemo(
        () => (payload ? buildPreviewDebug(payload.fullRjsfOutput) : null),
        [payload]
    );

    return (
        <>
            <Head>
                <title>TaskContainer Preview — Transaction Builder</title>
            </Head>
            <div className="min-h-screen bg-gray-50 p-5">
                <div className="mx-auto mb-4 max-w-[1130px] rounded border border-gray-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-base font-semibold text-gray-900">
                                TaskContainer Preview (Mocked Backend)
                            </h1>
                            <p className="text-xs text-gray-600">
                                Uses generated tabSchemas in real TaskContainer
                                flow. Submit backend is intentionally mocked by
                                rendering default read-only flow.
                            </p>
                        </div>
                        <Link
                            href="/transaction-builder"
                            className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Back To Builder
                        </Link>
                    </div>
                    {payload && previewDebug && (
                        <div className="mt-3 rounded border border-gray-200 bg-gray-50 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                Preview Payload Debug
                            </p>
                            <p className="mt-1 text-xs text-gray-700">
                                Created:{' '}
                                <span className="font-medium">
                                    {payload.createdAt}
                                </span>
                            </p>
                            <p className="text-xs text-gray-700">
                                Generated TaskType:{' '}
                                <span className="font-medium">
                                    {previewDebug.createdFromTaskType}
                                </span>
                            </p>
                            <p className="text-xs text-gray-700">
                                Transaction tab fields:{' '}
                                <span className="font-medium">
                                    {previewDebug.transactionTabFields.join(
                                        ', '
                                    ) || 'None'}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                {loadError && (
                    <div className="mx-auto max-w-[1130px] rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        {loadError}
                    </div>
                )}

                {!loadError && payload && mockTask && (
                    <TaskProvider
                        initialTask={mockTask}
                        correlationId="mock-correlation-id"
                    >
                        <TaskContainer
                            taskInfoLink="/transaction-builder"
                            nigoExceptions={[]}
                            nigoSubExceptions={[]}
                            taskMetadata={taskMetadata}
                            isSaveAsDraftEnabled={false}
                            isContinueButtonEnabled={true}
                        />
                    </TaskProvider>
                )}
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({
    locale = DEFAULT_LOCALE,
}) => {
    const translations = await serverSideTranslations(
        locale,
        [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
        nextI18nextConfig,
        ALL_LOCALES
    );

    return {
        props: {
            ...translations,
        },
    };
};
