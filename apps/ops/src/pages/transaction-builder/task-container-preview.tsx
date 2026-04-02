import Head from 'next/head';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import TaskContainer from '@deps/containers/task-container/task-container';
import { TaskProvider } from '@deps/containers/task-container/task-provider';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import {
    TASK_CONTAINER_PREVIEW_STORAGE_KEY,
    type TaskContainerPreviewPayload,
} from '@deps/lib/transaction-builder/preview-storage';
import {
    buildMockManagementTaskFromRjsfOutput,
    buildRjsfPreviewDebugSummary,
    fullRjsfOutputToTaskMetadata,
} from '@deps/lib/transaction-builder/rjsf-output-task-preview';
import nextI18nextConfig from 'next-i18next.config';

import type { GetServerSideProps } from 'next';

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
        () =>
            payload ? fullRjsfOutputToTaskMetadata(payload.fullRjsfOutput) : [],
        [payload]
    );
    const mockTask = useMemo(
        () =>
            payload
                ? buildMockManagementTaskFromRjsfOutput(payload.fullRjsfOutput)
                : null,
        [payload]
    );
    const previewDebug = useMemo(
        () =>
            payload
                ? buildRjsfPreviewDebugSummary(payload.fullRjsfOutput)
                : null,
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
                                flow. Submit is mocked (no backend); forms are
                                editable like live data entry.
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
                            forceEditMode
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
