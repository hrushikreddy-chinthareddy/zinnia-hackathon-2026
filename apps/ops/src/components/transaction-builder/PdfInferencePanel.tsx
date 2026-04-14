import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import {
    AI_PAPER_RJSF_STORAGE_PREFIX,
    buildDefaultAiPaperSlugFromOutput,
} from '@deps/lib/transaction-builder/ai-paper-slug';
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
import type { PdfTextLayoutResult } from '@deps/server/paper2flow/types';
import { isProd } from '@deps/utils/environment.helpers';

const PaperFlowZinniaPreview = dynamic(
    () => import('@deps/components/transaction-builder/PaperFlowZinniaPreview'),
    {
        ssr: false,
        loading: () => (
            <div className="flex justify-center py-14 text-sm text-gray-500">
                Loading Zinnia form preview…
            </div>
        ),
    }
);

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

const DEFAULT_MAX_PAGES = '3';
const DEFAULT_ITEMS_MODE: 'text' | 'none' | 'full' = 'text';

function prettyJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
}

type PdfInferencePanelProps = {
    /** When the page already provides a title (e.g. dedicated route). */
    omitHeading?: boolean;
    /** Used for TaskContainer “leave” / back links inside the live preview. */
    previewTaskInfoLink?: string;
};

export default function PdfInferencePanel({
    omitHeading = false,
    previewTaskInfoLink = '/transaction-builder/paper-forms-to-digital',
}: PdfInferencePanelProps) {
    const router = useRouter();
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'selfServeTransaction.aiPaper',
    });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<InferFromPdfResponse | null>(null);
    const [openPlanCode, setOpenPlanCode] = useState('');
    const [openPolicyId, setOpenPolicyId] = useState('');

    const disabledInProd = isProd();

    function openGeneratedFlowOnPolicy() {
        if (!result?.fullRjsfOutput || disabledInProd) return;
        const plan = openPlanCode.trim();
        const policyId = openPolicyId.trim();
        if (!plan || !policyId || typeof window === 'undefined') return;

        const storageId =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `ai-${Date.now()}`;
        const aiSlug = buildDefaultAiPaperSlugFromOutput(result.fullRjsfOutput);
        try {
            sessionStorage.setItem(
                `${AI_PAPER_RJSF_STORAGE_PREFIX}${storageId}`,
                JSON.stringify(result.fullRjsfOutput)
            );
        } catch {
            return;
        }
        const href = `/policies/${encodeURIComponent(
            plan
        )}/${encodeURIComponent(policyId)}/people/${encodeURIComponent(
            aiSlug
        )}?aiPaperKey=${encodeURIComponent(storageId)}`;
        void router.push(href);
    }

    async function runInference() {
        if (!file || loading || disabledInProd) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const form = new FormData();
            form.append('file', file);
            form.append('maxPages', DEFAULT_MAX_PAGES);
            form.append('itemsMode', DEFAULT_ITEMS_MODE);

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

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {!omitHeading && (
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 px-6 py-5">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Paper forms to Digital transactions UI
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
                        Upload a PDF form. We extract text and layout, infer
                        tabs and fields, and build RJSF schemas you can preview
                        in a mocked TaskContainer before wiring them in Form
                        Builder.
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                        Local development only: set{' '}
                        <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[11px] text-gray-800 ring-1 ring-slate-200">
                            OPEN_AI_API_KEY
                        </code>{' '}
                        in{' '}
                        <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[11px] text-gray-800 ring-1 ring-slate-200">
                            .env.development.local
                        </code>
                        .
                    </p>
                </div>
            )}

            <div className="px-6 py-5">
                {omitHeading && (
                    <p className="mb-5 text-xs text-gray-500">
                        Local only:{' '}
                        <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">
                            OPEN_AI_API_KEY
                        </code>{' '}
                        in{' '}
                        <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">
                            .env.development.local
                        </code>
                        .
                    </p>
                )}
                {disabledInProd && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                        Disabled in production.
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    <div className="flex min-w-0 flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            PDF file
                        </span>
                        <input
                            type="file"
                            accept="application/pdf"
                            aria-label="PDF file"
                            className="block h-10 w-full min-w-0 max-w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2 text-sm font-normal normal-case leading-none text-gray-800 file:mr-3 file:inline-flex file:h-7 file:shrink-0 file:cursor-pointer file:items-center file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-700"
                            onChange={(event) => {
                                setFile(event.target.files?.[0] ?? null);
                                setResult(null);
                                setError(null);
                            }}
                            disabled={disabledInProd}
                        />
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => void runInference()}
                        disabled={!file || loading || disabledInProd}
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {loading ? 'Running…' : 'Generate digital UI'}
                    </button>
                    {!file && !disabledInProd && (
                        <span className="text-xs text-gray-500">
                            Choose a PDF to enable generation.
                        </span>
                    )}
                </div>

                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="mt-6 space-y-6 border-t border-slate-100 pt-6">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Live form preview (Zinnia UI)
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Same TaskContainer and DynamicForm stack as
                                    task data entry in Ops — step through tabs
                                    and edit fields. Submit is mocked (no
                                    backend).
                                </p>
                            </div>
                            <div className="max-h-[min(75vh,56rem)] overflow-y-auto bg-gray-50 p-3 sm:p-4">
                                <PaperFlowZinniaPreview
                                    fullRjsfOutput={result.fullRjsfOutput}
                                    taskInfoLink={previewTaskInfoLink}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                {t('openOnPolicy')}
                            </h3>
                            <p className="mt-1 text-xs text-gray-600">
                                {t('openOnPolicyHint')} Slug:{' '}
                                <code className="rounded bg-white/90 px-1 py-0.5 font-mono text-[11px] text-gray-800">
                                    {buildDefaultAiPaperSlugFromOutput(
                                        result.fullRjsfOutput
                                    )}
                                </code>
                            </p>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-gray-700">
                                    {t('planCodeLabel')}
                                    <input
                                        type="text"
                                        value={openPlanCode}
                                        onChange={(e) =>
                                            setOpenPlanCode(e.target.value)
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-gray-900"
                                        autoComplete="off"
                                        disabled={disabledInProd}
                                    />
                                </label>
                                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-gray-700">
                                    {t('policyIdLabel')}
                                    <input
                                        type="text"
                                        value={openPolicyId}
                                        onChange={(e) =>
                                            setOpenPolicyId(e.target.value)
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-gray-900"
                                        autoComplete="off"
                                        disabled={disabledInProd}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => openGeneratedFlowOnPolicy()}
                                    disabled={
                                        disabledInProd ||
                                        !openPlanCode.trim() ||
                                        !openPolicyId.trim()
                                    }
                                    className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {t('openOnPolicy')}
                                </button>
                            </div>
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
            </div>
        </section>
    );
}
