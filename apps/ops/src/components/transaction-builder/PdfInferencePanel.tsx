import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import type {
    ArchetypeContextPack,
    CanonicalModel,
    FullRjsfOutput,
    GenerationQualityReport,
    LlmReadyExtractionPayload,
    Phase2GenerationContext,
    SchemaGenerationResult,
    TabInference,
} from '@deps/lib/transaction-builder/pipeline-types';
import {
    TASK_CONTAINER_PREVIEW_STORAGE_KEY,
    type TaskContainerPreviewPayload,
} from '@deps/lib/transaction-builder/preview-storage';
import type { PdfTextLayoutResult } from '@deps/server/paper2flow/types';
import { isProd } from '@deps/utils/environment.helpers';

type InferFromPdfResponse = {
    extraction: PdfTextLayoutResult;
    llmReadyPayload: LlmReadyExtractionPayload;
    canonicalModel: CanonicalModel;
    archetypeContextPack: ArchetypeContextPack;
    tabInference: TabInference;
    phase2Context: Phase2GenerationContext;
    schemaGeneration: SchemaGenerationResult;
    fullRjsfOutput: FullRjsfOutput;
    qualityReport: GenerationQualityReport;
};

function prettyJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export default function PdfInferencePanel() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [transactionHint, setTransactionHint] = useState('');
    const [maxPages, setMaxPages] = useState('3');
    const [itemsMode, setItemsMode] = useState<'text' | 'none' | 'full'>(
        'text'
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<InferFromPdfResponse | null>(null);

    const disabledInProd = isProd();

    async function runInference() {
        if (!file || loading || disabledInProd) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const form = new FormData();
            form.append('file', file);
            if (transactionHint.trim()) {
                form.append('transactionHint', transactionHint.trim());
            }
            if (maxPages.trim()) {
                form.append('maxPages', maxPages.trim());
            }
            form.append('itemsMode', itemsMode);

            const response = await fetch(
                '/api/transaction-builder/infer-from-pdf',
                {
                    method: 'POST',
                    body: form,
                    credentials: 'include',
                }
            );

            const body = (await response.json()) as
                | InferFromPdfResponse
                | { error?: string };

            if (!response.ok) {
                const errorMessage =
                    typeof body === 'object' &&
                    body != null &&
                    'error' in body &&
                    typeof body.error === 'string'
                        ? body.error
                        : `HTTP ${response.status}`;
                setError(errorMessage);
                return;
            }

            setResult(body as InferFromPdfResponse);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Request failed');
        } finally {
            setLoading(false);
        }
    }

    const extractionSummary = useMemo(() => {
        if (!result) return null;
        return {
            mode: result.extraction.mode,
            itemsMode: result.extraction.itemsMode,
            pageCount: result.extraction.pageCount,
            pagesProcessed: result.extraction.pagesProcessed,
            inferredFormName: result.llmReadyPayload.inferredFormName ?? null,
            warnings: result.extraction.warnings,
        };
    }, [result]);

    function openTaskContainerPreview() {
        if (!result) return;
        if (typeof window === 'undefined') return;

        const payload: TaskContainerPreviewPayload = {
            fullRjsfOutput: result.fullRjsfOutput,
            createdAt: new Date().toISOString(),
        };

        window.sessionStorage.setItem(
            TASK_CONTAINER_PREVIEW_STORAGE_KEY,
            JSON.stringify(payload)
        );
        void router.push(
            '/transaction-builder/task-container-preview?mode=edit'
        );
    }

    const fullRjsfPreview = useMemo(() => {
        if (!result) return null;

        const tabs = result.fullRjsfOutput.schemaContent.tabSchemas.map(
            (tab) => {
                const formSchema = isRecord(tab.formSchema)
                    ? tab.formSchema
                    : {};
                const properties = isRecord(formSchema.properties)
                    ? formSchema.properties
                    : {};
                const required = Array.isArray(formSchema.required)
                    ? formSchema.required.filter(
                          (entry): entry is string => typeof entry === 'string'
                      )
                    : [];

                return {
                    title: tab.title,
                    fieldKeys: Object.keys(properties),
                    requiredCount: required.length,
                };
            }
        );

        return {
            tabCount: tabs.length,
            tabs,
        };
    }, [result]);

    return (
        <section className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-gray-900">
                    PDF to Full RJSF (Phase 2)
                </h2>
                <p className="text-sm text-gray-600">
                    Extracts PDF text, builds LLM-ready payload, infers
                    canonical transaction model, runs tab inference, and
                    generates full RJSF tab schemas.
                </p>
                <p className="text-xs text-gray-500">
                    Requires `OPEN_AI_API_KEY` in `.env.development.local`.
                </p>
            </div>

            {disabledInProd && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Disabled in production.
                </div>
            )}

            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    PDF File
                    <input
                        type="file"
                        accept="application/pdf"
                        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm font-normal uppercase tracking-normal text-gray-700"
                        onChange={(event) => {
                            setFile(event.target.files?.[0] ?? null);
                            setResult(null);
                            setError(null);
                        }}
                        disabled={disabledInProd}
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Transaction Hint (Optional)
                    <input
                        type="text"
                        value={transactionHint}
                        onChange={(event) =>
                            setTransactionHint(event.target.value)
                        }
                        placeholder="Beneficiary Change"
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-gray-700"
                        disabled={disabledInProd}
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Max Pages
                    <input
                        type="number"
                        min={1}
                        value={maxPages}
                        onChange={(event) => setMaxPages(event.target.value)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-gray-700"
                        disabled={disabledInProd}
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Items Mode
                    <select
                        value={itemsMode}
                        onChange={(event) =>
                            setItemsMode(
                                event.target.value as 'text' | 'none' | 'full'
                            )
                        }
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-gray-700"
                        disabled={disabledInProd}
                    >
                        <option value="text">text</option>
                        <option value="none">none</option>
                        <option value="full">full</option>
                    </select>
                </label>
            </div>

            <div className="mt-4">
                <button
                    type="button"
                    onClick={() => void runInference()}
                    disabled={!file || loading || disabledInProd}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
                >
                    {loading ? 'Running pipeline...' : 'Run Pipeline'}
                </button>
            </div>

            {error && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-5 space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Extraction Summary
                        </h3>
                        <pre className="mt-2 max-h-48 overflow-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
                            {prettyJson(extractionSummary)}
                        </pre>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            LLM-ready Payload
                        </h3>
                        <pre className="mt-2 max-h-72 overflow-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
                            {prettyJson(result.llmReadyPayload)}
                        </pre>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Canonical Model
                        </h3>
                        <pre className="mt-2 max-h-72 overflow-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
                            {prettyJson(result.canonicalModel)}
                        </pre>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Archetype Context Pack (soft priors)
                        </h3>
                        <pre className="mt-2 max-h-72 overflow-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
                            {prettyJson(result.archetypeContextPack)}
                        </pre>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Tab Inference
                        </h3>
                        <pre className="mt-2 max-h-72 overflow-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
                            {prettyJson(result.tabInference)}
                        </pre>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Phase 2 Context Used
                        </h3>
                        <pre className="mt-2 max-h-72 overflow-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
                            {prettyJson(result.phase2Context)}
                        </pre>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Generated Tab Schemas (soft-prior aware)
                        </h3>
                        <pre className="mt-2 max-h-72 overflow-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
                            {prettyJson(result.schemaGeneration)}
                        </pre>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Full RJSF Visual Preview
                        </h3>
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={openTaskContainerPreview}
                                className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                            >
                                Open In TaskContainer (Mocked)
                            </button>
                        </div>
                        {fullRjsfPreview && (
                            <>
                                <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded border border-gray-200 bg-gray-50 px-2.5 py-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                            Task Type
                                        </p>
                                        <p className="text-xs font-medium text-gray-900">
                                            {result.fullRjsfOutput.taskType}
                                        </p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 px-2.5 py-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                            Process SubType
                                        </p>
                                        <p className="text-xs font-medium text-gray-900">
                                            {
                                                result.fullRjsfOutput
                                                    .processSubType
                                            }
                                        </p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 px-2.5 py-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                            Archetype
                                        </p>
                                        <p className="text-xs font-medium text-gray-900">
                                            {
                                                result.fullRjsfOutput
                                                    .generationMeta.archetype
                                            }
                                        </p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 px-2.5 py-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                            Tabs
                                        </p>
                                        <p className="text-xs font-medium text-gray-900">
                                            {fullRjsfPreview.tabCount}
                                        </p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 px-2.5 py-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                            Fixed Skeleton
                                        </p>
                                        <p className="text-xs font-medium text-gray-900">
                                            {result.fullRjsfOutput
                                                .generationMeta
                                                .fixedSkeletonApplied
                                                ? 'Applied'
                                                : 'Not applied'}
                                        </p>
                                    </div>
                                </div>
                                {result.phase2Context.fixedSkeleton
                                    ?.applied && (
                                    <p className="mt-2 text-xs text-indigo-700">
                                        Dynamic middle tab generated from PDF:{' '}
                                        <span className="font-semibold">
                                            {
                                                result.phase2Context
                                                    .fixedSkeleton
                                                    .dynamicMiddleTitle
                                            }
                                        </span>
                                    </p>
                                )}

                                <div className="mt-3 space-y-2">
                                    {fullRjsfPreview.tabs.map(
                                        (tab, tabIndex) => (
                                            <div
                                                key={`${tab.title}-${tabIndex}`}
                                                className="rounded border border-gray-200 bg-gray-50 p-2.5"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-xs font-semibold text-gray-900">
                                                        {tabIndex + 1}.{' '}
                                                        {tab.title}
                                                    </p>
                                                    <p className="text-[11px] text-gray-600">
                                                        {tab.fieldKeys.length}{' '}
                                                        fields ·{' '}
                                                        {tab.requiredCount}{' '}
                                                        required
                                                    </p>
                                                </div>
                                                {tab.fieldKeys.length === 0 ? (
                                                    <p className="mt-1.5 text-[11px] text-amber-700">
                                                        No fields generated in
                                                        this tab.
                                                    </p>
                                                ) : (
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {tab.fieldKeys
                                                            .slice(0, 20)
                                                            .map((fieldKey) => (
                                                                <span
                                                                    key={
                                                                        fieldKey
                                                                    }
                                                                    className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700"
                                                                >
                                                                    {fieldKey}
                                                                </span>
                                                            ))}
                                                        {tab.fieldKeys.length >
                                                            20 && (
                                                            <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600">
                                                                +
                                                                {tab.fieldKeys
                                                                    .length -
                                                                    20}{' '}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Quality Report (vs priors/planned fields)
                        </h3>
                        <pre className="mt-2 max-h-72 overflow-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
                            {prettyJson(result.qualityReport)}
                        </pre>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Full RJSF Output (TaskContainer-ready)
                        </h3>
                        <details className="mt-2 rounded border border-gray-200 bg-gray-50 p-2.5">
                            <summary className="cursor-pointer text-xs font-semibold text-gray-900">
                                Show full JSON payload
                            </summary>
                            <pre className="mt-2 max-h-72 overflow-auto rounded bg-white p-3 text-xs leading-relaxed text-gray-800">
                                {prettyJson(result.fullRjsfOutput)}
                            </pre>
                        </details>
                    </div>
                </div>
            )}
        </section>
    );
}
