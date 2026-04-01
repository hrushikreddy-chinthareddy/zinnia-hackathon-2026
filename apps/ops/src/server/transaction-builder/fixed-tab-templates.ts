import { promises as fs } from 'fs';
import path from 'path';

type TabTemplate = {
    title: string;
    formSchema: Record<string, unknown>;
    uiSchema: Record<string, unknown>;
};

type FixedTabTemplateMap = {
    ownerDetails: TabTemplate;
    summary: TabTemplate;
    signature: TabTemplate;
    confirm: TabTemplate;
};

const BENECHANGE_PATH = path.join(
    process.cwd(),
    'src',
    'jsonschema-mock-service',
    'tasks',
    'DEFAULT',
    'initiate-benechange-transaction.json'
);

let cache: FixedTabTemplateMap | null = null;

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractTemplateFromTab(
    tab: unknown,
    fallbackTitle: string
): TabTemplate {
    if (!isRecord(tab)) {
        return {
            title: fallbackTitle,
            formSchema: {
                type: 'object',
                title: fallbackTitle,
                properties: {},
                required: [],
            },
            uiSchema: { 'ui:submitButtonOptions': { norender: true } },
        };
    }

    const title = typeof tab.title === 'string' ? tab.title : fallbackTitle;
    const formSchema = isRecord(tab.formSchema)
        ? (tab.formSchema as Record<string, unknown>)
        : { type: 'object', title, properties: {}, required: [] };
    const uiSchema = isRecord(tab.uiSchema)
        ? (tab.uiSchema as Record<string, unknown>)
        : { 'ui:submitButtonOptions': { norender: true } };

    return {
        title,
        formSchema: clone(formSchema),
        uiSchema: clone(uiSchema),
    };
}

function buildConfirmTemplate(): TabTemplate {
    return {
        title: 'Confirm',
        formSchema: {
            type: 'object',
            title: 'Confirm',
            properties: {
                confirmReady: {
                    type: 'boolean',
                    title: 'I confirm the transaction details are reviewed and ready to submit.',
                },
            },
            required: ['confirmReady'],
        },
        uiSchema: {
            'ui:submitButtonOptions': { norender: true },
            confirmReady: { 'ui:widget': 'CheckboxWidget' },
        },
    };
}

async function loadTemplates(): Promise<FixedTabTemplateMap> {
    if (cache) return cache;

    const raw = await fs.readFile(BENECHANGE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const schemaContent = isRecord(parsed.schemaContent)
        ? (parsed.schemaContent as Record<string, unknown>)
        : {};
    const tabSchemas = Array.isArray(schemaContent.tabSchemas)
        ? schemaContent.tabSchemas
        : [];

    const findByTitle = (title: string): unknown =>
        tabSchemas.find(
            (tab) =>
                isRecord(tab) &&
                typeof tab.title === 'string' &&
                tab.title.toLowerCase() === title.toLowerCase()
        );

    cache = {
        ownerDetails: extractTemplateFromTab(
            findByTitle('Owner Details'),
            'Owner Details'
        ),
        summary: extractTemplateFromTab(findByTitle('Summary'), 'Summary'),
        signature: extractTemplateFromTab(
            findByTitle('Signature'),
            'Signature'
        ),
        confirm: buildConfirmTemplate(),
    };

    return cache;
}

export async function getFixedTabTemplates(): Promise<FixedTabTemplateMap> {
    const templates = await loadTemplates();
    return {
        ownerDetails: clone(templates.ownerDetails),
        summary: clone(templates.summary),
        signature: clone(templates.signature),
        confirm: clone(templates.confirm),
    };
}
