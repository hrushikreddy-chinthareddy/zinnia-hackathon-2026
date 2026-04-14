export type TransactionArchetype =
    | 'party_change_complex'
    | 'party_change_standard'
    | 'data_entry_processing'
    | 'non_financial_micro'
    | 'financial_other'
    | 'unknown';

export type TransactionClassificationKey =
    | 'beneficiary_change'
    | 'annuitant_change'
    | 'assignee_change'
    | 'payee_change'
    | 'owner_change'
    | 'bank_change'
    | 'unknown';

export interface TransactionClassification {
    key: TransactionClassificationKey;
    taskTypeHint: string;
    processSubTypeHint: string;
    confidence: number;
    reasons: string[];
}

export type CanonicalFieldType =
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'date'
    | 'email'
    | 'phone'
    | 'ssn'
    | 'select'
    | 'array'
    | 'object';

export interface CanonicalFieldOption {
    value: string;
    label: string;
}

export interface CanonicalField {
    key: string;
    label: string;
    type: CanonicalFieldType;
    required: boolean;
    description?: string;
    constraints?: string[];
    options?: CanonicalFieldOption[];
}

export interface CanonicalSection {
    id: string;
    title: string;
    sourceAnchors: string[];
    fields: CanonicalField[];
}

export interface CanonicalRepeatableEntity {
    key: string;
    title: string;
    minItems?: number;
    maxItems?: number;
    fields: string[];
    rowFields?: string[];
    variants?: Array<{
        key: string;
        title: string;
        anchor?: string;
    }>;
}

export interface CanonicalModel {
    transactionKeySuggestion: string;
    transactionName: string;
    archetype: TransactionArchetype;
    summary: string;
    sections: CanonicalSection[];
    repeatableEntities: CanonicalRepeatableEntity[];
    globalConstraints: string[];
    requiredArtifacts: {
        hasReviewGate: boolean;
        hasSignatureBlock: boolean;
        hasSummaryIntent: boolean;
        hasNigoPotential: boolean;
    };
}

export interface InferredTabSchema {
    id: string;
    title: string;
    purpose: string;
    sectionRefs: string[];
    fieldRefs: string[];
    required: boolean;
}

export interface TabInference {
    archetype: TransactionArchetype;
    tabSchemas: InferredTabSchema[];
    gatingRules: {
        includeReviewGate: boolean;
        includeNigoSummary: boolean;
        includeSignature: boolean;
        includeSummary: boolean;
    };
    notes: string[];
}

export interface ExtractionSectionAnchor {
    key: string;
    title: string;
    anchor: string;
}

export interface ExtractionRepeatedLabel {
    label: string;
    occurrences: number;
}

export interface ExtractionStructuredGroupVariant {
    key: string;
    title: string;
    anchor: string;
}

export interface ExtractionStructuredGroup {
    key: string;
    title: string;
    rationale: string;
    variants: ExtractionStructuredGroupVariant[];
    rowFieldLabels: string[];
}

export interface LlmReadyExtractionPayload {
    transactionContext: string;
    inferredFormName?: string;
    sourceFormText: string;
    sourceFormTextByPage: Array<{
        pageNumber: number;
        normalizedText: string;
    }>;
    inferredSections: ExtractionSectionAnchor[];
    inferredRepeatedGroups: Array<{
        key: string;
        rationale: string;
        repeatedLabels: ExtractionRepeatedLabel[];
    }>;
    inferredStructuredGroups: ExtractionStructuredGroup[];
    inferredConstraints: string[];
    inferredSignals: {
        hasSignatureLanguage: boolean;
        hasDateLanguage: boolean;
        hasAddressLanguage: boolean;
        hasPhoneLanguage: boolean;
        hasIdentifierLanguage: boolean;
        hasPercentageLanguage: boolean;
        hasOptionalClauses: boolean;
        hasCheckboxLikeLanguage: boolean;
    };
    extractionMeta: {
        mode: string;
        itemsMode: string;
        pageCount: number;
        pagesProcessed: number;
        warnings: string[];
        truncatedForModel?: boolean;
    };
}

export interface PriorHintCount {
    name: string;
    occurrences: number;
    frequency: number;
}

export interface FieldPrior {
    fieldPath: string;
    sampleType: string;
    occurrences: number;
    occurrenceFrequency: number;
    requiredFrequency: number;
    requiredWhenPresent: number;
}

export interface TabPrior {
    title: string;
    occurrences: number;
    occurrenceRate: number;
    averageIndex: number;
    commonFields: FieldPrior[];
    widgetHints: PriorHintCount[];
    templateHints: PriorHintCount[];
}

export interface ArchetypeContextPack {
    archetype: TransactionArchetype;
    sampleSize: number;
    sourceTaskTypes: string[];
    commonTabOrder: Array<{
        title: string;
        occurrenceRate: number;
        averageIndex: number;
    }>;
    tabPriors: TabPrior[];
    globalWidgetHints: PriorHintCount[];
    globalTemplateHints: PriorHintCount[];
    softPriorRules: string[];
}

export interface GeneratedTabSchemaDraft {
    id: string;
    title: string;
    formSchema: Record<string, unknown>;
    uiSchema: Record<string, unknown>;
    priorHintsApplied?: string[];
}

export interface SchemaGenerationResult {
    tabSchemas: GeneratedTabSchemaDraft[];
    notes: string[];
}

export interface Phase2ContextTabPlan {
    id: string;
    title: string;
    purpose: string;
    fieldRefs: string[];
    sectionRefs: string[];
}

export interface Phase2ContextSectionField {
    key: string;
    label: string;
    type: CanonicalFieldType;
    required: boolean;
    constraints: string[];
}

export interface Phase2ContextSection {
    id: string;
    title: string;
    fields: Phase2ContextSectionField[];
}

export interface Phase2PriorTabHint {
    title: string;
    occurrenceRate: number;
    averageIndex: number;
    commonFields: FieldPrior[];
    widgetHints: PriorHintCount[];
    templateHints: PriorHintCount[];
}

export interface Phase2GenerationContext {
    transactionKeySuggestion: string;
    transactionName: string;
    pdfFormName: string;
    archetype: TransactionArchetype;
    transactionClassification?: TransactionClassification;
    extractedConstraints: string[];
    canonicalSections: Phase2ContextSection[];
    repeatableEntities: Array<{
        key: string;
        title: string;
        minItems?: number;
        maxItems?: number;
        rowFields: string[];
        variants: Array<{
            key: string;
            title: string;
            anchor?: string;
        }>;
    }>;
    tabPlan: Phase2ContextTabPlan[];
    priorTabHints: Phase2PriorTabHint[];
    priorGlobalWidgetHints: PriorHintCount[];
    priorGlobalTemplateHints: PriorHintCount[];
    softPriorRules: string[];
    fixedSkeleton?: {
        applied: boolean;
        fixedTitles: string[];
        dynamicMiddleTitle: string;
    };
}

export interface FullRjsfOutput {
    formId: string;
    process: string;
    processSubType: string;
    taskType: string;
    formSchema: {
        type: 'object';
    };
    uiSchema: {
        type: 'object';
    };
    schemaContent: {
        tabSchemas: Array<{
            id?: string;
            title: string;
            formSchema: Record<string, unknown>;
            uiSchema: Record<string, unknown>;
        }>;
    };
    generationMeta: {
        archetype: TransactionArchetype;
        source: 'ai_phase2_generation';
        fixedSkeletonApplied: boolean;
        generatedAt: string;
        notes: string[];
    };
}

export interface GenerationQualityReport {
    fixedTabReuse: Array<{
        title: string;
        usedFixedTemplate: boolean;
        fieldCount: number;
    }>;
    dynamicMiddle: {
        title: string;
        generatedFieldCount: number;
        canonicalFieldCoverage: number;
        priorAlignment: number;
    };
    notes: string[];
}
