import React, { useState } from 'react';

import type {
    FieldDefinition,
    FieldPersonaConfig,
    PersonaType,
    TabDefinition,
} from '@deps/lib/transaction-builder/types';

interface TabEditorProps {
    tabs: TabDefinition[];
    activeTabId: string;
    persona: PersonaType;
    fieldRegistry: Record<string, FieldDefinition>;
    onSelectTab: (tabId: string) => void;
    onAddTab: () => void;
    onRenameTab: (tabId: string, label: string) => void;
    onDeleteTab: (tabId: string) => void;
    onRemoveField: (tabId: string, fieldId: string) => void;
    onMoveField: (
        tabId: string,
        fieldId: string,
        direction: 'up' | 'down'
    ) => void;
    onUpdateFieldOverride: (
        tabId: string,
        fieldId: string,
        override: FieldPersonaConfig
    ) => void;
}

const TYPE_COLORS: Record<string, string> = {
    string: 'text-blue-600 bg-blue-50',
    number: 'text-green-600 bg-green-50',
    boolean: 'text-purple-600 bg-purple-50',
    date: 'text-orange-600 bg-orange-50',
    select: 'text-indigo-600 bg-indigo-50',
    email: 'text-pink-600 bg-pink-50',
    textarea: 'text-gray-600 bg-gray-100',
    default: 'text-gray-500 bg-gray-100',
};

function typeColor(type: string) {
    return TYPE_COLORS[type] ?? TYPE_COLORS.default;
}

export default function TabEditor({
    tabs,
    activeTabId,
    persona,
    fieldRegistry,
    onSelectTab,
    onAddTab,
    onRenameTab,
    onDeleteTab,
    onRemoveField,
    onMoveField,
    onUpdateFieldOverride,
}: TabEditorProps) {
    const [editingTabId, setEditingTabId] = useState<string | null>(null);
    const [editingTabLabel, setEditingTabLabel] = useState('');
    const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);

    const activeTab = tabs.find((t) => t.id === activeTabId);
    const sortedFields = activeTab
        ? [...activeTab.fields].sort((a, b) => a.order - b.order)
        : [];

    function startRename(tab: TabDefinition) {
        setEditingTabId(tab.id);
        setEditingTabLabel(tab.label);
    }
    function commitRename() {
        if (editingTabId && editingTabLabel.trim())
            onRenameTab(editingTabId, editingTabLabel.trim());
        setEditingTabId(null);
    }

    function getPersonaStatus(
        field: FieldDefinition,
        override?: FieldPersonaConfig
    ) {
        const eff = {
            ...(field.personas?.[persona] ?? {}),
            ...(override ?? {}),
        };
        if (eff.hidden)
            return {
                label: 'Hidden',
                cls: 'bg-gray-100 text-gray-500 border-gray-200',
            };
        if (eff.required)
            return {
                label: 'Required',
                cls: 'bg-red-50 text-red-600 border-red-100',
            };
        if (eff.readOnly)
            return {
                label: 'Read-only',
                cls: 'bg-yellow-50 text-yellow-700 border-yellow-100',
            };
        return null;
    }

    return (
        <div className="flex h-full flex-col">
            {/* Tab bar */}
            <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50/70 px-4 py-2 overflow-x-auto shrink-0">
                {tabs.map((tab) => (
                    <div key={tab.id} className="flex items-center shrink-0">
                        {editingTabId === tab.id ? (
                            <input
                                autoFocus
                                value={editingTabLabel}
                                onChange={(e) =>
                                    setEditingTabLabel(e.target.value)
                                }
                                onBlur={commitRename}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') commitRename();
                                    if (e.key === 'Escape')
                                        setEditingTabId(null);
                                }}
                                className="w-28 rounded-lg border border-indigo-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => onSelectTab(tab.id)}
                                onDoubleClick={() => startRename(tab)}
                                title="Double-click to rename"
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                    tab.id === activeTabId
                                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                                        : 'text-gray-500 hover:bg-white/60 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-xs leading-none ${
                                        tab.id === activeTabId
                                            ? 'bg-indigo-100 text-indigo-600'
                                            : 'bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    {tab.fields.length}
                                </span>
                            </button>
                        )}
                        {tabs.length > 1 &&
                            tab.id === activeTabId &&
                            editingTabId !== tab.id && (
                                <button
                                    type="button"
                                    onClick={() => onDeleteTab(tab.id)}
                                    className="ml-0.5 rounded p-0.5 text-gray-300 hover:text-red-400 transition-colors"
                                    title="Remove tab"
                                >
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                    >
                                        <path
                                            d="M2 2l8 8M10 2L2 10"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                            )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={onAddTab}
                    className="ml-1 flex shrink-0 items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                >
                    <span>+</span> Tab
                </button>
            </div>

            {/* Field list */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {sortedFields.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center py-16">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                            ⊕
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                            No fields yet
                        </p>
                        <p className="mt-1 text-xs text-gray-400 max-w-xs">
                            Click any field in the registry panel to add it to
                            this tab.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sortedFields.map((tabField, idx) => {
                            const field = fieldRegistry[tabField.fieldId];
                            if (!field) return null;
                            const status = getPersonaStatus(
                                field,
                                tabField.override
                            );
                            const hasOverride =
                                tabField.override &&
                                Object.keys(tabField.override).length > 0;
                            const isExpanded =
                                expandedFieldId === tabField.fieldId;

                            return (
                                <div
                                    key={tabField.fieldId}
                                    className={`rounded-xl border bg-white transition-all ${
                                        isExpanded
                                            ? 'border-indigo-200 shadow-sm'
                                            : 'border-gray-100 hover:border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        {/* Reorder controls */}
                                        <div className="flex shrink-0 flex-col gap-0.5">
                                            <button
                                                type="button"
                                                disabled={idx === 0}
                                                onClick={() =>
                                                    onMoveField(
                                                        activeTabId,
                                                        tabField.fieldId,
                                                        'up'
                                                    )
                                                }
                                                className="text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors leading-none text-xs"
                                                title="Move up"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                type="button"
                                                disabled={
                                                    idx ===
                                                    sortedFields.length - 1
                                                }
                                                onClick={() =>
                                                    onMoveField(
                                                        activeTabId,
                                                        tabField.fieldId,
                                                        'down'
                                                    )
                                                }
                                                className="text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors leading-none text-xs"
                                                title="Move down"
                                            >
                                                ▼
                                            </button>
                                        </div>

                                        {/* Field info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="text-sm font-medium text-gray-800 truncate">
                                                    {field.label}
                                                </span>
                                                <span
                                                    className={`rounded px-1.5 py-0.5 text-xs font-mono ${typeColor(
                                                        field.type
                                                    )}`}
                                                >
                                                    {field.type}
                                                </span>
                                                {status && (
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-xs ${status.cls}`}
                                                    >
                                                        {status.label}
                                                    </span>
                                                )}
                                                {hasOverride && !status && (
                                                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
                                                        overridden
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 font-mono text-xs text-gray-400">
                                                {field.id}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedFieldId(
                                                        isExpanded
                                                            ? null
                                                            : tabField.fieldId
                                                    )
                                                }
                                                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                                                    isExpanded
                                                        ? 'bg-indigo-50 text-indigo-600'
                                                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                }`}
                                            >
                                                {isExpanded
                                                    ? 'Close'
                                                    : 'Override'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onRemoveField(
                                                        activeTabId,
                                                        tabField.fieldId
                                                    );
                                                    if (
                                                        expandedFieldId ===
                                                        tabField.fieldId
                                                    )
                                                        setExpandedFieldId(
                                                            null
                                                        );
                                                }}
                                                className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors"
                                                title="Remove field"
                                            >
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 12 12"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M2 2l8 8M10 2L2 10"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Override panel */}
                                    {isExpanded && (
                                        <FieldOverridePanel
                                            override={tabField.override ?? {}}
                                            persona={persona}
                                            field={field}
                                            onChange={(ov) =>
                                                onUpdateFieldOverride(
                                                    activeTabId,
                                                    tabField.fieldId,
                                                    ov
                                                )
                                            }
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400 shrink-0">
                {sortedFields.length} field
                {sortedFields.length !== 1 ? 's' : ''} in this tab
                {' · '}
                <span
                    className={
                        persona === 'paper' ? 'text-amber-600' : 'text-teal-600'
                    }
                >
                    {persona === 'paper' ? 'Paper Form' : 'Self-Serve'}
                </span>
                {' persona'}
                {' · '}
                Double-click a tab name to rename
            </div>
        </div>
    );
}

// ─── Field override panel ─────────────────────────────────────────────────────

function FieldOverridePanel({
    override,
    persona,
    field,
    onChange,
}: {
    override: FieldPersonaConfig;
    persona: PersonaType;
    field: FieldDefinition;
    onChange: (ov: FieldPersonaConfig) => void;
}) {
    const registryDefault = field.personas?.[persona] ?? {};

    function set(
        key: keyof FieldPersonaConfig,
        val: boolean | string | undefined
    ) {
        const next: FieldPersonaConfig = { ...override };
        if (val === false || val === '' || val === undefined) {
            delete (next as Record<string, unknown>)[key];
        } else {
            (next as Record<string, unknown>)[key] = val;
        }
        onChange(next);
    }

    return (
        <div className="border-t border-indigo-100 rounded-b-xl bg-indigo-50/40 px-4 py-3">
            <p className="mb-2.5 text-xs font-semibold text-indigo-700">
                Override for {persona === 'paper' ? 'Paper Form' : 'Self-Serve'}
            </p>
            <div className="flex flex-wrap gap-4 text-xs mb-3">
                {(
                    [
                        {
                            key: 'hidden',
                            label: 'Hidden',
                            reg: registryDefault.hidden,
                        },
                        {
                            key: 'required',
                            label: 'Required',
                            reg: registryDefault.required,
                        },
                        {
                            key: 'readOnly',
                            label: 'Read-only',
                            reg: registryDefault.readOnly,
                        },
                    ] as const
                ).map(({ key, label, reg }) => (
                    <label
                        key={key}
                        className="flex cursor-pointer items-center gap-1.5 text-gray-700"
                    >
                        <input
                            type="checkbox"
                            checked={override[key] ?? reg ?? false}
                            onChange={(e) =>
                                set(key, e.target.checked || undefined)
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        {label}
                        {reg && (
                            <span className="text-indigo-400 text-xs">
                                (registry default)
                            </span>
                        )}
                    </label>
                ))}
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1">
                    Label override{' '}
                    <span className="text-gray-400">
                        (leaves registry default if empty)
                    </span>
                </label>
                <input
                    type="text"
                    value={override.label ?? ''}
                    placeholder={field.label}
                    onChange={(e) => set('label', e.target.value || undefined)}
                    className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                />
            </div>
        </div>
    );
}
