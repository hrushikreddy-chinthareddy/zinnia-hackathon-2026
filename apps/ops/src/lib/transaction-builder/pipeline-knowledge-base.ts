import {
    PatternsKnowledgeBase,
    RepeatableFieldUiProfiles,
    SemanticUiMappings,
    TemplatesKnowledgeBase,
    WidgetsKnowledgeBase,
} from './knowledge-base';

import type { TransactionArchetype } from './pipeline-types';

export const TransactionArchetypeKnowledgeBase: Array<{
    archetype: TransactionArchetype;
    description: string;
    defaultTabs: string[];
}> = [
    {
        archetype: 'party_change_complex',
        description:
            'Party-centric change requests with repeatable people/beneficiary entities and allocation logic.',
        defaultTabs: [
            'Review Form Data',
            'Party Details',
            'Relationship / Allocation',
            'Summary',
            'Signature',
            'Confirm',
        ],
    },
    {
        archetype: 'party_change_standard',
        description:
            'Party update with single-entity changes and straightforward required fields.',
        defaultTabs: [
            'Review Form Data',
            'Party Details',
            'Summary',
            'Signature',
            'Confirm',
        ],
    },
    {
        archetype: 'data_entry_processing',
        description:
            'Internal operational data entry or paper-to-digital processing with validation gates.',
        defaultTabs: [
            'Review Form Data',
            'Data Entry',
            'Validation',
            'Summary',
            'Confirm',
        ],
    },
    {
        archetype: 'non_financial_micro',
        description:
            'Small non-financial updates (address/contact/metadata) with minimal branching.',
        defaultTabs: ['Review Form Data', 'Details', 'Summary', 'Confirm'],
    },
    {
        archetype: 'financial_other',
        description:
            'Financial transactions with payout/distribution/tax/payment method decisions.',
        defaultTabs: [
            'Review Form Data',
            'Financial Details',
            'Disbursement',
            'Tax & Acknowledgement',
            'Summary',
            'Signature',
            'Confirm',
        ],
    },
    {
        archetype: 'unknown',
        description:
            'Use when signal is weak. Still produce a safe multi-step plan with review and confirm.',
        defaultTabs: ['Review Form Data', 'Details', 'Summary', 'Confirm'],
    },
];

function widgetsDigest(limit = 26): string {
    return WidgetsKnowledgeBase.slice(0, limit)
        .map((w) => `${w.name}(${w.schemaType})`)
        .join(', ');
}

function templatesDigest(limit = 18): string {
    return TemplatesKnowledgeBase.slice(0, limit)
        .map((t) => `${t.name}[${t.applicableTo}]`)
        .join(', ');
}

function patternsDigest(limit = 14): string {
    return PatternsKnowledgeBase.slice(0, limit)
        .map((p) => p.name)
        .join(', ');
}

function archetypesDigest(): string {
    return TransactionArchetypeKnowledgeBase.map(
        (a) =>
            `- ${a.archetype}: ${
                a.description
            }. Default tabs: ${a.defaultTabs.join(' -> ')}`
    ).join('\n');
}

export function buildCanonicalModelPrompt(): string {
    return `You are a transaction onboarding analyst for an RJSF-based form platform.

Your job is to convert extracted paper-form text into a canonical, implementation-friendly model.

Knowledge context:
- Available widgets (sample): ${widgetsDigest()}
- Available templates (sample): ${templatesDigest()}
- Common schema patterns: ${patternsDigest()}

Transaction archetypes:
${archetypesDigest()}

Output rules:
1) Return JSON only.
2) Preserve only business-relevant fields and constraints.
3) Use stable machine keys (snake_case) for section and field keys.
4) Infer field types conservatively from wording and context.
5) Extract repeatable entities when a block of labels appears multiple times.
6) For repeatable entities, provide row-level fields in rowFields and include variants when present (e.g. primary/contingent, current/new).
7) Keep legacy fields[] populated as well for compatibility (mirror rowFields when needed).
8) Capture global constraints exactly when possible (e.g. "must equal 100", "at least one").
9) Keep output compact and deterministic.
10) When you detect party/entity change forms with variant sections (e.g., "New Owner", "Primary Beneficiary"), use compound prefixes in field keys like "new_owner_", "primary_beneficiary_", etc.
11) For repeatable entities, provide row-level fields in rowFields and include variants when present (e.g. primary/contingent, current/new).
12) CRITICAL: Create a separate "Signature" section for signature-related fields. Fields like "Date (Month/Day/Year)" when near signature language, "City & State where signed", "Witness Signature", "Signature Date", "Acknowledgement" should go in a dedicated signature section, NOT in party/entity sections. Use section id "signature" or "signature_acknowledgement".

Return this exact JSON shape:
{
  "transactionKeySuggestion": "string",
  "transactionName": "string",
  "archetype": "party_change_complex|party_change_standard|data_entry_processing|non_financial_micro|financial_other|unknown",
  "summary": "string",
  "sections": [
    {
      "id": "string",
      "title": "string",
      "sourceAnchors": ["string"],
      "fields": [
        {
          "key": "string",
          "label": "string",
          "type": "string|number|integer|boolean|date|email|phone|ssn|select|array|object",
          "required": true,
          "description": "string",
          "constraints": ["string"],
          "options": [{ "value": "string", "label": "string" }]
        }
      ]
    }
  ],
  "repeatableEntities": [
    {
      "key": "string",
      "title": "string",
      "minItems": 0,
      "maxItems": 0,
      "fields": ["field_key"],
      "rowFields": ["field_key"],
      "variants": [
        {
          "key": "string",
          "title": "string",
          "anchor": "string"
        }
      ]
    }
  ],
  "globalConstraints": ["string"],
  "requiredArtifacts": {
    "hasReviewGate": true,
    "hasSignatureBlock": true,
    "hasSummaryIntent": true,
    "hasNigoPotential": true
  }
}`;
}

export function buildTabInferencePrompt(): string {
    return `You are a transaction flow designer.

Given a canonical model, infer production-ready tab schemas for a TaskContainer-style multi-step flow.

Requirements:
1) Return JSON only.
2) Always include at least one data-collection step before Confirm.
3) Include Review Form Data as the first step unless the canonical model strongly indicates otherwise.
4) Include Signature and Summary when the canonical model indicates those artifacts.
5) Keep 4-8 tabs in most cases.
6) Keep tab IDs machine-safe (snake_case).
7) For each tab, map sectionRefs and fieldRefs from canonical keys.
8) If an archetypeContextPack is provided, treat it as soft statistical guidance only.
9) Never force historical priors when they conflict with canonical source signals.
10) When canonical repeatableEntities include variants, prefer variant-level array field refs (e.g. primary_beneficiaries, contingent_beneficiaries) instead of flattening child row fields.
11) IMPORTANT: Signature tab should contain signature-related fields like: signature date, date signed, city/state where signed, witness signature, acknowledgement. DO NOT put these in the dynamic middle tab. keep those in signature tab.

Archetype defaults:
${TransactionArchetypeKnowledgeBase.map(
    (a) => `- ${a.archetype}: ${a.defaultTabs.join(' -> ')}`
).join('\n')}

Return this exact JSON shape:
{
  "archetype": "party_change_complex|party_change_standard|data_entry_processing|non_financial_micro|financial_other|unknown",
  "tabSchemas": [
    {
      "id": "string",
      "title": "string",
      "purpose": "string",
      "sectionRefs": ["section_id"],
      "fieldRefs": ["field_key"],
      "required": true
    }
  ],
  "gatingRules": {
    "includeReviewGate": true,
    "includeNigoSummary": true,
    "includeSignature": true,
    "includeSummary": true
  },
  "notes": ["string"]
}`;
}

export function buildTabSchemaGenerationPrompt(): string {
    const widgetNames = WidgetsKnowledgeBase.map((w) => w.name).join(', ');
    const templateNames = TemplatesKnowledgeBase.map((t) => t.name).join(', ');
    const patternNames = PatternsKnowledgeBase.map((p) => p.name).join(', ');
    const semanticMappings = JSON.stringify(SemanticUiMappings, null, 2);
    const repeatableProfiles = JSON.stringify(
        RepeatableFieldUiProfiles,
        null,
        2
    );

    return `You are a senior RJSF schema generator for multi-tab transaction forms.

You will receive:
1) phase2Context (canonical fields + repeatable entities + tab plan + historical priors)

Your task:
- Generate complete tabSchemas with formSchema + uiSchema for each tab in phase2Context.tabPlan.
- Use phase2Context canonical fields and tab plan as primary truth.
- Use historical priors as soft guidance only.
- For repeatable entities, model them as arrays with items.type=object and explicit items.properties.

Soft-prior policy (mandatory):
1) Priors are suggestions, not constraints.
2) If canonical/source constraints disagree with priors, follow canonical/source.
3) You may add historically common helper fields only when they do not conflict.
4) Required fields must follow extracted constraints first, priors second.
5) Avoid overfitting to historical tabs.
6) If phase2Context.fixedSkeleton.applied=true, preserve tab order/titles exactly.
7) For fixed skeleton mode, only the dynamic middle tab should be newly synthesized from canonical content.
8) In fixed skeleton mode, dynamic middle tab title must match phase2Context.pdfFormName (the form name inferred from PDF).

RJSF constraints:
- Return valid JSON only.
- Each tab must include:
  - id
  - title
  - formSchema (type=object, properties, required)
  - uiSchema (include ui:submitButtonOptions.norender=true)
- All entries in required must exist in formSchema.properties at the same object level.
- For every array field, always include items.
- Prefer known widgets/templates.
- Date fields should use DateWidgetV2.
- Use patterns when useful but do not force all patterns.
- Template references MUST be configured using ui:options keys (for example ui:options.ArrayFieldTemplate and ui:options.ObjectFieldTemplate).

Widget/template mapping guidance:
- Phone fields: prefer NumbersWidget with { isPhone: true } and keep phone pattern validation.
- Email fields: prefer EmailWidget.
- Date fields: use DateWidgetV2.
- Repeatable party/entity lists: prefer ui:options.ArrayFieldTemplate = "TransactionAccordionTemplate".
- Card-style item objects in repeatable lists: prefer items.ui:options.ObjectFieldTemplate = "PartyCardFieldTemplate".
- Address-like objects (address/city/state/zip): prefer ui:options.ObjectFieldTemplate = "AddressFieldTemplate".
- Allocation percentage fields for party change flows: prefer AllocationPercentageWidget when schema uses actionData.party.beneficiaryPercentage/payeePercentage style models.

Repeatable entity handling:
- When phase2Context.repeatableEntities contains entries, create array fields in formSchema with items.type=object and explicit items.properties.
- Use appropriate array templates like TransactionAccordionTemplate for party lists.

Available widgets:
${widgetNames}

Available templates:
${templateNames}

Common patterns:
${patternNames}

Semantic UI mapping reference (knowledge-base priors):
${semanticMappings}

Repeatable field UI profiles from existing transaction schemas:
${repeatableProfiles}

Return this exact JSON shape:
{
  "tabSchemas": [
    {
      "id": "string",
      "title": "string",
      "formSchema": {
        "type": "object",
        "title": "string",
        "properties": {},
        "required": []
      },
      "uiSchema": {
        "ui:submitButtonOptions": { "norender": true }
      },
      "priorHintsApplied": ["string"]
    }
  ],
  "notes": ["string"]
}`;
}
