// Core types for the Transaction Form Builder system.
// Fields are referenced by ID — rename the label once in the registry,
// all transactions pick it up automatically.

export type FieldType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'integer'
    | 'date'
    | 'email'
    | 'phone'
    | 'ssn'
    | 'select'
    | 'multiselect'
    | 'textarea'
    | 'file';

export type PersonaType = 'paper' | 'selfServe';

export interface FieldValidation {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    enum?: string[];
    enumNames?: string[];
}

/** Per-persona overrides for a field in the registry */
export interface FieldPersonaConfig {
    hidden?: boolean;
    required?: boolean;
    readOnly?: boolean;
    label?: string;
    helpText?: string;
    widget?: string;
    placeholder?: string;
}

/** A field in the central registry. Change `label` here to update all transactions. */
export interface FieldDefinition {
    id: string;
    /** Canonical display label — the single source of truth */
    label: string;
    type: FieldType;
    description?: string;
    helpText?: string;
    validation?: FieldValidation;
    /** Default RJSF widget name (maps to the widgets registry in dynamic-form) */
    widget?: string;
    uiOptions?: Record<string, unknown>;
    personas?: {
        paper?: FieldPersonaConfig;
        selfServe?: FieldPersonaConfig;
    };
    tags?: string[];
    /** Display group for the field registry panel */
    group: string;
}

export type FieldRegistry = Record<string, FieldDefinition>;

/** How a field appears in a tab, with optional per-placement overrides */
export interface TabFieldConfig {
    fieldId: string;
    order: number;
    /** Tab-level override — takes precedence over registry persona defaults */
    override?: FieldPersonaConfig;
}

export interface TabDefinition {
    id: string;
    label: string;
    fields: TabFieldConfig[];
}

/** Carrier-specific field overrides */
export interface CarrierFieldOverride {
    hidden?: boolean;
    required?: boolean;
    readOnly?: boolean;
    label?: string;
    helpText?: string;
    defaultValue?: unknown;
    enum?: string[];
    enumNames?: string[];
}

/** All overrides for a single carrier on a transaction */
export interface CarrierOverride {
    carrierId: string;
    /** Globally hidden field IDs for this carrier */
    hiddenFields?: string[];
    /** Globally required field IDs for this carrier */
    requiredFields?: string[];
    /** Globally read-only field IDs for this carrier */
    readOnlyFields?: string[];
    /** Fine-grained per-field overrides */
    fieldOverrides?: Record<string, CarrierFieldOverride>;
    /** Per-persona carrier overrides */
    personas?: {
        paper?: { hiddenFields?: string[]; requiredFields?: string[] };
        selfServe?: { hiddenFields?: string[]; requiredFields?: string[] };
    };
}

/** A full transaction definition — stored in definitions.json */
export interface TransactionDefinition {
    id: string;
    label: string;
    description: string;
    /** Maps to existing RJSF taskType strings (e.g. "PAYEECHANGE_DATA_ENTRY") */
    taskType: string;
    version: string;
    tabs: TabDefinition[];
    personaConfig: {
        paper: { label: string; description: string };
        selfServe: { label: string; description: string };
    };
    carrierOverrides: Record<string, CarrierOverride>;
    createdAt: string;
    updatedAt: string;
}

// ─── RJSF output types ────────────────────────────────────────────────────────

export interface JSONSchemaProperty {
    type?: string;
    title: string;
    description?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    enum?: string[];
    enumNames?: string[];
    default?: unknown;
    readOnly?: boolean;
    format?: string;
}

export interface ComposedTabSchema {
    id: string;
    label: string;
    formSchema: {
        type: 'object';
        title: string;
        properties: Record<string, JSONSchemaProperty>;
        required: string[];
    };
    uiSchema: Record<string, unknown>;
}

/** Final composed output — compatible with the existing FormMetadata interface */
export interface ComposedSchema {
    transactionId: string;
    label: string;
    taskType: string;
    persona: PersonaType;
    carrierId: string | null;
    /** Multi-tab schema (matches schemaContent.tabSchemas) */
    tabSchemas: ComposedTabSchema[];
    /** Flat merged schema for single-tab / legacy use */
    formSchema: {
        type: 'object';
        title: string;
        properties: Record<string, JSONSchemaProperty>;
        required: string[];
    };
    uiSchema: Record<string, unknown>;
}
