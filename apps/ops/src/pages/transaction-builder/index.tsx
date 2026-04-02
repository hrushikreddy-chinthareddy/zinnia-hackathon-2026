import fs from 'fs';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import path from 'path';
import React, { useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import type { TransactionDefinition } from '@deps/lib/transaction-builder/types';
import nextI18nextConfig from 'next-i18next.config';

import type { GetServerSideProps } from 'next';

const DEFINITIONS_PATH = path.join(
    process.cwd(),
    'src',
    'data',
    'transaction-builder',
    'definitions.json'
);

interface Props {
    transactions: TransactionDefinition[];
}

export default function TransactionBuilderDashboard({ transactions }: Props) {
    const router = useRouter();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newId, setNewId] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [createError, setCreateError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [list, setList] = useState(transactions);

    async function handleCreate() {
        setCreateError(null);
        const id = newId.trim().toUpperCase().replace(/\s+/g, '_');
        const label = newLabel.trim();
        if (!id || !label) {
            setCreateError('Both fields are required.');
            return;
        }
        const now = new Date().toISOString();
        const def: TransactionDefinition = {
            id,
            label,
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
        };
        const res = await fetch('/api/transaction-builder/definitions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(def),
        });
        if (!res.ok) {
            const json = (await res.json()) as { error?: string };
            setCreateError(json.error ?? 'Failed to create.');
            return;
        }
        const created = (await res.json()) as TransactionDefinition;
        await router.push(`/transaction-builder/${created.id}`);
    }

    async function handleDelete(id: string) {
        if (!confirm(`Delete "${id}"? This cannot be undone.`)) return;
        setDeletingId(id);
        await fetch(`/api/transaction-builder/definitions/${id}`, {
            method: 'DELETE',
        });
        setList((prev) => prev.filter((t) => t.id !== id));
        setDeletingId(null);
    }

    const totalFields = (t: TransactionDefinition) =>
        t.tabs.reduce((sum, tab) => sum + tab.fields.length, 0);

    const timeAgo = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        const d = Math.floor(diff / 86400000);
        if (d === 0) return 'Today';
        if (d === 1) return 'Yesterday';
        return `${d}d ago`;
    };

    const uniqueCarriers = Array.from(
        new Set(list.flatMap((t) => Object.keys(t.carrierOverrides)))
    ).length;

    return (
        <>
            <Head>
                <title>Form Builder — Zinnia Ops</title>
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Page header */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-6xl mx-auto px-8 py-8">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    Transaction Form Builder
                                </h1>
                                <p className="mt-1.5 text-sm text-gray-500 max-w-xl">
                                    Build transaction journeys for Paper and
                                    Self-Serve personas. Rename a field once in
                                    the registry — it updates everywhere.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                            >
                                <span className="text-base leading-none">
                                    +
                                </span>
                                New Transaction
                            </button>
                        </div>

                        {/* Summary stats */}
                        {list.length > 0 && (
                            <div className="mt-6 flex gap-6">
                                {[
                                    {
                                        label: 'Transactions',
                                        value: list.length,
                                    },
                                    {
                                        label: 'Carriers configured',
                                        value: uniqueCarriers,
                                    },
                                    {
                                        label: 'Total field placements',
                                        value: list.reduce(
                                            (s, t) => s + totalFields(t),
                                            0
                                        ),
                                    },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="flex items-baseline gap-2"
                                    >
                                        <span className="text-2xl font-bold text-gray-900">
                                            {stat.value}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {stat.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction grid */}
                <div className="max-w-6xl mx-auto px-8 py-8">
                    <div className="mb-8 flex flex-col gap-4">
                        <Link
                            href="/transaction-builder/docs"
                            className="group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700">
                                    Transactions UI Reference
                                </h2>
                                <p className="mt-1 max-w-2xl text-sm text-gray-600">
                                    Field-by-field documentation for every
                                    transaction type: tabs, personas, carrier
                                    overrides, and the field registry.
                                </p>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                                View docs
                                <span aria-hidden>→</span>
                            </span>
                        </Link>
                        <Link
                            href="/transaction-builder/paper-forms-to-digital"
                            className="group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700">
                                    Paper forms to Digital transactions UI
                                </h2>
                                <p className="mt-1 max-w-2xl text-sm text-gray-600">
                                    Upload a carrier PDF to extract structure
                                    and preview a generated digital transaction
                                    flow.
                                </p>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                                Open tool
                                <span aria-hidden>→</span>
                            </span>
                        </Link>
                    </div>
                    {list.length === 0 ? (
                        <EmptyState onCreate={() => setShowCreateModal(true)} />
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {list.map((t) => (
                                <TransactionCard
                                    key={t.id}
                                    transaction={t}
                                    totalFields={totalFields(t)}
                                    timeAgo={timeAgo(t.updatedAt)}
                                    isDeleting={deletingId === t.id}
                                    onDelete={() => handleDelete(t.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create modal */}
            {showCreateModal && (
                <CreateModal
                    newId={newId}
                    newLabel={newLabel}
                    error={createError}
                    onIdChange={setNewId}
                    onLabelChange={setNewLabel}
                    onClose={() => {
                        setShowCreateModal(false);
                        setCreateError(null);
                        setNewId('');
                        setNewLabel('');
                    }}
                    onCreate={() => void handleCreate()}
                />
            )}
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TransactionCard({
    transaction: t,
    totalFields,
    timeAgo,
    isDeleting,
    onDelete,
}: {
    transaction: TransactionDefinition;
    totalFields: number;
    timeAgo: string;
    isDeleting: boolean;
    onDelete: () => void;
}) {
    const carrierCount = Object.keys(t.carrierOverrides).length;

    return (
        <div className="group relative flex flex-col rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all duration-200">
            {/* Accent bar */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />

            <div className="flex-1 p-6">
                {/* ID + version */}
                <div className="flex items-center justify-between gap-3 mb-3">
                    <code className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {t.id}
                    </code>
                    <span className="text-xs text-gray-400">v{t.version}</span>
                </div>

                {/* Label */}
                <h2 className="text-base font-semibold text-gray-900 leading-snug mb-2">
                    {t.label}
                </h2>

                {/* Description */}
                {t.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {t.description}
                    </p>
                )}

                {/* Metrics */}
                <div className="flex flex-wrap gap-2 mt-auto">
                    <Pill color="slate">
                        {t.tabs.length} tab{t.tabs.length !== 1 ? 's' : ''}
                    </Pill>
                    <Pill color="slate">
                        {totalFields} field{totalFields !== 1 ? 's' : ''}
                    </Pill>
                    {carrierCount > 0 && (
                        <Pill color="violet">
                            {carrierCount} carrier
                            {carrierCount !== 1 ? 's' : ''}
                        </Pill>
                    )}
                </div>

                {/* Personas */}
                <div className="flex gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Paper
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-2.5 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        Self-Serve
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs text-gray-400">Updated {timeAgo}</span>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                    >
                        {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                    <Link
                        href={`/transaction-builder/${t.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                    >
                        Open
                        <span className="opacity-70">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Pill({
    children,
    color,
}: {
    children: React.ReactNode;
    color: 'slate' | 'violet';
}) {
    const cls =
        color === 'violet'
            ? 'bg-violet-50 text-violet-700 border-violet-100'
            : 'bg-gray-100 text-gray-600 border-gray-200';
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${cls}`}
        >
            {children}
        </span>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24 text-center">
            <div className="mb-4 text-5xl">🗂️</div>
            <h3 className="text-base font-semibold text-gray-700">
                No transactions yet
            </h3>
            <p className="mt-1 text-sm text-gray-400 max-w-xs">
                Create your first transaction to start building form journeys.
            </p>
            <button
                type="button"
                onClick={onCreate}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
                <span>+</span> New Transaction
            </button>
        </div>
    );
}

function CreateModal({
    newId,
    newLabel,
    error,
    onIdChange,
    onLabelChange,
    onClose,
    onCreate,
}: {
    newId: string;
    newLabel: string;
    error: string | null;
    onIdChange: (v: string) => void;
    onLabelChange: (v: string) => void;
    onClose: () => void;
    onCreate: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.45)' }}
        >
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                        New Transaction
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                        Define the ID and display name for this journey.
                    </p>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Transaction ID
                        </label>
                        <input
                            autoFocus
                            value={newId}
                            onChange={(e) => onIdChange(e.target.value)}
                            placeholder="OWNER_CHANGE"
                            className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-mono placeholder-gray-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                        <p className="mt-1.5 text-xs text-gray-400">
                            Uppercase, underscores only. Stored as the key in
                            definitions.json.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Display Name
                        </label>
                        <input
                            value={newLabel}
                            onChange={(e) => onLabelChange(e.target.value)}
                            placeholder="Owner Change"
                            className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onCreate();
                            }}
                        />
                    </div>
                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50/60 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onCreate}
                        className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                    >
                        Create & Edit →
                    </button>
                </div>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
    locale = DEFAULT_LOCALE,
}) => {
    const translations = await serverSideTranslations(
        locale,
        [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
        nextI18nextConfig,
        ALL_LOCALES
    );
    const raw = fs.readFileSync(DEFINITIONS_PATH, 'utf-8');
    const definitions = JSON.parse(raw) as Record<
        string,
        TransactionDefinition
    >;
    const transactions = Object.values(definitions);
    return { props: { ...translations, transactions } };
};
