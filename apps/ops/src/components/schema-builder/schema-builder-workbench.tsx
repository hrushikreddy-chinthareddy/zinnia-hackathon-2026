'use client';

import { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { FormMetadata } from '@deps/models/case/task';
import { isLocalhostHost } from '@deps/schema-builder/localhost-guard';
import type { SchemaBuilderGenerateResponse } from '@deps/schema-builder/types';

export function SchemaBuilderWorkbench() {
    const [allowed, setAllowed] = useState<boolean | null>(null);
    const [description, setDescription] = useState('');
    const [refinement, setRefinement] = useState('');
    const [formSchema, setFormSchema] = useState<RJSFSchema | null>(null);
    const [uiSchema, setUiSchema] = useState<GenericObjectType | null>(null);
    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'prompt' | 'json'>('prompt');

    useEffect(() => {
        setAllowed(isLocalhostHost(window.location.host));
    }, []);

    const taskMetadata: FormMetadata | null = useMemo(() => {
        if (!formSchema || !uiSchema) return null;
        return {
            title: 'Schema Builder preview',
            tabTitle: 'Preview',
            formSchema,
            uiSchema,
            schemaContent: { tabSchemas: [] },
        };
    }, [formSchema, uiSchema]);

    const generate = useCallback(async (body: Record<string, unknown>) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/schema-builder/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(
                    (data as { error?: string; details?: string }).details ||
                        (data as { error?: string }).error ||
                        `HTTP ${res.status}`
                );
                return;
            }
            const out = data as SchemaBuilderGenerateResponse;
            setFormSchema(out.formSchema);
            setUiSchema(out.uiSchema);
            setFormData({});
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Request failed');
        } finally {
            setLoading(false);
        }
    }, []);

    const onGenerate = () => {
        void generate({ description: description.trim() });
    };

    const onRefine = () => {
        if (!formSchema || !uiSchema || !refinement.trim()) return;
        void generate({
            refinement: refinement.trim(),
            formSchema,
            uiSchema,
        });
    };

    const copyJson = async () => {
        if (!formSchema || !uiSchema) return;
        const text = JSON.stringify({ formSchema, uiSchema }, null, 2);
        await navigator.clipboard.writeText(text);
    };

    if (allowed === false) {
        return (
            <div
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-amber-900"
                role="status"
            >
                <p className="font-semibold">Access denied</p>
                <p className="mt-2 text-sm">
                    Schema Builder runs only on{' '}
                    <code className="rounded bg-white px-1">localhost</code> (or
                    127.0.0.1). Open{' '}
                    <code className="rounded bg-white px-1">
                        http://localhost:3000/schema-builder
                    </code>
                    .
                </p>
            </div>
        );
    }

    if (allowed === null) {
        return (
            <p className="text-sm text-gray-600" aria-busy="true">
                Checking…
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                <button
                    type="button"
                    className={`rounded px-3 py-1.5 text-sm font-medium ${
                        activeTab === 'prompt'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('prompt')}
                >
                    Prompt
                </button>
                <button
                    type="button"
                    className={`rounded px-3 py-1.5 text-sm font-medium ${
                        activeTab === 'json'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('json')}
                    disabled={!formSchema}
                >
                    JSON
                </button>
            </div>

            {activeTab === 'prompt' && (
                <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-2 text-sm font-medium text-gray-900">
                        Describe the form (natural language or pasted PDF text)
                        <textarea
                            className="min-h-[160px] rounded border border-gray-300 p-3 text-sm font-normal"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Beneficiary change: insured name, policy number, three primary beneficiaries with full name, DOB, SSN, relationship, address, phone, share %..."
                        />
                    </label>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            type={ButtonType.Primary}
                            size={ButtonSize.Default}
                            onClick={onGenerate}
                            disabled={loading || !description.trim()}
                        >
                            {loading ? 'Generating…' : 'Generate schema'}
                        </Button>
                        {formSchema && (
                            <Button
                                type={ButtonType.Secondary}
                                size={ButtonSize.Default}
                                onClick={() => {
                                    void copyJson();
                                }}
                            >
                                Copy formSchema + uiSchema
                            </Button>
                        )}
                    </div>

                    {formSchema && (
                        <label className="flex flex-col gap-2 text-sm font-medium text-gray-900">
                            Refine (optional)
                            <textarea
                                className="min-h-[80px] rounded border border-gray-300 p-3 text-sm font-normal"
                                value={refinement}
                                onChange={(e) => setRefinement(e.target.value)}
                                placeholder="e.g. Add optional contingent beneficiary array with the same fields"
                            />
                            <Button
                                type={ButtonType.Secondary}
                                size={ButtonSize.Default}
                                onClick={onRefine}
                                disabled={loading || !refinement.trim()}
                            >
                                Apply refinement
                            </Button>
                        </label>
                    )}

                    {error && (
                        <div
                            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'json' && formSchema && uiSchema && (
                <pre className="max-h-[60vh] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs">
                    {JSON.stringify({ formSchema, uiSchema }, null, 2)}
                </pre>
            )}

            {taskMetadata && activeTab === 'prompt' && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-base font-semibold text-gray-900">
                        Live preview
                    </h2>
                    <DynamicForm
                        taskMetadata={taskMetadata}
                        formData={formData}
                        onChange={(e: IChangeEvent) =>
                            setFormData(
                                (e.formData as Record<string, unknown>) ?? {}
                            )
                        }
                        onSubmit={() => undefined}
                        formContext={{
                            customData: {},
                            setCustomData: () => undefined,
                        }}
                    />
                </div>
            )}
        </div>
    );
}
