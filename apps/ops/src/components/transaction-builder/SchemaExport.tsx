import React, { useState } from 'react';

import type { ComposedSchema } from '@deps/lib/transaction-builder/types';

interface SchemaExportProps {
    schema: ComposedSchema | null;
}

type ViewMode = 'flat' | 'tabs' | 'formMetadata';

export default function SchemaExport({ schema }: SchemaExportProps) {
    const [mode, setMode] = useState<ViewMode>('formMetadata');
    const [copied, setCopied] = useState(false);

    if (!schema) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Save the transaction to see the generated schema.
            </div>
        );
    }

    function getOutput(): string {
        if (!schema) return '';
        if (mode === 'flat') {
            return JSON.stringify(
                { formSchema: schema.formSchema, uiSchema: schema.uiSchema },
                null,
                2
            );
        }
        if (mode === 'tabs') {
            return JSON.stringify({ tabSchemas: schema.tabSchemas }, null, 2);
        }
        // formMetadata — compatible with the existing FormMetadata interface
        const meta = {
            formSchema: schema.formSchema,
            uiSchema: schema.uiSchema,
            ...(schema.tabSchemas.length > 1
                ? {
                      schemaContent: {
                          tabSchemas: schema.tabSchemas.map((t) => ({
                              title: t.label,
                              formSchema: t.formSchema,
                              uiSchema: t.uiSchema,
                          })),
                      },
                  }
                : {}),
        };
        return JSON.stringify(meta, null, 2);
    }

    function copy() {
        void navigator.clipboard.writeText(getOutput()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    const output = getOutput();

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
                <div className="flex gap-1">
                    {(
                        [
                            { value: 'formMetadata', label: 'FormMetadata' },
                            { value: 'flat', label: 'Flat Schema' },
                            { value: 'tabs', label: 'Tab Schemas' },
                        ] as const
                    ).map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setMode(value)}
                            className={`rounded px-2 py-1 text-xs font-medium ${
                                mode === value
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={copy}
                    className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                >
                    {copied ? 'Copied!' : 'Copy JSON'}
                </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-950 p-3">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-green-400">
                    {output}
                </pre>
            </div>
            <div className="border-t border-gray-200 px-3 py-1.5 text-xs text-gray-400">
                <span className="font-medium text-gray-600">
                    {schema.persona === 'paper' ? 'Paper Form' : 'Self-Serve'}
                </span>
                {schema.carrierId && (
                    <span>
                        {' '}
                        · Carrier:{' '}
                        <span className="font-medium text-gray-600">
                            {schema.carrierId}
                        </span>
                    </span>
                )}
                {' · '}
                {Object.keys(schema.formSchema.properties).length} fields
                {' · '}
                {schema.tabSchemas.length} tab
                {schema.tabSchemas.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
}
