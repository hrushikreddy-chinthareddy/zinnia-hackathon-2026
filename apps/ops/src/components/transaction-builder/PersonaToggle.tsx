import React from 'react';

import type { PersonaType } from '@deps/lib/transaction-builder/types';

interface PersonaToggleProps {
    value: PersonaType;
    onChange: (persona: PersonaType) => void;
}

export default function PersonaToggle({ value, onChange }: PersonaToggleProps) {
    return (
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5">
            {(
                [
                    {
                        id: 'paper' as const,
                        label: 'Paper',
                        dot: 'bg-amber-400',
                    },
                    {
                        id: 'selfServe' as const,
                        label: 'Self-Serve',
                        dot: 'bg-teal-400',
                    },
                ] as const
            ).map((opt) => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange(opt.id)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                        value === opt.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${opt.dot} ${
                            value === opt.id ? 'opacity-100' : 'opacity-40'
                        }`}
                    />
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
