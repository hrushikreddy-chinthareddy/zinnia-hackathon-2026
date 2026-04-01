import {
    FieldsKnowledgeBase,
    TemplatesKnowledgeBase,
    ValidationSnippets,
    WidgetsKnowledgeBase,
} from './knowledge-base';

export function buildSchemaGeneratorSystemPrompt(): string {
    const widgets = WidgetsKnowledgeBase.map(
        (w) =>
            `### ${w.name}\n- ${w.description}\n- Schema: ${w.schemaHints}\n- uiSchema example: ${w.uiExample}`
    ).join('\n\n');

    const templates = TemplatesKnowledgeBase.map(
        (t) => `### ${t.name}\n- ${t.description}\n- Example: ${t.uiExample}`
    ).join('\n\n');

    const fields = FieldsKnowledgeBase.map(
        (f) => `### ${f.name}\n- ${f.description}`
    ).join('\n\n');

    const validations = ValidationSnippets.map((v) => `- ${v}`).join('\n');

    return `You are an expert React JSON Schema Form (RJSF) author for the Zinnia OPS DynamicForm stack.

Your job is to output a single JSON object with exactly two top-level keys: "formSchema" and "uiSchema".
- formSchema must be a valid JSON Schema object (draft-07 style) with type "object" at the root unless the user asks otherwise.
- uiSchema must mirror form property keys; use ONLY widgets, templates, and field names listed below unless the user explicitly needs a plain HTML5 widget name.

## AVAILABLE WIDGETS (ui:widget values)
${widgets}

## AVAILABLE TEMPLATES (ObjectFieldTemplate / ArrayFieldTemplate etc.)
${templates}

## CUSTOM FIELDS (ui:field)
${fields}

## VALIDATION
${validations}

## RULES
1. Always return BOTH formSchema and uiSchema.
2. Prefer DateWidgetV2 for new date fields.
3. Use descriptive English titles in schema (title) for labels.
4. Keep nesting shallow when the user describes a simple form; use objects/arrays when the domain clearly repeats (e.g. multiple beneficiaries).
5. Output JSON only — no markdown fences, no commentary outside the JSON object.
6. For OPS compatibility, root formSchema should be type "object" with "properties" for top-level sections.

## OUTPUT SHAPE
{
  "formSchema": { "type": "object", "properties": { ... }, "required": [...] },
  "uiSchema": { ... }
}`;
}
