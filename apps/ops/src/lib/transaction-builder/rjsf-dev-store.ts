import type { FullRjsfOutput } from '@deps/lib/transaction-builder/pipeline-types';
import { isProd } from '@deps/utils/environment.helpers';

export type RjsfDevStoreListItem = {
    id: string;
    peopleSlug: string;
    label: string;
    createdAt: string;
};

export function getRjsfDevStoreBaseUrl(): string | null {
    if (isProd()) {
        return null;
    }
    const raw = process.env.NEXT_PUBLIC_RJSF_DEV_STORE_URL?.trim();
    if (!raw) {
        return null;
    }
    return raw.replace(/\/+$/, '');
}

export async function registerFullRjsfOnDevStore(
    fullRjsfOutput: FullRjsfOutput
): Promise<{ id: string; peopleSlug: string; label: string } | null> {
    const base = getRjsfDevStoreBaseUrl();
    if (!base) {
        return null;
    }
    const res = await fetch(`${base}/schemas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullRjsfOutput }),
    });
    if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `Dev store HTTP ${res.status}`);
    }
    return (await res.json()) as {
        id: string;
        peopleSlug: string;
        label: string;
    };
}

export async function fetchFullRjsfFromDevStore(
    id: string
): Promise<FullRjsfOutput | null> {
    const base = getRjsfDevStoreBaseUrl();
    if (!base) {
        return null;
    }
    try {
        const res = await fetch(`${base}/schemas/${encodeURIComponent(id)}`);
        if (!res.ok) {
            return null;
        }
        const body = (await res.json()) as { fullRjsfOutput?: FullRjsfOutput };
        return body.fullRjsfOutput ?? null;
    } catch {
        return null;
    }
}

export async function listRjsfDevStore(): Promise<RjsfDevStoreListItem[]> {
    const base = getRjsfDevStoreBaseUrl();
    if (!base) {
        return [];
    }
    try {
        const res = await fetch(`${base}/schemas`);
        if (!res.ok) {
            return [];
        }
        const body = (await res.json()) as { items?: RjsfDevStoreListItem[] };
        return Array.isArray(body.items) ? body.items : [];
    } catch {
        return [];
    }
}
