import fs from 'fs';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import path from 'path';
import React, { useEffect, useReducer, useState } from 'react';

import CarrierConfigPanel from '@deps/components/transaction-builder/CarrierConfigPanel';
import FieldRegistryPanel from '@deps/components/transaction-builder/FieldRegistryPanel';
import PersonaToggle from '@deps/components/transaction-builder/PersonaToggle';
import SchemaExport from '@deps/components/transaction-builder/SchemaExport';
import TabEditor from '@deps/components/transaction-builder/TabEditor';
import {
    DEFAULT_FIELD_REGISTRY,
    getFieldGroups,
} from '@deps/lib/transaction-builder/field-registry';
import { composeSchema } from '@deps/lib/transaction-builder/schema-composer';
import type {
    CarrierOverride,
    ComposedSchema,
    FieldDefinition,
    FieldPersonaConfig,
    PersonaType,
    TransactionDefinition,
} from '@deps/lib/transaction-builder/types';
import type { FieldsResponse } from '@deps/pages/api/transaction-builder/fields';

import type { GetServerSideProps } from 'next';

// ─── State ────────────────────────────────────────────────────────────────────

type BuilderState = {
    definition: TransactionDefinition;
    activeTabId: string;
    isDirty: boolean;
};

type BuilderAction =
    | { type: 'UPDATE_META'; payload: Partial<TransactionDefinition> }
    | { type: 'SELECT_TAB'; tabId: string }
    | { type: 'ADD_TAB' }
    | { type: 'RENAME_TAB'; tabId: string; label: string }
    | { type: 'DELETE_TAB'; tabId: string }
    | { type: 'ADD_FIELD'; tabId: string; fieldId: string }
    | { type: 'REMOVE_FIELD'; tabId: string; fieldId: string }
    | {
          type: 'MOVE_FIELD';
          tabId: string;
          fieldId: string;
          direction: 'up' | 'down';
      }
    | {
          type: 'UPDATE_FIELD_OVERRIDE';
          tabId: string;
          fieldId: string;
          override: FieldPersonaConfig;
      }
    | {
          type: 'UPDATE_CARRIER_OVERRIDES';
          payload: Record<string, CarrierOverride>;
      }
    | { type: 'MARK_SAVED' };

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
    const { definition } = state;
    switch (action.type) {
        case 'UPDATE_META':
            return {
                ...state,
                definition: { ...definition, ...action.payload },
                isDirty: true,
            };

        case 'SELECT_TAB':
            return { ...state, activeTabId: action.tabId };

        case 'ADD_TAB': {
            const id = `tab_${Date.now()}`;
            return {
                ...state,
                activeTabId: id,
                isDirty: true,
                definition: {
                    ...definition,
                    tabs: [
                        ...definition.tabs,
                        {
                            id,
                            label: `Step ${definition.tabs.length + 1}`,
                            fields: [],
                        },
                    ],
                },
            };
        }

        case 'RENAME_TAB':
            return {
                ...state,
                isDirty: true,
                definition: {
                    ...definition,
                    tabs: definition.tabs.map((t) =>
                        t.id === action.tabId
                            ? { ...t, label: action.label }
                            : t
                    ),
                },
            };

        case 'DELETE_TAB': {
            const remaining = definition.tabs.filter(
                (t) => t.id !== action.tabId
            );
            return {
                ...state,
                isDirty: true,
                activeTabId:
                    state.activeTabId === action.tabId
                        ? remaining[0]?.id ?? ''
                        : state.activeTabId,
                definition: { ...definition, tabs: remaining },
            };
        }

        case 'ADD_FIELD':
            return {
                ...state,
                isDirty: true,
                definition: {
                    ...definition,
                    tabs: definition.tabs.map((t) => {
                        if (
                            t.id !== action.tabId ||
                            t.fields.some((f) => f.fieldId === action.fieldId)
                        )
                            return t;
                        return {
                            ...t,
                            fields: [
                                ...t.fields,
                                {
                                    fieldId: action.fieldId,
                                    order: t.fields.length,
                                },
                            ],
                        };
                    }),
                },
            };

        case 'REMOVE_FIELD':
            return {
                ...state,
                isDirty: true,
                definition: {
                    ...definition,
                    tabs: definition.tabs.map((t) =>
                        t.id !== action.tabId
                            ? t
                            : {
                                  ...t,
                                  fields: t.fields
                                      .filter(
                                          (f) => f.fieldId !== action.fieldId
                                      )
                                      .map((f, i) => ({ ...f, order: i })),
                              }
                    ),
                },
            };

        case 'MOVE_FIELD': {
            return {
                ...state,
                isDirty: true,
                definition: {
                    ...definition,
                    tabs: definition.tabs.map((t) => {
                        if (t.id !== action.tabId) return t;
                        const sorted = [...t.fields].sort(
                            (a, b) => a.order - b.order
                        );
                        const idx = sorted.findIndex(
                            (f) => f.fieldId === action.fieldId
                        );
                        if (idx < 0) return t;
                        const swap =
                            action.direction === 'up' ? idx - 1 : idx + 1;
                        if (swap < 0 || swap >= sorted.length) return t;
                        const next = [...sorted];
                        [next[idx], next[swap]] = [next[swap]!, next[idx]!];
                        return {
                            ...t,
                            fields: next.map((f, i) => ({ ...f, order: i })),
                        };
                    }),
                },
            };
        }

        case 'UPDATE_FIELD_OVERRIDE':
            return {
                ...state,
                isDirty: true,
                definition: {
                    ...definition,
                    tabs: definition.tabs.map((t) =>
                        t.id !== action.tabId
                            ? t
                            : {
                                  ...t,
                                  fields: t.fields.map((f) =>
                                      f.fieldId !== action.fieldId
                                          ? f
                                          : { ...f, override: action.override }
                                  ),
                              }
                    ),
                },
            };

        case 'UPDATE_CARRIER_OVERRIDES':
            return {
                ...state,
                isDirty: true,
                definition: { ...definition, carrierOverrides: action.payload },
            };

        case 'MARK_SAVED':
            return { ...state, isDirty: false };

        default:
            return state;
    }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    initialDefinition: TransactionDefinition;
    fieldData: FieldsResponse;
}

type ActivePanel = 'builder' | 'carriers' | 'export';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransactionBuilderEditor({
    initialDefinition,
    fieldData,
}: Props) {
    const router = useRouter();
    const [state, dispatch] = useReducer(reducer, {
        definition: initialDefinition,
        activeTabId: initialDefinition.tabs[0]?.id ?? '',
        isDirty: false,
    });
    const [persona, setPersona] = useState<PersonaType>('selfServe');
    const [previewCarrierId, setPreviewCarrierId] = useState('');
    const [activePanel, setActivePanel] = useState<ActivePanel>('builder');
    const [showPreview, setShowPreview] = useState(false);
    const [registryOpen, setRegistryOpen] = useState(true);
    const [composedSchema, setComposedSchema] = useState<ComposedSchema | null>(
        null
    );
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { definition, activeTabId, isDirty } = state;

    const fieldRegistryMap = fieldData.fields.reduce<
        Record<string, FieldDefinition>
    >((acc, f) => ({ ...acc, [f.id]: f }), {});

    useEffect(() => {
        setComposedSchema(
            composeSchema(
                definition,
                DEFAULT_FIELD_REGISTRY,
                persona,
                previewCarrierId || null
            )
        );
    }, [definition, persona, previewCarrierId]);

    const activeTabFields = (
        definition.tabs.find((t) => t.id === activeTabId)?.fields ?? []
    ).map((f) => f.fieldId);

    async function handleSave() {
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch(
                `/api/transaction-builder/definitions/${definition.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(definition),
                }
            );
            if (!res.ok) {
                const json = (await res.json()) as { error?: string };
                setSaveError(json.error ?? 'Save failed');
                return;
            }
            dispatch({ type: 'MARK_SAVED' });
        } finally {
            setSaving(false);
        }
    }

    const carrierCount = Object.keys(definition.carrierOverrides).length;

    return (
        <>
            <Head>
                <title>{definition.label} — Form Builder</title>
            </Head>

            <div className="flex h-screen flex-col bg-gray-50 overflow-hidden">
                {/* ── Top bar ─────────────────────────────────────────────────────── */}
                <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-5 py-3 shrink-0">
                    <Link
                        href="/transaction-builder"
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="shrink-0"
                        >
                            <path
                                d="M10 3L5 8l5 5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="hidden sm:inline">Transactions</span>
                    </Link>

                    <div className="h-4 w-px bg-gray-200 shrink-0" />

                    {/* Transaction name */}
                    <div className="min-w-0 flex-1">
                        <input
                            value={definition.label}
                            onChange={(e) =>
                                dispatch({
                                    type: 'UPDATE_META',
                                    payload: { label: e.target.value },
                                })
                            }
                            className="w-full bg-transparent text-base font-semibold text-gray-900 placeholder-gray-300 focus:outline-none truncate"
                            placeholder="Transaction Name"
                        />
                    </div>

                    {/* Unsaved indicator */}
                    {isDirty && (
                        <span className="shrink-0 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                            Unsaved
                        </span>
                    )}

                    <div className="h-4 w-px bg-gray-200 shrink-0" />

                    {/* Persona toggle */}
                    <PersonaToggle value={persona} onChange={setPersona} />

                    {/* Save */}
                    {saveError && (
                        <span className="text-xs text-red-500 shrink-0">
                            {saveError}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={saving || !isDirty}
                        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </header>

                {/* ── Sub-nav ──────────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 shrink-0">
                    <div className="flex">
                        {(
                            [
                                { id: 'builder', label: 'Builder' },
                                {
                                    id: 'carriers',
                                    label: 'Carrier Config',
                                    badge:
                                        carrierCount > 0
                                            ? carrierCount
                                            : undefined,
                                },
                                { id: 'export', label: 'Export JSON' },
                            ] as {
                                id: ActivePanel;
                                label: string;
                                badge?: number;
                            }[]
                        ).map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActivePanel(tab.id)}
                                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                                    activePanel === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                                {tab.badge !== undefined && (
                                    <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right side controls (only in builder panel) */}
                    {activePanel === 'builder' && (
                        <div className="flex items-center gap-3">
                            {/* Carrier preview selector */}
                            {carrierCount > 0 && (
                                <select
                                    value={previewCarrierId}
                                    onChange={(e) =>
                                        setPreviewCarrierId(e.target.value)
                                    }
                                    className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                                >
                                    <option value="">
                                        No carrier override
                                    </option>
                                    {Object.keys(
                                        definition.carrierOverrides
                                    ).map((id) => (
                                        <option key={id} value={id}>
                                            {id}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {/* Preview toggle */}
                            <button
                                type="button"
                                onClick={() => setShowPreview((v) => !v)}
                                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                    showPreview
                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <path
                                        d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                    <circle
                                        cx="8"
                                        cy="8"
                                        r="2"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                </svg>
                                Preview
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Main content ──────────────────────────────────────────────────── */}
                <div className="flex min-h-0 flex-1 overflow-hidden">
                    {/* Builder panel */}
                    {activePanel === 'builder' && (
                        <>
                            {/* Field registry sidebar */}
                            <aside
                                className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-200 shrink-0 ${
                                    registryOpen ? 'w-56' : 'w-12'
                                }`}
                            >
                                {/* Sidebar header */}
                                <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
                                    {registryOpen && (
                                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                            Fields
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRegistryOpen((v) => !v)
                                        }
                                        title={
                                            registryOpen
                                                ? 'Collapse registry'
                                                : 'Expand registry'
                                        }
                                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors ml-auto"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            className={`transition-transform duration-200 ${
                                                registryOpen ? '' : 'rotate-180'
                                            }`}
                                        >
                                            <path
                                                d="M10 3L5 8l5 5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                {registryOpen && (
                                    <div className="min-h-0 flex-1 overflow-hidden">
                                        <FieldRegistryPanel
                                            fieldsByGroup={fieldData.byGroup}
                                            groups={fieldData.groups}
                                            activeTabFieldIds={activeTabFields}
                                            onAddField={(fieldId) =>
                                                dispatch({
                                                    type: 'ADD_FIELD',
                                                    tabId: activeTabId,
                                                    fieldId,
                                                })
                                            }
                                        />
                                    </div>
                                )}
                                {!registryOpen && (
                                    <div className="flex flex-col items-center gap-3 pt-3">
                                        {fieldData.groups.map((g) => (
                                            <div
                                                key={g}
                                                title={g}
                                                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 cursor-default"
                                            >
                                                {g.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </aside>

                            {/* Tab editor (main) */}
                            <main className="flex min-h-0 flex-1 flex-col bg-white overflow-hidden">
                                <TabEditor
                                    tabs={definition.tabs}
                                    activeTabId={activeTabId}
                                    persona={persona}
                                    fieldRegistry={fieldRegistryMap}
                                    onSelectTab={(tabId) =>
                                        dispatch({ type: 'SELECT_TAB', tabId })
                                    }
                                    onAddTab={() =>
                                        dispatch({ type: 'ADD_TAB' })
                                    }
                                    onRenameTab={(tabId, label) =>
                                        dispatch({
                                            type: 'RENAME_TAB',
                                            tabId,
                                            label,
                                        })
                                    }
                                    onDeleteTab={(tabId) =>
                                        dispatch({ type: 'DELETE_TAB', tabId })
                                    }
                                    onRemoveField={(tabId, fieldId) =>
                                        dispatch({
                                            type: 'REMOVE_FIELD',
                                            tabId,
                                            fieldId,
                                        })
                                    }
                                    onMoveField={(tabId, fieldId, direction) =>
                                        dispatch({
                                            type: 'MOVE_FIELD',
                                            tabId,
                                            fieldId,
                                            direction,
                                        })
                                    }
                                    onUpdateFieldOverride={(
                                        tabId,
                                        fieldId,
                                        override
                                    ) =>
                                        dispatch({
                                            type: 'UPDATE_FIELD_OVERRIDE',
                                            tabId,
                                            fieldId,
                                            override,
                                        })
                                    }
                                />
                            </main>

                            {/* Live preview drawer */}
                            {showPreview && (
                                <aside className="flex w-72 shrink-0 flex-col border-l border-gray-200 bg-gray-50 overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                            Preview
                                            {previewCarrierId && (
                                                <span className="ml-1.5 font-normal normal-case text-indigo-500">
                                                    · {previewCarrierId}
                                                </span>
                                            )}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPreview(false)
                                            }
                                            className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                            >
                                                <path
                                                    d="M3 3l10 10M13 3L3 13"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4">
                                        <LivePreview
                                            schema={composedSchema}
                                            activeTabId={activeTabId}
                                        />
                                    </div>
                                </aside>
                            )}
                        </>
                    )}

                    {/* Carrier config panel */}
                    {activePanel === 'carriers' && (
                        <div className="flex-1 overflow-hidden bg-white">
                            <CarrierConfigPanel
                                definition={definition}
                                fieldRegistry={fieldRegistryMap}
                                onUpdate={(carrierOverrides) =>
                                    dispatch({
                                        type: 'UPDATE_CARRIER_OVERRIDES',
                                        payload: carrierOverrides,
                                    })
                                }
                            />
                        </div>
                    )}

                    {/* Export panel */}
                    {activePanel === 'export' && (
                        <div className="flex-1 overflow-hidden">
                            <SchemaExport schema={composedSchema} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ─── Live preview ─────────────────────────────────────────────────────────────

function LivePreview({
    schema,
    activeTabId,
}: {
    schema: ComposedSchema | null;
    activeTabId: string;
}) {
    if (!schema) return null;

    const tabSchema =
        schema.tabSchemas.find((t) => t.id === activeTabId) ??
        schema.tabSchemas[0];

    if (
        !tabSchema ||
        Object.keys(tabSchema.formSchema.properties).length === 0
    ) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 text-3xl opacity-30">⊕</div>
                <p className="text-xs text-gray-400">
                    Add fields to see the preview
                </p>
            </div>
        );
    }

    const properties = Object.entries(tabSchema.formSchema.properties);

    return (
        <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {tabSchema.label}
            </p>
            {properties.map(([fieldId, rawProp]) => {
                const prop = rawProp as unknown as Record<string, unknown>;
                const uiEntry = (tabSchema.uiSchema[fieldId] ?? {}) as Record<
                    string,
                    unknown
                >;
                const isRequired =
                    tabSchema.formSchema.required.includes(fieldId);
                const isReadOnly =
                    (prop['readOnly'] as boolean | undefined) ??
                    (uiEntry['ui:readonly'] as boolean | undefined);
                const widget = uiEntry['ui:widget'] as string | undefined;

                return (
                    <div key={fieldId} className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700">
                            {String(prop['title'] ?? fieldId)}
                            {isRequired && (
                                <span className="ml-0.5 text-red-400">*</span>
                            )}
                            {isReadOnly && (
                                <span className="ml-1.5 text-yellow-600 font-normal">
                                    (read-only)
                                </span>
                            )}
                        </label>
                        <PreviewControl
                            prop={prop}
                            widget={widget}
                            readOnly={isReadOnly}
                            fieldId={fieldId}
                        />
                    </div>
                );
            })}
        </div>
    );
}

function PreviewControl({
    prop,
    widget,
    readOnly,
    fieldId,
}: {
    prop: Record<string, unknown>;
    widget?: string;
    readOnly?: boolean;
    fieldId: string;
}) {
    const base =
        'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400';

    if (prop['enum']) {
        const opts = prop['enum'] as string[];
        const labels = (prop['enumNames'] as string[] | undefined) ?? opts;
        return (
            <select disabled={readOnly} className={base}>
                <option value="">Select…</option>
                {opts.map((v, i) => (
                    <option key={v} value={v}>
                        {labels[i] ?? v}
                    </option>
                ))}
            </select>
        );
    }
    if (prop['type'] === 'boolean' || widget === 'CheckboxWidget') {
        return (
            <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                    type="checkbox"
                    disabled={readOnly}
                    className="rounded border-gray-300"
                />
                {String(prop['title'] ?? fieldId)}
            </label>
        );
    }
    if (prop['format'] === 'date')
        return <input type="date" disabled={readOnly} className={base} />;
    if (prop['type'] === 'number' || prop['type'] === 'integer') {
        return (
            <input
                type="number"
                disabled={readOnly}
                min={prop['minimum'] as number | undefined}
                max={prop['maximum'] as number | undefined}
                className={base}
            />
        );
    }
    if (
        widget === 'textarea' ||
        widget === 'NotesWidget' ||
        widget === 'ProcessorNotesWidget'
    ) {
        return <textarea disabled={readOnly} rows={2} className={base} />;
    }
    return <input type="text" disabled={readOnly} className={base} />;
}

// ─── SSR ──────────────────────────────────────────────────────────────────────

const DEFINITIONS_PATH = path.join(
    process.cwd(),
    'src',
    'data',
    'transaction-builder',
    'definitions.json'
);

function buildFieldData(): FieldsResponse {
    const groups = getFieldGroups(DEFAULT_FIELD_REGISTRY);
    const fields = Object.values(DEFAULT_FIELD_REGISTRY);
    const byGroup: FieldsResponse['byGroup'] = {};
    for (const group of groups)
        byGroup[group] = fields.filter((f) => f.group === group);
    return { groups, fields, byGroup };
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const { transactionId } = ctx.params as { transactionId: string };
    const fieldData = buildFieldData();

    if (transactionId === 'new') {
        const now = new Date().toISOString();
        return {
            props: {
                fieldData,
                initialDefinition: {
                    id: `TXN_${Date.now()}`,
                    label: 'New Transaction',
                    description: '',
                    taskType: '',
                    version: '1.0.0',
                    tabs: [{ id: 'tab_1', label: 'Step 1', fields: [] }],
                    personaConfig: {
                        paper: { label: 'Paper Form', description: '' },
                        selfServe: { label: 'Self-Serve', description: '' },
                    },
                    carrierOverrides: {},
                    createdAt: now,
                    updatedAt: now,
                },
            },
        };
    }

    const raw = fs.readFileSync(DEFINITIONS_PATH, 'utf-8');
    const definitions = JSON.parse(raw) as Record<
        string,
        TransactionDefinition
    >;
    const initialDefinition = definitions[transactionId];
    if (!initialDefinition) return { notFound: true };

    return { props: { initialDefinition, fieldData } };
};
