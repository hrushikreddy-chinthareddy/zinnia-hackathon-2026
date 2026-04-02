import { FieldTemplateProps, getUiOptions } from '@rjsf/utils';
import React, { useMemo } from 'react';

import { Label, LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

type GeneratedSummaryEntry = {
    keyPath: string;
    label: string;
    value: string;
};

const EXCLUDED_ROOT_KEYS = new Set([
    'task',
    'actionData',
    'summary',
    'validationUrl',
    'issueResolved',
    'declineReason',
    'carrier',
    'caseId',
    'correlationId',
    'taskType',
    'dataKey',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function humanizeKeyPart(raw: string): string {
    const words = raw
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) return raw;

    return words
        .map((word) => {
            const upper = word.toUpperCase();
            if (upper === 'SSN' || upper === 'ID' || upper === 'DOB') {
                return upper;
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

function formatValue(value: unknown): string | null {
    if (value == null) return null;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? String(value) : null;
    }
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    return null;
}

function collectEntries(
    value: unknown,
    path: string[] = []
): GeneratedSummaryEntry[] {
    const primitive = formatValue(value);
    if (primitive != null) {
        const keyPath = path.join('.');
        const label = path
            .map((part) =>
                /^\d+$/.test(part)
                    ? `Item ${Number(part) + 1}`
                    : humanizeKeyPart(part)
            )
            .join(' / ');
        return [{ keyPath, label: label || 'Value', value: primitive }];
    }

    if (Array.isArray(value)) {
        return value.flatMap((entry, index) =>
            collectEntries(entry, [...path, String(index)])
        );
    }

    if (isRecord(value)) {
        return Object.entries(value).flatMap(([key, entry]) =>
            collectEntries(entry, [...path, key])
        );
    }

    return [];
}

function resolveNestedKey(obj: Record<string, unknown>, path: string): unknown {
    if (!path.trim()) return undefined;
    return path
        .split('.')
        .filter(Boolean)
        .reduce<unknown>((acc, key) => {
            if (!isRecord(acc)) return undefined;
            return acc[key];
        }, obj);
}

export function GeneratedSummaryTemplate(props: FieldTemplateProps) {
    const { formContext = {}, uiSchema = {}, schema = {} } = props;
    const { title: titleText = schema?.title, dataKey = 'generatedFormData' } =
        getUiOptions(uiSchema);

    const entries = useMemo(() => {
        const customData = isRecord(formContext.customData)
            ? (formContext.customData as Record<string, unknown>)
            : {};
        const scoped = resolveNestedKey(customData, String(dataKey));
        const scopedEntries = collectEntries(scoped);
        if (scopedEntries.length > 0) {
            return scopedEntries.slice(0, 300);
        }

        const fallbackRoot = Object.fromEntries(
            Object.entries(customData).filter(
                ([key]) => !EXCLUDED_ROOT_KEYS.has(key)
            )
        );
        const fallbackEntries = collectEntries(fallbackRoot);
        const deduped = Array.from(
            new Map(
                fallbackEntries.map((entry) => [entry.keyPath, entry])
            ).values()
        );
        return deduped.slice(0, 300);
    }, [formContext.customData, dataKey]);

    if (entries.length === 0) {
        return <div>No transaction summary available.</div>;
    }

    return (
        <div className="space-y-8 mb-4">
            <div className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm mb-8">
                {titleText && (
                    <Typography variant={TypographyVariant.H2} className="mb-4">
                        {String(titleText)}
                    </Typography>
                )}
                <div className="flex flex-col gap-6">
                    {entries.map((entry) => (
                        <div key={entry.keyPath}>
                            <Label
                                className="h-6 leading-4.5"
                                label={entry.label}
                                sentenceCase={false}
                                variant={LabelVariant.FieldLabel}
                            />
                            <div className="text-sm whitespace-pre-line font-semibold">
                                {entry.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
