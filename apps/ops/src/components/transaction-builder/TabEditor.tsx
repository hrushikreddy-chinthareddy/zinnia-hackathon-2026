import React, { useState } from 'react';

import type {
    FieldDefinition,
    FieldDependency,
    FieldPersonaConfig,
    PersonaType,
    TabDefinition,
    TabFieldConfig,
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
    onUpdateFieldDependency: (
        tabId: string,
        fieldId: string,
        dependency: FieldDependency | undefined
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

const COMPATIBLE_WIDGETS: Partial<
    Record<string, { widget: string; label: string }[]>
> = {
    string: [
        { widget: 'TextWidget', label: 'Text Input' },
        { widget: 'TextareaWidget', label: 'Text Area' },
        { widget: 'EmailWidget', label: 'Email' },
        { widget: 'ValueWidget', label: 'Read-only Value' },
    ],
    number: [
        { widget: 'NumbersWidget', label: 'Number' },
        { widget: 'AllocationPercentageWidget', label: 'Allocation %' },
        { widget: 'AgentPercentageWidget', label: 'Agent %' },
        { widget: 'ArithmeticOperationWidget', label: 'Calculated' },
        { widget: 'ValueWidget', label: 'Read-only Value' },
    ],
    currency: [
        { widget: 'CurrencyWidget', label: 'Currency ($)' },
        { widget: 'NumbersWidget', label: 'Number Input' },
    ],
    percentage: [
        { widget: 'AllocationPercentageWidget', label: 'Allocation %' },
        { widget: 'AgentPercentageWidget', label: 'Agent %' },
        { widget: 'NumbersWidget', label: 'Number Input' },
    ],
    boolean: [
        { widget: 'CheckboxWidget', label: 'Checkbox' },
        { widget: 'RadioWidget', label: 'Radio Buttons' },
    ],
    select: [
        { widget: 'SelectWidget', label: 'Dropdown' },
        { widget: 'RadioWidget', label: 'Radio Buttons' },
        { widget: 'CheckboxesWidget', label: 'Checkboxes' },
    ],
    radio: [
        { widget: 'RadioWidget', label: 'Radio Buttons' },
        { widget: 'SelectWidget', label: 'Dropdown' },
    ],
    multiselect: [
        { widget: 'CheckboxesWidget', label: 'Checkboxes' },
        { widget: 'SelectWidget', label: 'Multi-select Dropdown' },
    ],
    date: [
        { widget: 'DateWidgetV2', label: 'Date Picker V2 (recommended)' },
        { widget: 'DateWidget', label: 'Date Picker' },
    ],
    textarea: [
        { widget: 'TextareaWidget', label: 'Text Area' },
        { widget: 'NotesWidget', label: 'Notes (timestamped)' },
        { widget: 'ProcessorNotesWidget', label: 'Processor Notes' },
    ],
    file: [{ widget: 'FileWidget', label: 'File Upload' }],
    attachment: [
        { widget: 'AttachmentWidget', label: 'Attachment (search + upload)' },
    ],
    ssn: [{ widget: 'NumbersWidget', label: 'Masked Number Input' }],
    email: [
        { widget: 'EmailWidget', label: 'Email Input' },
        { widget: 'TextWidget', label: 'Text Input' },
    ],
    phone: [{ widget: 'NumbersWidget', label: 'Phone Number Input' }],
    display: [
        { widget: 'ValueWidget', label: 'Read-only Value' },
        { widget: 'TitleWidget', label: 'Section Title' },
        { widget: 'HyperLinkWidget', label: 'Hyperlink' },
        { widget: 'SummaryWidget', label: 'Summary Panel' },
    ],
    calculated: [
        {
            widget: 'ArithmeticOperationWidget',
            label: 'Arithmetic Calculation',
        },
        { widget: 'ValueWidget', label: 'Read-only Value' },
    ],
    integer: [{ widget: 'NumbersWidget', label: 'Number Input' }],
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
    onUpdateFieldDependency,
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
                                                {tabField.dependsOn && (
                                                    <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
                                                        conditional
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
                                            dependsOn={tabField.dependsOn}
                                            persona={persona}
                                            field={field}
                                            allFields={sortedFields
                                                .filter(
                                                    (f) =>
                                                        f.fieldId !==
                                                        tabField.fieldId
                                                )
                                                .map(
                                                    (f) =>
                                                        fieldRegistry[f.fieldId]
                                                )
                                                .filter(
                                                    (f): f is FieldDefinition =>
                                                        !!f
                                                )}
                                            onChange={(ov) =>
                                                onUpdateFieldOverride(
                                                    activeTabId,
                                                    tabField.fieldId,
                                                    ov
                                                )
                                            }
                                            onDependencyChange={(dep) =>
                                                onUpdateFieldDependency(
                                                    activeTabId,
                                                    tabField.fieldId,
                                                    dep
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
    dependsOn,
    persona,
    field,
    allFields,
    onChange,
    onDependencyChange,
}: {
    override: FieldPersonaConfig;
    dependsOn?: FieldDependency;
    persona: PersonaType;
    field: FieldDefinition;
    allFields: FieldDefinition[];
    onChange: (ov: FieldPersonaConfig) => void;
    onDependencyChange: (dep: FieldDependency | undefined) => void;
}) {
    const registryDefault = field.personas?.[persona] ?? {};
    const compatibleWidgets = COMPATIBLE_WIDGETS[field.type] ?? [];

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

    // Find available enum values for the chosen dependency source field
    const depSourceField = allFields.find((f) => f.id === dependsOn?.fieldId);
    const depSourceValues = depSourceField?.validation?.enum ?? [];

    function handleDepFieldChange(fieldId: string) {
        if (!fieldId) {
            onDependencyChange(undefined);
            return;
        }
        onDependencyChange({ fieldId, values: [] });
    }

    function handleDepValuesChange(value: string, checked: boolean) {
        if (!dependsOn) return;
        const next = checked
            ? [...dependsOn.values, value]
            : dependsOn.values.filter((v) => v !== value);
        onDependencyChange(
            next.length > 0
                ? { ...dependsOn, values: next }
                : { ...dependsOn, values: [] }
        );
    }

    return (
        <div className="border-t border-indigo-100 rounded-b-xl bg-indigo-50/40 px-4 py-3 space-y-4">
            {/* ── Persona behaviour ─────────────────────────────────────────── */}
            <div>
                <p className="mb-2 text-xs font-semibold text-indigo-700">
                    Behaviour —{' '}
                    {persona === 'paper' ? 'Paper Form' : 'Self-Serve'}
                </p>
                <div className="flex flex-wrap gap-4 text-xs">
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
                                <span className="text-indigo-400">
                                    (registry)
                                </span>
                            )}
                        </label>
                    ))}
                </div>
            </div>

            {/* ── Label override ────────────────────────────────────────────── */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Label override
                    <span className="ml-1 font-normal text-gray-400">
                        (leave empty to keep registry default)
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

            {/* ── Widget picker ─────────────────────────────────────────────── */}
            {compatibleWidgets.length > 1 && (
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Widget
                        <span className="ml-1 font-normal text-gray-400">
                            (registry default: {field.widget ?? 'auto'})
                        </span>
                    </label>
                    <select
                        value={override.widget ?? ''}
                        onChange={(e) =>
                            set('widget', e.target.value || undefined)
                        }
                        className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                    >
                        <option value="">— use registry default —</option>
                        {compatibleWidgets.map(({ widget, label }) => (
                            <option key={widget} value={widget}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* ── Placeholder ───────────────────────────────────────────────── */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Placeholder text
                </label>
                <input
                    type="text"
                    value={override.placeholder ?? ''}
                    placeholder="e.g. Enter your street address…"
                    onChange={(e) =>
                        set('placeholder', e.target.value || undefined)
                    }
                    className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                />
            </div>

            {/* ── Help text ─────────────────────────────────────────────────── */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Help text
                </label>
                <input
                    type="text"
                    value={override.helpText ?? ''}
                    placeholder="Shown below the field…"
                    onChange={(e) =>
                        set('helpText', e.target.value || undefined)
                    }
                    className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                />
            </div>

            {/* ── Depends on ────────────────────────────────────────────────── */}
            {allFields.length > 0 && (
                <div className="rounded-lg border border-indigo-200 bg-white p-3">
                    <p className="mb-2 text-xs font-semibold text-indigo-700">
                        Conditional display (Depends on)
                    </p>
                    <label className="block text-xs text-gray-600 mb-1">
                        Show this field only when
                    </label>
                    <select
                        value={dependsOn?.fieldId ?? ''}
                        onChange={(e) => handleDepFieldChange(e.target.value)}
                        className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                    >
                        <option value="">— always show —</option>
                        {allFields.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.label} ({f.id})
                            </option>
                        ))}
                    </select>

                    {dependsOn?.fieldId && (
                        <div className="mt-2">
                            <label className="block text-xs text-gray-600 mb-1">
                                …equals
                                {depSourceValues.length === 0 && (
                                    <span className="ml-1 text-gray-400">
                                        (type a value)
                                    </span>
                                )}
                            </label>
                            {depSourceValues.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {depSourceValues.map((v, i) => {
                                        const label =
                                            depSourceField?.validation
                                                ?.enumNames?.[i] ?? v;
                                        const checked =
                                            dependsOn.values.includes(v);
                                        return (
                                            <label
                                                key={v}
                                                className="flex items-center gap-1 text-xs text-gray-700"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={(e) =>
                                                        handleDepValuesChange(
                                                            v,
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="rounded border-gray-300 text-indigo-600"
                                                />
                                                {label}
                                            </label>
                                        );
                                    })}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={dependsOn.values.join(', ')}
                                    placeholder="value1, value2, …"
                                    onChange={(e) => {
                                        const vals = e.target.value
                                            .split(',')
                                            .map((v) => v.trim())
                                            .filter(Boolean);
                                        onDependencyChange({
                                            ...dependsOn,
                                            values: vals,
                                        });
                                    }}
                                    className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                                />
                            )}
                            {dependsOn.values.length > 0 && (
                                <p className="mt-1 text-xs text-gray-400">
                                    Field shown when{' '}
                                    <code className="text-indigo-600">
                                        {dependsOn.fieldId}
                                    </code>{' '}
                                    ={' '}
                                    {dependsOn.values.map((v) => (
                                        <code
                                            key={v}
                                            className="ml-1 text-indigo-600"
                                        >
                                            {v}
                                        </code>
                                    ))}
                                </p>
                            )}
                        </div>
                    )}

                    {dependsOn?.fieldId && (
                        <button
                            type="button"
                            onClick={() => onDependencyChange(undefined)}
                            className="mt-2 text-xs text-red-400 hover:text-red-600"
                        >
                            Remove dependency
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
