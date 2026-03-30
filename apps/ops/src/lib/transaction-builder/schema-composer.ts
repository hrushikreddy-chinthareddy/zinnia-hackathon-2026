/**
 * Schema Composer — generates RJSF-compatible FormMetadata from a
 * TransactionDefinition + FieldRegistry + persona + optional carrierId.
 *
 * Resolution order (last wins):
 *   registry base → registry persona defaults → tab-level overrides
 *   → carrier global → carrier persona → carrier field override
 */

import type {
    CarrierFieldOverride,
    CarrierOverride,
    ComposedSchema,
    ComposedTabSchema,
    FieldDefinition,
    FieldPersonaConfig,
    FieldRegistry,
    JSONSchemaProperty,
    PersonaType,
    TabDefinition,
    TabFieldConfig,
    TransactionDefinition,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fieldTypeToJsonSchemaType(field: FieldDefinition): string {
    switch (field.type) {
        case 'number':
        case 'integer':
            return field.type;
        case 'boolean':
            return 'boolean';
        default:
            return 'string';
    }
}

function fieldTypeToFormat(field: FieldDefinition): string | undefined {
    switch (field.type) {
        case 'date':
            return 'date';
        case 'email':
            return 'email';
        default:
            return undefined;
    }
}

function mergePersonaConfig(
    ...configs: (FieldPersonaConfig | undefined)[]
): FieldPersonaConfig {
    return Object.assign({}, ...configs.filter(Boolean));
}

// ─── Core composer ────────────────────────────────────────────────────────────

export function composeSchema(
    transactionDef: TransactionDefinition,
    fieldRegistry: FieldRegistry,
    persona: PersonaType,
    carrierId: string | null = null
): ComposedSchema {
    const carrierOverride: CarrierOverride | undefined = carrierId
        ? transactionDef.carrierOverrides[carrierId]
        : undefined;

    const tabSchemas: ComposedTabSchema[] = transactionDef.tabs.map((tab) =>
        composeTab(tab, fieldRegistry, persona, carrierOverride)
    );

    // Build flat merged schema (first tab wins for duplicate field IDs)
    const seen = new Set<string>();
    const flatProperties: Record<string, JSONSchemaProperty> = {};
    const flatRequired: string[] = [];
    const flatUiSchema: Record<string, unknown> = {};

    for (const tabSchema of tabSchemas) {
        for (const [key, prop] of Object.entries(
            tabSchema.formSchema.properties
        )) {
            if (!seen.has(key)) {
                seen.add(key);
                flatProperties[key] = prop;
                if (tabSchema.formSchema.required.includes(key)) {
                    flatRequired.push(key);
                }
                if (tabSchema.uiSchema[key] !== undefined) {
                    flatUiSchema[key] = tabSchema.uiSchema[key];
                }
            }
        }
    }

    return {
        transactionId: transactionDef.id,
        label: transactionDef.label,
        taskType: transactionDef.taskType,
        persona,
        carrierId,
        tabSchemas,
        formSchema: {
            type: 'object',
            title: transactionDef.label,
            properties: flatProperties,
            required: flatRequired,
        },
        uiSchema: flatUiSchema,
    };
}

function composeTab(
    tab: TabDefinition,
    registry: FieldRegistry,
    persona: PersonaType,
    carrierOverride: CarrierOverride | undefined
): ComposedTabSchema {
    const properties: Record<string, JSONSchemaProperty> = {};
    const required: string[] = [];
    const uiSchema: Record<string, unknown> = {};

    const sortedFields = [...tab.fields].sort((a, b) => a.order - b.order);

    for (const tabField of sortedFields) {
        const fieldDef = registry[tabField.fieldId];
        if (!fieldDef) continue;

        // Resolve effective config for this field+persona+carrier
        const effectiveConfig = resolveFieldConfig(
            fieldDef,
            tabField,
            persona,
            carrierOverride
        );

        if (effectiveConfig.hidden) continue;

        // Build JSON Schema property
        const prop: JSONSchemaProperty = {
            type: fieldTypeToJsonSchemaType(fieldDef),
            title: effectiveConfig.label ?? fieldDef.label,
        };

        const format = fieldTypeToFormat(fieldDef);
        if (format) prop.format = format;
        if (effectiveConfig.readOnly) prop.readOnly = true;

        const validation = fieldDef.validation ?? {};

        // Apply carrier field-level enum overrides
        const carrierFieldOverride: CarrierFieldOverride | undefined =
            carrierOverride?.fieldOverrides?.[fieldDef.id];

        const effectiveEnum = carrierFieldOverride?.enum ?? validation.enum;
        const effectiveEnumNames =
            carrierFieldOverride?.enumNames ?? validation.enumNames;
        const effectiveLabel =
            carrierFieldOverride?.label ??
            effectiveConfig.label ??
            fieldDef.label;

        prop.title = effectiveLabel;
        if (effectiveEnum) prop.enum = effectiveEnum;
        if (effectiveEnumNames) prop.enumNames = effectiveEnumNames;
        if (carrierFieldOverride?.defaultValue !== undefined)
            prop.default = carrierFieldOverride.defaultValue;
        if (validation.minLength !== undefined)
            prop.minLength = validation.minLength;
        if (validation.maxLength !== undefined)
            prop.maxLength = validation.maxLength;
        if (validation.pattern !== undefined) prop.pattern = validation.pattern;
        if (validation.minimum !== undefined) prop.minimum = validation.minimum;
        if (validation.maximum !== undefined) prop.maximum = validation.maximum;

        properties[fieldDef.id] = prop;

        // Required resolution
        if (effectiveConfig.required) {
            required.push(fieldDef.id);
        }

        // Build uiSchema entry
        const uiEntry: Record<string, unknown> = {};
        if (effectiveConfig.widget ?? fieldDef.widget) {
            uiEntry['ui:widget'] = effectiveConfig.widget ?? fieldDef.widget;
        }
        if (effectiveConfig.readOnly) {
            uiEntry['ui:readonly'] = true;
        }
        if (effectiveConfig.placeholder) {
            uiEntry['ui:placeholder'] = effectiveConfig.placeholder;
        }
        if (effectiveConfig.helpText ?? fieldDef.helpText) {
            uiEntry['ui:help'] = effectiveConfig.helpText ?? fieldDef.helpText;
        }
        if (fieldDef.uiOptions) {
            uiEntry['ui:options'] = fieldDef.uiOptions;
        }
        if (fieldDef.type === 'textarea') {
            uiEntry['ui:widget'] = fieldDef.widget ?? 'textarea';
        }
        if (Object.keys(uiEntry).length > 0) {
            uiSchema[fieldDef.id] = uiEntry;
        }
    }

    return {
        id: tab.id,
        label: tab.label,
        formSchema: {
            type: 'object',
            title: tab.label,
            properties,
            required,
        },
        uiSchema,
    };
}

function resolveFieldConfig(
    field: FieldDefinition,
    tabField: TabFieldConfig,
    persona: PersonaType,
    carrierOverride: CarrierOverride | undefined
): FieldPersonaConfig {
    // 1. Start with registry persona defaults
    const base = field.personas?.[persona] ?? {};

    // 2. Apply tab-level override
    const withTab = mergePersonaConfig(base, tabField.override);

    // 3. Apply carrier global overrides
    const carrierGlobal: FieldPersonaConfig = {};
    if (carrierOverride?.hiddenFields?.includes(field.id))
        carrierGlobal.hidden = true;
    if (carrierOverride?.requiredFields?.includes(field.id))
        carrierGlobal.required = true;
    if (carrierOverride?.readOnlyFields?.includes(field.id))
        carrierGlobal.readOnly = true;

    // 4. Apply carrier persona overrides
    const carrierPersona: FieldPersonaConfig = {};
    const cp = carrierOverride?.personas?.[persona];
    if (cp?.hiddenFields?.includes(field.id)) carrierPersona.hidden = true;
    if (cp?.requiredFields?.includes(field.id)) carrierPersona.required = true;

    // 5. Apply carrier field-level label/helpText overrides
    const carrierField = carrierOverride?.fieldOverrides?.[field.id];
    const carrierFieldConfig: FieldPersonaConfig = {};
    if (carrierField?.label) carrierFieldConfig.label = carrierField.label;
    if (carrierField?.helpText)
        carrierFieldConfig.helpText = carrierField.helpText;
    if (carrierField?.readOnly) carrierFieldConfig.readOnly = true;
    if (carrierField?.hidden) carrierFieldConfig.hidden = true;
    if (carrierField?.required) carrierFieldConfig.required = true;

    return mergePersonaConfig(
        withTab,
        carrierGlobal,
        carrierPersona,
        carrierFieldConfig
    );
}

/** Convert a ComposedSchema to the FormMetadata shape expected by DynamicForm */
export function toFormMetadata(schema: ComposedSchema) {
    return {
        formSchema:
            schema.formSchema as unknown as import('@rjsf/utils').RJSFSchema,
        uiSchema: schema.uiSchema as import('@rjsf/utils').UiSchema,
        schemaContent:
            schema.tabSchemas.length > 1
                ? {
                      tabSchemas: schema.tabSchemas.map((t) => ({
                          title: t.label,
                          formSchema:
                              t.formSchema as unknown as import('@rjsf/utils').RJSFSchema,
                          uiSchema:
                              t.uiSchema as import('@rjsf/utils').UiSchema,
                      })),
                  }
                : undefined,
    };
}
