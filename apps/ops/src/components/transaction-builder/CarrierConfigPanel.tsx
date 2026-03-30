import React, { useState } from 'react';

import type {
    CarrierOverride,
    FieldDefinition,
    TransactionDefinition,
} from '@deps/lib/transaction-builder/types';
import { carrierNames } from '@deps/utils/carriers';

interface CarrierConfigPanelProps {
    definition: TransactionDefinition;
    fieldRegistry: Record<string, FieldDefinition>;
    onUpdate: (carrierOverrides: Record<string, CarrierOverride>) => void;
}

export default function CarrierConfigPanel({
    definition,
    fieldRegistry,
    onUpdate,
}: CarrierConfigPanelProps) {
    const [activeCarrierId, setActiveCarrierId] = useState<string | null>(
        Object.keys(definition.carrierOverrides)[0] ?? null
    );
    const [addingCarrier, setAddingCarrier] = useState(false);
    const [newCarrierId, setNewCarrierId] = useState('');

    const allFieldIds = Array.from(
        new Set(definition.tabs.flatMap((t) => t.fields.map((f) => f.fieldId)))
    );

    function updateOverride(
        carrierId: string,
        patch: Partial<CarrierOverride>
    ) {
        const current = definition.carrierOverrides[carrierId] ?? { carrierId };
        onUpdate({
            ...definition.carrierOverrides,
            [carrierId]: { ...current, ...patch },
        });
    }

    function addCarrier() {
        const id = newCarrierId.trim().toUpperCase();
        if (!id) return;
        onUpdate({
            ...definition.carrierOverrides,
            [id]: { carrierId: id },
        });
        setActiveCarrierId(id);
        setNewCarrierId('');
        setAddingCarrier(false);
    }

    function removeCarrier(id: string) {
        const next = { ...definition.carrierOverrides };
        delete next[id];
        onUpdate(next);
        if (activeCarrierId === id) {
            setActiveCarrierId(Object.keys(next)[0] ?? null);
        }
    }

    function toggleFieldInList(
        carrierId: string,
        key: 'hiddenFields' | 'requiredFields' | 'readOnlyFields',
        fieldId: string,
        include: boolean
    ) {
        const current: string[] =
            (definition.carrierOverrides[carrierId]?.[key] as
                | string[]
                | undefined) ?? [];
        const next = include
            ? Array.from(new Set([...current, fieldId]))
            : current.filter((f) => f !== fieldId);
        updateOverride(carrierId, {
            [key]: next.length > 0 ? next : undefined,
        });
    }

    const carrierIds = Object.keys(definition.carrierOverrides);
    const activeOverride = activeCarrierId
        ? definition.carrierOverrides[activeCarrierId]
        : null;

    return (
        <div className="flex h-full flex-col">
            {/* Carrier selector bar */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 bg-gray-50 px-3 py-2">
                {carrierIds.map((id) => (
                    <div key={id} className="flex items-center gap-0.5">
                        <button
                            type="button"
                            onClick={() => setActiveCarrierId(id)}
                            className={`rounded-md px-3 py-1 text-sm transition-colors ${
                                id === activeCarrierId
                                    ? 'bg-white font-medium text-gray-900 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {id}
                        </button>
                        <button
                            type="button"
                            onClick={() => removeCarrier(id)}
                            className="rounded p-0.5 text-gray-300 hover:text-red-400"
                            title="Remove carrier"
                        >
                            ×
                        </button>
                    </div>
                ))}
                {addingCarrier ? (
                    <div className="flex items-center gap-1">
                        <input
                            autoFocus
                            list="carrier-list"
                            value={newCarrierId}
                            onChange={(e) => setNewCarrierId(e.target.value)}
                            placeholder="e.g. USAA"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addCarrier();
                                if (e.key === 'Escape') setAddingCarrier(false);
                            }}
                            className="w-28 rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none"
                        />
                        <datalist id="carrier-list">
                            {Object.keys(carrierNames)
                                .filter((k) => !carrierIds.includes(k))
                                .map((k) => (
                                    <option key={k} value={k} />
                                ))}
                        </datalist>
                        <button
                            type="button"
                            onClick={addCarrier}
                            className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={() => setAddingCarrier(false)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setAddingCarrier(true)}
                        className="rounded-md border border-dashed border-gray-300 px-3 py-1 text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500"
                    >
                        + Carrier
                    </button>
                )}
            </div>

            {/* Carrier override editor */}
            <div className="flex-1 overflow-y-auto p-4">
                {!activeCarrierId || !activeOverride ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm text-gray-400">
                            No carrier overrides yet. Add a carrier to configure
                            per-carrier rules.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h3 className="mb-1 text-sm font-semibold text-gray-700">
                                {carrierNames[
                                    activeCarrierId as keyof typeof carrierNames
                                ] ?? activeCarrierId}{' '}
                                <span className="text-xs font-normal text-gray-400">
                                    ({activeCarrierId})
                                </span>
                            </h3>
                            <p className="text-xs text-gray-400">
                                These overrides apply on top of the base
                                transaction for this carrier. Carrier rules
                                override persona defaults.
                            </p>
                        </div>

                        {/* Field override tables */}
                        {(
                            [
                                {
                                    key: 'hiddenFields' as const,
                                    label: 'Hidden Fields',
                                    description:
                                        'These fields will not appear for this carrier.',
                                    color: 'text-gray-500',
                                },
                                {
                                    key: 'requiredFields' as const,
                                    label: 'Required Fields',
                                    description:
                                        'These fields become required for this carrier.',
                                    color: 'text-red-600',
                                },
                                {
                                    key: 'readOnlyFields' as const,
                                    label: 'Read-Only Fields',
                                    description:
                                        'These fields are read-only for this carrier.',
                                    color: 'text-yellow-700',
                                },
                            ] as const
                        ).map(({ key, label, description, color }) => (
                            <div key={key}>
                                <p className="mb-0.5 text-sm font-medium text-gray-700">
                                    {label}
                                </p>
                                <p className="mb-2 text-xs text-gray-400">
                                    {description}
                                </p>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {allFieldIds.map((fieldId) => {
                                        const field = fieldRegistry[fieldId];
                                        const active =
                                            (
                                                activeOverride[key] as
                                                    | string[]
                                                    | undefined
                                            )?.includes(fieldId) ?? false;
                                        return (
                                            <label
                                                key={fieldId}
                                                className={`flex cursor-pointer items-center gap-2 rounded border px-2 py-1.5 text-xs transition-colors ${
                                                    active
                                                        ? 'border-indigo-200 bg-indigo-50'
                                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={active}
                                                    onChange={(e) =>
                                                        toggleFieldInList(
                                                            activeCarrierId,
                                                            key,
                                                            fieldId,
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="rounded border-gray-300 text-indigo-600"
                                                />
                                                <span
                                                    className={
                                                        active
                                                            ? color
                                                            : 'text-gray-600'
                                                    }
                                                >
                                                    {field?.label ?? fieldId}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
