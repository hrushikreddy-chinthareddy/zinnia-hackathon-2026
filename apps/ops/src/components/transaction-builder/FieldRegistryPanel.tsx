import React, { useMemo, useState } from 'react';

import type { FieldDefinition } from '@deps/lib/transaction-builder/types';

interface FieldRegistryPanelProps {
    fieldsByGroup: Record<string, FieldDefinition[]>;
    groups: string[];
    activeTabFieldIds: string[];
    onAddField: (fieldId: string) => void;
}

const GROUP_ICONS: Record<string, string> = {
    'Personal Information': '👤',
    Identification: '🪪',
    Contact: '📞',
    Address: '📍',
    Party: '🤝',
    Banking: '🏦',
    Policy: '📋',
    Notes: '📝',
    Signature: '✍️',
};

export default function FieldRegistryPanel({
    fieldsByGroup,
    groups,
    activeTabFieldIds,
    onAddField,
}: FieldRegistryPanelProps) {
    const [search, setSearch] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        new Set(groups)
    );

    const filteredByGroup = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return fieldsByGroup;
        const result: Record<string, FieldDefinition[]> = {};
        for (const group of groups) {
            const fields = (fieldsByGroup[group] ?? []).filter(
                (f) =>
                    f.label.toLowerCase().includes(q) ||
                    f.id.toLowerCase().includes(q) ||
                    (f.tags ?? []).some((t) => t.includes(q))
            );
            if (fields.length > 0) result[group] = fields;
        }
        return result;
    }, [fieldsByGroup, groups, search]);

    const visibleGroups = Object.keys(filteredByGroup);

    function toggleGroup(group: string) {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group);
            else next.add(group);
            return next;
        });
    }

    return (
        <div className="flex h-full flex-col">
            {/* Search */}
            <div className="p-2.5">
                <div className="relative">
                    <svg
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300"
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="none"
                    >
                        <circle
                            cx="6.5"
                            cy="6.5"
                            r="4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                        <path
                            d="M10 10l3.5 3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search fields…"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-7 pr-3 text-xs placeholder-gray-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-100"
                    />
                </div>
            </div>

            {/* Groups */}
            <div className="flex-1 overflow-y-auto">
                {visibleGroups.length === 0 ? (
                    <p className="py-8 text-center text-xs text-gray-400">
                        No fields match.
                    </p>
                ) : (
                    visibleGroups.map((group) => (
                        <div key={group}>
                            <button
                                type="button"
                                onClick={() => toggleGroup(group)}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-base leading-none">
                                    {GROUP_ICONS[group] ?? '•'}
                                </span>
                                <span className="flex-1 text-xs font-semibold text-gray-600 truncate">
                                    {group}
                                </span>
                                <span className="text-gray-300 text-xs">
                                    {expandedGroups.has(group) ? '▾' : '▸'}
                                </span>
                            </button>
                            {expandedGroups.has(group) && (
                                <ul className="pb-1">
                                    {(filteredByGroup[group] ?? []).map(
                                        (field) => {
                                            const inTab =
                                                activeTabFieldIds.includes(
                                                    field.id
                                                );
                                            return (
                                                <li key={field.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            !inTab &&
                                                            onAddField(field.id)
                                                        }
                                                        disabled={inTab}
                                                        title={
                                                            inTab
                                                                ? 'Already in this tab'
                                                                : `Add "${field.label}"`
                                                        }
                                                        className={`flex w-full items-center justify-between px-4 py-1.5 text-left transition-colors ${
                                                            inTab
                                                                ? 'cursor-default text-gray-300'
                                                                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                                                        }`}
                                                    >
                                                        <span className="truncate text-xs">
                                                            {field.label}
                                                        </span>
                                                        <span
                                                            className={`ml-2 shrink-0 text-xs font-bold ${
                                                                inTab
                                                                    ? 'text-gray-200'
                                                                    : 'text-indigo-400 opacity-0 group-hover:opacity-100'
                                                            }`}
                                                        >
                                                            {inTab ? '✓' : '+'}
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        }
                                    )}
                                </ul>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer count */}
            <div className="border-t border-gray-100 px-3 py-2">
                <p className="text-xs text-gray-400">
                    {Object.values(fieldsByGroup).flat().length} fields
                    available
                </p>
            </div>
        </div>
    );
}
