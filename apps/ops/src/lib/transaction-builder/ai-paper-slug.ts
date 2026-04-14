import type { FullRjsfOutput } from '@deps/lib/transaction-builder/pipeline-types';

/** sessionStorage key prefix; value is JSON.stringify(FullRjsfOutput). */
export const AI_PAPER_RJSF_STORAGE_PREFIX = 'ops_ai_paper_rjsf_';

const AI_PAPER_SLUG_PATTERN = /^ai_[a-z0-9_]+$/;

export function isAiPaperSelfServeSlug(slug: string | undefined): boolean {
    return typeof slug === 'string' && AI_PAPER_SLUG_PATTERN.test(slug);
}

/**
 * Machine-safe segment: lowercase, underscores, no spaces (for use after `ai_`).
 */
export function sanitizeToAiTransactionSlugSegment(raw: string): string {
    const cleaned = raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
    return cleaned.length > 0 ? cleaned : 'transaction';
}

/**
 * Default People route segment: `ai_<transaction_name>` from generated output.
 */
export function buildDefaultAiPaperSlugFromOutput(
    output: FullRjsfOutput
): string {
    const base =
        output.processSubType ||
        output.taskType ||
        output.formId ||
        'transaction';
    return `ai_${sanitizeToAiTransactionSlugSegment(base)}`;
}
