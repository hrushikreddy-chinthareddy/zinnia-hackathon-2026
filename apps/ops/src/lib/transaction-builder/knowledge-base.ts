export interface WidgetMetadata {
    name: string;
    displayName: string;
    description: string;
    category: 'Basic' | 'Selection' | 'Date' | 'File' | 'Custom' | 'Display';
    schemaType: 'string' | 'number' | 'boolean' | 'array' | 'object';
    defaultSchema: Record<string, unknown>;
    defaultUiSchema: Record<string, unknown>;
    configurableOptions: string[];
    examples: string[];
}

export interface TemplateMetadata {
    name: string;
    displayName: string;
    description: string;
    applicableTo: 'array' | 'object' | 'field' | 'title';
    uiSchemaKey: string;
    configurableOptions: string[];
    examples: string[];
}
export interface FieldMetadata {
    name: string;
    displayName: string;
    description: string;
    schemaType: string;
    defaultSchema: Record<string, unknown>;
    defaultUiSchema: Record<string, unknown>;
}

export interface PatternMetadata {
    name: string;
    description: string;
    useCase: string;
    formSchema: Record<string, unknown>;
    uiSchema: Record<string, unknown>;
}

// ============================================================================
// WIDGETS KNOWLEDGE BASE
// ============================================================================

export const WidgetsKnowledgeBase: WidgetMetadata[] = [
    // Basic Widgets
    {
        name: 'TextWidget',
        displayName: 'Text Input',
        description:
            'Standard text input field for short text values like names, titles, etc.',
        category: 'Basic',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'Text Field' },
        defaultUiSchema: { 'ui:widget': 'TextWidget' },
        configurableOptions: [
            'placeholder',
            'maxLength',
            'minLength',
            'pattern',
        ],
        examples: [
            'First Name',
            'Last Name',
            'Account Number',
            'Policy Number',
        ],
    },
    {
        name: 'TextareaWidget',
        displayName: 'Text Area',
        description:
            'Multi-line text input for longer content like notes or comments.',
        category: 'Basic',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'Text Area' },
        defaultUiSchema: { 'ui:widget': 'TextareaWidget' },
        configurableOptions: ['placeholder', 'rows', 'maxLength'],
        examples: ['Notes', 'Comments', 'Description', 'Instructions'],
    },
    {
        name: 'NumbersWidget',
        displayName: 'Number Input',
        description:
            'Numeric input field for amounts, quantities, percentages.',
        category: 'Basic',
        schemaType: 'number',
        defaultSchema: { type: 'number', title: 'Number Field' },
        defaultUiSchema: { 'ui:widget': 'NumbersWidget' },
        configurableOptions: ['minimum', 'maximum', 'multipleOf'],
        examples: ['Amount', 'Percentage', 'Quantity', 'Age'],
    },
    {
        name: 'EmailWidget',
        displayName: 'Email Input',
        description: 'Email input with validation.',
        category: 'Basic',
        schemaType: 'string',
        defaultSchema: {
            type: 'string',
            title: 'Email',
            format: 'email',
        },
        defaultUiSchema: { 'ui:widget': 'EmailWidget' },
        configurableOptions: ['placeholder'],
        examples: ['Email Address', 'Contact Email'],
    },
    {
        name: 'ValueWidget',
        displayName: 'Read-only Value',
        description: 'Display-only widget for showing values without editing.',
        category: 'Display',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'Value' },
        defaultUiSchema: { 'ui:widget': 'ValueWidget', 'ui:readonly': true },
        configurableOptions: ['dataType', 'format'],
        examples: ['Policy Number Display', 'Account Balance', 'Status'],
    },
    {
        name: 'TitleWidget',
        displayName: 'Section Title',
        description: 'Display a title/header in the form.',
        category: 'Display',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'Section Title' },
        defaultUiSchema: { 'ui:widget': 'TitleWidget' },
        configurableOptions: ['variant'],
        examples: ['Section Header', 'Form Title'],
    },

    // Selection Widgets
    {
        name: 'SelectWidget',
        displayName: 'Dropdown Select',
        description:
            'Single or multi-select dropdown for choosing from a list of options.',
        category: 'Selection',
        schemaType: 'string',
        defaultSchema: {
            type: 'string',
            title: 'Select Field',
            oneOf: [
                { const: 'option1', title: 'Option 1' },
                { const: 'option2', title: 'Option 2' },
            ],
        },
        defaultUiSchema: { 'ui:widget': 'SelectWidget' },
        configurableOptions: [
            'enumOptions',
            'multiple',
            'placeholder',
            'apiProps',
            'events',
        ],
        examples: [
            'Payment Method',
            'Account Type',
            'State',
            'Relationship',
            'Bank Selection',
        ],
    },
    {
        name: 'RadioWidget',
        displayName: 'Radio Buttons',
        description:
            'Radio button group for single selection from visible options.',
        category: 'Selection',
        schemaType: 'string',
        defaultSchema: {
            type: 'string',
            title: 'Radio Selection',
            oneOf: [
                { const: 'yes', title: 'Yes' },
                { const: 'no', title: 'No' },
            ],
        },
        defaultUiSchema: { 'ui:widget': 'RadioWidget' },
        configurableOptions: ['enumOptions', 'inline'],
        examples: ['Yes/No Questions', 'Gender', 'Preference'],
    },
    {
        name: 'CheckboxWidget',
        displayName: 'Single Checkbox',
        description: 'Single checkbox for boolean true/false values.',
        category: 'Selection',
        schemaType: 'boolean',
        defaultSchema: { type: 'boolean', title: 'Checkbox' },
        defaultUiSchema: { 'ui:widget': 'CheckboxWidget' },
        configurableOptions: ['label'],
        examples: ['Agreement', 'Consent', 'Confirmation'],
    },
    {
        name: 'CheckboxesWidget',
        displayName: 'Checkbox Group',
        description: 'Multiple checkboxes for selecting multiple options.',
        category: 'Selection',
        schemaType: 'array',
        defaultSchema: {
            type: 'array',
            title: 'Checkboxes',
            items: {
                type: 'string',
                oneOf: [
                    { const: 'option1', title: 'Option 1' },
                    { const: 'option2', title: 'Option 2' },
                ],
            },
            uniqueItems: true,
        },
        defaultUiSchema: { 'ui:widget': 'CheckboxesWidget' },
        configurableOptions: ['enumOptions', 'inline'],
        examples: ['Multiple Selections', 'Features', 'Preferences'],
    },
    {
        name: 'CheckBoxesSelectWidget',
        displayName: 'Checkboxes with Select',
        description: 'Combined checkbox and select functionality.',
        category: 'Selection',
        schemaType: 'array',
        defaultSchema: { type: 'array', title: 'Checkbox Select' },
        defaultUiSchema: { 'ui:widget': 'CheckBoxesSelectWidget' },
        configurableOptions: ['enumOptions'],
        examples: ['Complex Multi-select'],
    },

    // Date Widgets
    {
        name: 'DateWidget',
        displayName: 'Date Picker',
        description: 'Date input with calendar picker.',
        category: 'Date',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'Date', format: 'date' },
        defaultUiSchema: { 'ui:widget': 'DateWidget' },
        configurableOptions: ['minDate', 'maxDate', 'format'],
        examples: ['Date of Birth', 'Effective Date', 'Signature Date'],
    },
    {
        name: 'DateWidgetV2',
        displayName: 'Date Picker V2',
        description:
            'Enhanced date input with improved UX (recommended for new forms).',
        category: 'Date',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'Date', format: 'date' },
        defaultUiSchema: { 'ui:widget': 'DateWidgetV2' },
        configurableOptions: [
            'minDate',
            'maxDate',
            'format',
            'disablePast',
            'disableFuture',
        ],
        examples: ['Date of Birth', 'Effective Date', 'Signature Date'],
    },

    // File Widgets
    {
        name: 'FileWidget',
        displayName: 'File Upload',
        description: 'File upload input for documents.',
        category: 'File',
        schemaType: 'string',
        defaultSchema: {
            type: 'string',
            title: 'File Upload',
            format: 'data-url',
        },
        defaultUiSchema: { 'ui:widget': 'FileWidget' },
        configurableOptions: ['accept', 'maxSize'],
        examples: ['Document Upload', 'Image Upload'],
    },
    {
        name: 'AttachmentWidget',
        displayName: 'Attachment',
        description: 'Attachment widget for document references.',
        category: 'File',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'Attachment' },
        defaultUiSchema: { 'ui:widget': 'AttachmentWidget' },
        configurableOptions: ['documentType'],
        examples: ['Voided Check', 'ID Document'],
    },

    // Custom/Domain Widgets
    {
        name: 'NotesWidget',
        displayName: 'Notes',
        description: 'Notes input with special formatting.',
        category: 'Custom',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'Notes' },
        defaultUiSchema: { 'ui:widget': 'NotesWidget' },
        configurableOptions: ['maxLength'],
        examples: ['Case Notes', 'Instructions'],
    },
    {
        name: 'HyperLinkWidget',
        displayName: 'Hyperlink',
        description: 'Display clickable hyperlinks.',
        category: 'Display',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'Link' },
        defaultUiSchema: { 'ui:widget': 'HyperLinkWidget' },
        configurableOptions: ['href', 'target'],
        examples: ['External Link', 'Document Link'],
    },
    {
        name: 'ArithmeticOperationWidget',
        displayName: 'Arithmetic Operation',
        description: 'Display calculated values based on other form fields.',
        category: 'Custom',
        schemaType: 'number',
        defaultSchema: { type: 'number', title: 'Calculated Value' },
        defaultUiSchema: { 'ui:widget': 'ArithmeticOperationWidget' },
        configurableOptions: ['operation', 'fields'],
        examples: ['Total Amount', 'Percentage Calculation'],
    },
    {
        name: 'AllocationPercentageWidget',
        displayName: 'Allocation Percentage',
        description:
            'Widget for fund allocation percentages that must sum to 100%.',
        category: 'Custom',
        schemaType: 'number',
        defaultSchema: { type: 'number', title: 'Allocation %' },
        defaultUiSchema: { 'ui:widget': 'AllocationPercentageWidget' },
        configurableOptions: ['totalField'],
        examples: ['Fund Allocation', 'Beneficiary Percentage'],
    },
    {
        name: 'AgentPercentageWidget',
        displayName: 'Agent Percentage',
        description: 'Agent commission/split percentage widget.',
        category: 'Custom',
        schemaType: 'number',
        defaultSchema: { type: 'number', title: 'Agent Percentage' },
        defaultUiSchema: { 'ui:widget': 'AgentPercentageWidget' },
        configurableOptions: [],
        examples: ['Commission Split'],
    },
    {
        name: 'SummaryWidget',
        displayName: 'Summary Display',
        description: 'Display summary information from form data.',
        category: 'Display',
        schemaType: 'object',
        defaultSchema: { type: 'object', title: 'Summary' },
        defaultUiSchema: { 'ui:widget': 'SummaryWidget' },
        configurableOptions: ['fields'],
        examples: ['Transaction Summary', 'Review Summary'],
    },
    {
        name: 'AgentTransactionAccordion',
        displayName: 'Agent Transaction Accordion',
        description: 'Accordion display for agent transaction details.',
        category: 'Display',
        schemaType: 'object',
        defaultSchema: { type: 'object', title: 'Agent Transaction' },
        defaultUiSchema: { 'ui:widget': 'AgentTransactionAccordion' },
        configurableOptions: [],
        examples: ['Agent Details Accordion'],
    },
    {
        name: 'BeneTransactionAccordion',
        displayName: 'Beneficiary Transaction Accordion',
        description: 'Accordion display for beneficiary transaction details.',
        category: 'Display',
        schemaType: 'object',
        defaultSchema: { type: 'object', title: 'Beneficiary Transaction' },
        defaultUiSchema: { 'ui:widget': 'BeneTransactionAccordion' },
        configurableOptions: [],
        examples: ['Beneficiary Details Accordion'],
    },
];
export const TemplatesKnowledgeBase: TemplateMetadata[] = [
    // Object Templates
    {
        name: 'CardTemplate',
        displayName: 'Card Layout',
        description:
            'Displays object fields in a card format with icon, title, subtitle, and optional details.',
        applicableTo: 'object',
        uiSchemaKey: 'ui:ObjectFieldTemplate',
        configurableOptions: ['cardType', 'icon', 'sectionTitle'],
        examples: [
            'Party Information Card',
            'Document Card',
            'Beneficiary Card',
        ],
    },
    {
        name: 'ObjectFieldTemplate',
        displayName: 'Standard Object',
        description:
            'Default object field layout with all properties rendered.',
        applicableTo: 'object',
        uiSchemaKey: 'ui:ObjectFieldTemplate',
        configurableOptions: [],
        examples: ['Standard Form Section'],
    },
    {
        name: 'ObjectRowFieldTemplate',
        displayName: 'Object Row Layout',
        description: 'Renders object fields in a horizontal row layout.',
        applicableTo: 'object',
        uiSchemaKey: 'ui:ObjectFieldTemplate',
        configurableOptions: ['columns'],
        examples: ['Inline Fields', 'Compact Layout'],
    },
    {
        name: 'InstructionsTemplate',
        displayName: 'Instructions',
        description: 'Display instructions or informational content.',
        applicableTo: 'object',
        uiSchemaKey: 'ui:ObjectFieldTemplate',
        configurableOptions: ['variant'],
        examples: ['Form Instructions', 'Help Text'],
    },
    {
        name: 'AddressFieldTemplate',
        displayName: 'Address Layout',
        description:
            'Specialized template for address fields with proper formatting.',
        applicableTo: 'object',
        uiSchemaKey: 'ui:ObjectFieldTemplate',
        configurableOptions: [],
        examples: ['Mailing Address', 'Physical Address'],
    },
    {
        name: 'DifferenceTemplate',
        displayName: 'Difference Display',
        description: 'Shows differences between old and new values.',
        applicableTo: 'object',
        uiSchemaKey: 'ui:ObjectFieldTemplate',
        configurableOptions: [],
        examples: ['Change Review', 'Before/After Comparison'],
    },
    {
        name: 'ChangeAddressTemplate',
        displayName: 'Address Change',
        description:
            'Template for address change workflows showing old and new addresses.',
        applicableTo: 'object',
        uiSchemaKey: 'ui:ObjectFieldTemplate',
        configurableOptions: [],
        examples: ['Address Change Form'],
    },
    {
        name: 'PartyCardFieldTemplate',
        displayName: 'Party Card',
        description: 'Card template specifically for party/person information.',
        applicableTo: 'object',
        uiSchemaKey: 'ui:ObjectFieldTemplate',
        configurableOptions: [],
        examples: ['Owner Card', 'Beneficiary Card', 'Agent Card'],
    },
    {
        name: 'TransactionSummaryTemplate',
        displayName: 'Transaction Summary',
        description: 'Summary layout for transaction details.',
        applicableTo: 'object',
        uiSchemaKey: 'ui:ObjectFieldTemplate',
        configurableOptions: [],
        examples: ['Transaction Review', 'Payment Summary'],
    },

    // Array Templates
    {
        name: 'ArrayFieldTemplate',
        displayName: 'Standard Array',
        description: 'Default array layout with add/remove buttons.',
        applicableTo: 'array',
        uiSchemaKey: 'ui:ArrayFieldTemplate',
        configurableOptions: ['addable', 'removable', 'orderable'],
        examples: ['List of Items', 'Multiple Entries'],
    },
    {
        name: 'ArrayFieldTableTemplate',
        displayName: 'Table Array',
        description: 'Renders array items in a table format.',
        applicableTo: 'array',
        uiSchemaKey: 'ui:ArrayFieldTemplate',
        configurableOptions: ['columns'],
        examples: ['Data Table', 'Fund List', 'Transaction History'],
    },
    {
        name: 'TransactionsArrayFieldTemplate',
        displayName: 'Transactions Array',
        description: 'Specialized array template for transaction lists.',
        applicableTo: 'array',
        uiSchemaKey: 'ui:ArrayFieldTemplate',
        configurableOptions: [],
        examples: ['Transaction List'],
    },
    {
        name: 'TransactionAccordionTemplate',
        displayName: 'Transaction Accordion',
        description: 'Accordion-style array for expandable transaction items.',
        applicableTo: 'array',
        uiSchemaKey: 'ui:ArrayFieldTemplate',
        configurableOptions: [],
        examples: ['Expandable Transactions'],
    },
    {
        name: 'TextListTemplate',
        displayName: 'Text List',
        description: 'Simple list display for text items.',
        applicableTo: 'array',
        uiSchemaKey: 'ui:ArrayFieldTemplate',
        configurableOptions: [],
        examples: ['Simple List', 'Notes List'],
    },
    {
        name: 'PartyInfoListTemplate',
        displayName: 'Party Info List',
        description: 'List template for multiple parties.',
        applicableTo: 'array',
        uiSchemaKey: 'ui:ArrayFieldTemplate',
        configurableOptions: [],
        examples: ['Beneficiaries List', 'Owners List'],
    },

    // Field Templates
    {
        name: 'FieldTemplate',
        displayName: 'Standard Field',
        description: 'Default field template with label and input.',
        applicableTo: 'field',
        uiSchemaKey: 'ui:FieldTemplate',
        configurableOptions: ['classNames', 'displayLabel'],
        examples: ['Standard Input Field'],
    },
    {
        name: 'TitleFieldTemplate',
        displayName: 'Title Field',
        description: 'Template for rendering field titles/headers.',
        applicableTo: 'title',
        uiSchemaKey: 'ui:TitleFieldTemplate',
        configurableOptions: ['variant'],
        examples: ['Section Title', 'Form Header'],
    },
    {
        name: 'FieldErrorTemplate',
        displayName: 'Field Error',
        description: 'Template for displaying field validation errors.',
        applicableTo: 'field',
        uiSchemaKey: 'ui:FieldErrorTemplate',
        configurableOptions: [],
        examples: ['Validation Error Display'],
    },
];
export const FieldsKnowledgeBase: FieldMetadata[] = [
    {
        name: 'AutoCompleteField',
        displayName: 'Auto Complete',
        description: 'Text field with autocomplete suggestions.',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'Auto Complete' },
        defaultUiSchema: { 'ui:field': 'AutoCompleteField' },
    },
    {
        name: 'DocumentMetadataField',
        displayName: 'Document Metadata',
        description: 'Field for displaying/editing document metadata.',
        schemaType: 'object',
        defaultSchema: { type: 'object', title: 'Document Metadata' },
        defaultUiSchema: { 'ui:field': 'DocumentMetadataField' },
    },
    {
        name: 'UUIDField',
        displayName: 'UUID Field',
        description: 'Auto-generated UUID field.',
        schemaType: 'string',
        defaultSchema: { type: 'string', title: 'UUID' },
        defaultUiSchema: { 'ui:field': 'UUIDField' },
    },
];

// ============================================================================
// COMMON PATTERNS KNOWLEDGE BASE
// ============================================================================

export const PatternsKnowledgeBase: PatternMetadata[] = [
    {
        name: 'personal-information',
        description: 'Standard personal information fields (name, DOB, SSN)',
        useCase: 'Owner, beneficiary, or party personal details',
        formSchema: {
            type: 'object',
            title: 'Personal Information',
            properties: {
                firstName: { type: 'string', title: 'First Name' },
                middleName: { type: 'string', title: 'Middle Name' },
                lastName: { type: 'string', title: 'Last Name' },
                dateOfBirth: {
                    type: 'string',
                    title: 'Date of Birth',
                    format: 'date',
                },
                ssn: { type: 'string', title: 'SSN', maxLength: 11 },
                email: { type: 'string', title: 'Email', format: 'email' },
            },
            required: ['firstName', 'lastName'],
        },
        uiSchema: {
            firstName: { 'ui:widget': 'TextWidget' },
            middleName: { 'ui:widget': 'TextWidget' },
            lastName: { 'ui:widget': 'TextWidget' },
            dateOfBirth: { 'ui:widget': 'DateWidgetV2' },
            ssn: {
                'ui:widget': 'TextWidget',
                'ui:options': { inputType: 'password' },
            },
            email: { 'ui:widget': 'EmailWidget' },
        },
    },
    {
        name: 'address',
        description: 'Standard US address fields',
        useCase: 'Mailing address, physical address, payee address',
        formSchema: {
            type: 'object',
            title: 'Address',
            properties: {
                addressLine1: { type: 'string', title: 'Address Line 1' },
                addressLine2: { type: 'string', title: 'Address Line 2' },
                city: { type: 'string', title: 'City' },
                state: { type: 'string', title: 'State', maxLength: 2 },
                zipCode: { type: 'string', title: 'ZIP Code', maxLength: 10 },
                country: { type: 'string', title: 'Country', default: 'USA' },
            },
            required: ['addressLine1', 'city', 'state', 'zipCode'],
        },
        uiSchema: {
            'ui:ObjectFieldTemplate': 'AddressFieldTemplate',
            addressLine1: { 'ui:widget': 'TextWidget' },
            addressLine2: { 'ui:widget': 'TextWidget' },
            city: { 'ui:widget': 'TextWidget' },
            state: { 'ui:widget': 'SelectWidget' },
            zipCode: { 'ui:widget': 'TextWidget' },
            country: { 'ui:widget': 'TextWidget', 'ui:readonly': true },
        },
    },
    {
        name: 'banking-eft',
        description: 'EFT banking information fields',
        useCase: 'Electronic funds transfer, direct deposit',
        formSchema: {
            type: 'object',
            title: 'Banking Information',
            properties: {
                bankName: { type: 'string', title: 'Bank Name' },
                accountType: {
                    type: 'string',
                    title: 'Account Type',
                    oneOf: [
                        { const: 'Checking', title: 'Checking' },
                        { const: 'Savings', title: 'Savings' },
                    ],
                },
                accountNumber: { type: 'string', title: 'Account Number' },
                reEnterAccountNumber: {
                    type: 'string',
                    title: 'Re-enter Account Number',
                },
                routingNumber: {
                    type: 'string',
                    title: 'Routing Number',
                    maxLength: 9,
                },
                reEnterRoutingNumber: {
                    type: 'string',
                    title: 'Re-enter Routing Number',
                },
                nameOnAccount: { type: 'string', title: 'Name on Account' },
            },
            required: [
                'bankName',
                'accountType',
                'accountNumber',
                'routingNumber',
            ],
        },
        uiSchema: {
            bankName: { 'ui:widget': 'TextWidget' },
            accountType: { 'ui:widget': 'RadioWidget' },
            accountNumber: {
                'ui:widget': 'TextWidget',
                'ui:options': { maskOnBlur: true, disableCopyPaste: true },
            },
            reEnterAccountNumber: {
                'ui:widget': 'TextWidget',
                'ui:options': { disableCopyPaste: true },
            },
            routingNumber: {
                'ui:widget': 'TextWidget',
                'ui:options': { maskOnBlur: true, disableCopyPaste: true },
            },
            reEnterRoutingNumber: {
                'ui:widget': 'TextWidget',
                'ui:options': { disableCopyPaste: true },
            },
            nameOnAccount: { 'ui:widget': 'TextWidget' },
        },
    },
    {
        name: 'check-payment',
        description: 'Check payment disbursement fields',
        useCase: 'Send check disbursement',
        formSchema: {
            type: 'object',
            title: 'Check Payment',
            properties: {
                payeeName: { type: 'string', title: 'Payee Name' },
                isDifferentPayee: {
                    type: 'boolean',
                    title: 'Different Payee or Address',
                },
                mailingAddress: {
                    type: 'object',
                    title: 'Mailing Address',
                    properties: {
                        addressLine1: {
                            type: 'string',
                            title: 'Address Line 1',
                        },
                        addressLine2: {
                            type: 'string',
                            title: 'Address Line 2',
                        },
                        city: { type: 'string', title: 'City' },
                        state: { type: 'string', title: 'State' },
                        zipCode: { type: 'string', title: 'ZIP Code' },
                    },
                },
            },
        },
        uiSchema: {
            payeeName: { 'ui:widget': 'TextWidget' },
            isDifferentPayee: { 'ui:widget': 'CheckboxWidget' },
            mailingAddress: {
                'ui:ObjectFieldTemplate': 'AddressFieldTemplate',
            },
        },
    },
    {
        name: 'signature-validation',
        description: 'Signature validation section',
        useCase: 'Owner, joint owner, spouse, beneficiary signatures',
        formSchema: {
            type: 'object',
            title: 'Signature',
            properties: {
                signatureType: {
                    type: 'string',
                    title: 'Signature Type',
                    oneOf: [
                        { const: 'wet', title: 'Wet Signature' },
                        { const: 'electronic', title: 'Electronic Signature' },
                    ],
                },
                signaturePresent: {
                    type: 'boolean',
                    title: 'Signature Present',
                },
                signatureDate: {
                    type: 'string',
                    title: 'Signature Date',
                    format: 'date',
                },
            },
            required: ['signaturePresent', 'signatureDate'],
        },
        uiSchema: {
            signatureType: { 'ui:widget': 'SelectWidget' },
            signaturePresent: { 'ui:widget': 'CheckboxWidget' },
            signatureDate: { 'ui:widget': 'DateWidgetV2' },
        },
    },
    {
        name: 'payment-method-selection',
        description: 'Payment method selection with EFT, Check, Wire options',
        useCase: 'Disbursement method selection',
        formSchema: {
            type: 'object',
            title: 'Payment Method',
            properties: {
                paymentMethod: {
                    type: 'string',
                    title: 'Payment Method',
                    oneOf: [
                        {
                            const: 'EFT',
                            title: 'Electronic Funds Transfer (EFT)',
                        },
                        { const: 'Check', title: 'Send Check' },
                        { const: 'Wire', title: 'Wire Transfer' },
                        { const: 'DTCC', title: 'DTCC' },
                    ],
                },
            },
            required: ['paymentMethod'],
        },
        uiSchema: {
            paymentMethod: { 'ui:widget': 'RadioWidget' },
        },
    },
    {
        name: 'beneficiary-entry',
        description: 'Beneficiary information with allocation percentage',
        useCase: 'Beneficiary designation',
        formSchema: {
            type: 'object',
            title: 'Beneficiary',
            properties: {
                beneficiaryType: {
                    type: 'string',
                    title: 'Type',
                    oneOf: [
                        { const: 'Primary', title: 'Primary' },
                        { const: 'Contingent', title: 'Contingent' },
                    ],
                },
                firstName: { type: 'string', title: 'First Name' },
                lastName: { type: 'string', title: 'Last Name' },
                relationship: {
                    type: 'string',
                    title: 'Relationship',
                    oneOf: [
                        { const: 'Spouse', title: 'Spouse' },
                        { const: 'Child', title: 'Child' },
                        { const: 'Parent', title: 'Parent' },
                        { const: 'Sibling', title: 'Sibling' },
                        { const: 'Other', title: 'Other' },
                    ],
                },
                allocationPercentage: {
                    type: 'number',
                    title: 'Allocation %',
                    minimum: 0,
                    maximum: 100,
                },
                ssn: { type: 'string', title: 'SSN' },
                dateOfBirth: {
                    type: 'string',
                    title: 'Date of Birth',
                    format: 'date',
                },
            },
            required: [
                'beneficiaryType',
                'firstName',
                'lastName',
                'allocationPercentage',
            ],
        },
        uiSchema: {
            beneficiaryType: { 'ui:widget': 'SelectWidget' },
            firstName: { 'ui:widget': 'TextWidget' },
            lastName: { 'ui:widget': 'TextWidget' },
            relationship: { 'ui:widget': 'SelectWidget' },
            allocationPercentage: { 'ui:widget': 'AllocationPercentageWidget' },
            ssn: {
                'ui:widget': 'TextWidget',
                'ui:options': { inputType: 'password' },
            },
            dateOfBirth: { 'ui:widget': 'DateWidgetV2' },
        },
    },
    {
        name: 'document-review',
        description: 'Document review section with approval fields',
        useCase: 'Document review and approval workflows',
        formSchema: {
            type: 'object',
            title: 'Document Review',
            properties: {
                documentReceived: {
                    type: 'boolean',
                    title: 'Document Received',
                },
                documentValid: { type: 'boolean', title: 'Document Valid' },
                reviewNotes: { type: 'string', title: 'Review Notes' },
                reviewDate: {
                    type: 'string',
                    title: 'Review Date',
                    format: 'date',
                },
            },
        },
        uiSchema: {
            documentReceived: { 'ui:widget': 'CheckboxWidget' },
            documentValid: { 'ui:widget': 'CheckboxWidget' },
            reviewNotes: { 'ui:widget': 'TextareaWidget' },
            reviewDate: { 'ui:widget': 'DateWidgetV2' },
        },
    },
];
export interface ValidationRule {
    name: string;
    description: string;
    appliesTo: ('string' | 'number' | 'array' | 'object' | 'boolean')[];
    schemaProperty: string;
    example: Record<string, unknown>;
    errorMessageKey?: string;
}

export const ValidationKnowledgeBase: ValidationRule[] = [
    // String Validations
    {
        name: 'required',
        description: 'Field must have a value',
        appliesTo: ['string', 'number', 'array', 'object', 'boolean'],
        schemaProperty: 'required (array at parent level)',
        example: { required: ['fieldName'] },
        errorMessageKey: 'is a required property',
    },
    {
        name: 'minLength',
        description: 'Minimum number of characters',
        appliesTo: ['string'],
        schemaProperty: 'minLength',
        example: { type: 'string', minLength: 2 },
        errorMessageKey: 'must NOT have fewer than X characters',
    },
    {
        name: 'maxLength',
        description: 'Maximum number of characters',
        appliesTo: ['string'],
        schemaProperty: 'maxLength',
        example: { type: 'string', maxLength: 50 },
        errorMessageKey: 'must NOT have more than X characters',
    },
    {
        name: 'pattern',
        description: 'Must match a regular expression pattern',
        appliesTo: ['string'],
        schemaProperty: 'pattern',
        example: { type: 'string', pattern: '^[A-Z]{2}$' },
        errorMessageKey: 'must match pattern',
    },
    {
        name: 'format-email',
        description: 'Must be a valid email address',
        appliesTo: ['string'],
        schemaProperty: 'format',
        example: { type: 'string', format: 'email' },
        errorMessageKey: 'must match format "email"',
    },
    {
        name: 'format-date',
        description: 'Must be a valid date (YYYY-MM-DD)',
        appliesTo: ['string'],
        schemaProperty: 'format',
        example: { type: 'string', format: 'date' },
        errorMessageKey: 'must match format "date"',
    },
    {
        name: 'format-uri',
        description: 'Must be a valid URL',
        appliesTo: ['string'],
        schemaProperty: 'format',
        example: { type: 'string', format: 'uri' },
        errorMessageKey: 'must match format "uri"',
    },
    // Number Validations
    {
        name: 'minimum',
        description: 'Minimum numeric value (inclusive)',
        appliesTo: ['number'],
        schemaProperty: 'minimum',
        example: { type: 'number', minimum: 0 },
        errorMessageKey: 'must be >= X',
    },
    {
        name: 'maximum',
        description: 'Maximum numeric value (inclusive)',
        appliesTo: ['number'],
        schemaProperty: 'maximum',
        example: { type: 'number', maximum: 100 },
        errorMessageKey: 'must be <= X',
    },
    {
        name: 'exclusiveMinimum',
        description: 'Minimum numeric value (exclusive)',
        appliesTo: ['number'],
        schemaProperty: 'exclusiveMinimum',
        example: { type: 'number', exclusiveMinimum: 0 },
        errorMessageKey: 'must be > X',
    },
    {
        name: 'exclusiveMaximum',
        description: 'Maximum numeric value (exclusive)',
        appliesTo: ['number'],
        schemaProperty: 'exclusiveMaximum',
        example: { type: 'number', exclusiveMaximum: 100 },
        errorMessageKey: 'must be < X',
    },
    {
        name: 'multipleOf',
        description: 'Must be a multiple of a number',
        appliesTo: ['number'],
        schemaProperty: 'multipleOf',
        example: { type: 'number', multipleOf: 0.01 },
        errorMessageKey: 'must be multiple of X',
    },
    // Array Validations
    {
        name: 'minItems',
        description: 'Minimum number of items in array',
        appliesTo: ['array'],
        schemaProperty: 'minItems',
        example: { type: 'array', minItems: 1 },
        errorMessageKey: 'must NOT have fewer than X items',
    },
    {
        name: 'maxItems',
        description: 'Maximum number of items in array',
        appliesTo: ['array'],
        schemaProperty: 'maxItems',
        example: { type: 'array', maxItems: 10 },
        errorMessageKey: 'must NOT have more than X items',
    },
    {
        name: 'uniqueItems',
        description: 'All items must be unique',
        appliesTo: ['array'],
        schemaProperty: 'uniqueItems',
        example: { type: 'array', uniqueItems: true },
        errorMessageKey: 'must NOT have duplicate items',
    },
    // Conditional Validations
    {
        name: 'if-then-else',
        description: 'Conditional validation based on another field value',
        appliesTo: ['object'],
        schemaProperty: 'if/then/else',
        example: {
            if: { properties: { paymentMethod: { const: 'EFT' } } },
            then: { required: ['accountNumber', 'routingNumber'] },
            else: { required: ['payeeName'] },
        },
    },
    {
        name: 'dependencies',
        description: 'Field becomes required when another field has a value',
        appliesTo: ['object'],
        schemaProperty: 'dependencies',
        example: {
            dependencies: {
                isDifferentPayee: ['payeeName', 'payeeAddress'],
            },
        },
    },
];

// Common validation patterns for specific field types
export const CommonValidationPatterns = {
    ssn: {
        description: 'Social Security Number (XXX-XX-XXXX)',
        schema: {
            type: 'string',
            pattern: '^\\d{3}-?\\d{2}-?\\d{4}$',
            maxLength: 11,
        },
    },
    phoneUS: {
        description: 'US Phone Number',
        schema: {
            type: 'string',
            pattern: '^\\(?\\d{3}\\)?[-\\s]?\\d{3}[-\\s]?\\d{4}$',
        },
    },
    zipCodeUS: {
        description: 'US ZIP Code (5 or 9 digits)',
        schema: {
            type: 'string',
            pattern: '^\\d{5}(-\\d{4})?$',
        },
    },
    routingNumber: {
        description: 'Bank Routing Number (9 digits)',
        schema: {
            type: 'string',
            pattern: '^\\d{9}$',
            minLength: 9,
            maxLength: 9,
        },
    },
    accountNumber: {
        description: 'Bank Account Number (4-17 digits)',
        schema: {
            type: 'string',
            pattern: '^\\d{4,17}$',
            minLength: 4,
            maxLength: 17,
        },
    },
    stateCode: {
        description: 'US State Code (2 letters)',
        schema: {
            type: 'string',
            pattern: '^[A-Z]{2}$',
            minLength: 2,
            maxLength: 2,
        },
    },
    percentage: {
        description: 'Percentage (0-100)',
        schema: {
            type: 'number',
            minimum: 0,
            maximum: 100,
        },
    },
    positiveAmount: {
        description: 'Positive monetary amount',
        schema: {
            type: 'number',
            minimum: 0,
            multipleOf: 0.01,
        },
    },
    futureDate: {
        description: 'Date must be in the future (handled via ui:options)',
        schema: {
            type: 'string',
            format: 'date',
        },
        uiSchema: {
            'ui:widget': 'DateWidgetV2',
            'ui:options': { disablePast: true },
        },
    },
    pastDate: {
        description: 'Date must be in the past (e.g., DOB)',
        schema: {
            type: 'string',
            format: 'date',
        },
        uiSchema: {
            'ui:widget': 'DateWidgetV2',
            'ui:options': { disableFuture: true },
        },
    },
};

// ============================================================================
// UI SCHEMA OPTIONS REFERENCE
// ============================================================================

export const UiSchemaOptionsReference = {
    fieldOptions: {
        'ui:widget': 'Widget name to use (e.g., TextWidget, SelectWidget)',
        'ui:field': 'Custom field component to use',
        'ui:readonly': 'Make field read-only (boolean)',
        'ui:disabled': 'Disable the field (boolean)',
        'ui:hidden': 'Hide the field (boolean)',
        'ui:placeholder': 'Placeholder text',
        'ui:autofocus': 'Auto-focus this field (boolean)',
        'ui:classNames': 'CSS class names to apply',
        'ui:help': 'Help text to display',
        'ui:description': 'Field description',
        'ui:label': 'Show/hide label (boolean)',
        'ui:order': 'Field ordering (array of field names)',
    },
    templateOptions: {
        'ui:ObjectFieldTemplate': 'Template for object fields',
        'ui:ArrayFieldTemplate': 'Template for array fields',
        'ui:FieldTemplate': 'Template for individual fields',
        'ui:TitleFieldTemplate': 'Template for titles',
    },
    widgetOptions: {
        'ui:options': {
            enumOptions: 'Custom options for select/radio widgets',
            inline: 'Display options inline (checkboxes/radio)',
            rows: 'Number of rows for textarea',
            maskOnBlur: 'Mask value on blur (sensitive data)',
            disableCopyPaste: 'Disable copy/paste (for re-enter fields)',
        },
    },
    submitOptions: {
        'ui:submitButtonOptions': {
            norender: 'Hide submit button (boolean)',
            submitText: 'Custom submit button text',
        },
    },
};

export const SemanticUiMappings = [
    {
        semantics: 'phone-number-field',
        appliesWhen:
            'Field represents phone, mobile, telephone, contact number.',
        recommendedUiSchema: {
            'ui:widget': 'NumbersWidget',
            'ui:options': {
                isPhone: true,
            },
        },
        notes: ['Also apply CommonValidationPatterns.phoneUS pattern.'],
    },
    {
        semantics: 'address-object',
        appliesWhen:
            'Object contains address line/city/state/zip style properties.',
        recommendedUiSchema: {
            'ui:options': {
                ObjectFieldTemplate: 'AddressFieldTemplate',
            },
        },
        notes: ['Use TextWidget/SelectWidget for address subfields as needed.'],
    },
    {
        semantics: 'repeatable-party-list',
        appliesWhen:
            'Array of party/entity entries where each row is a person/trust/organization.',
        recommendedUiSchema: {
            'ui:options': {
                ArrayFieldTemplate: 'TransactionAccordionTemplate',
            },
            items: {
                'ui:options': {
                    ObjectFieldTemplate: 'PartyCardFieldTemplate',
                },
            },
        },
        notes: [
            'Prefer this for beneficiary/annuitant/owner party lists.',
            'Keep items.type=object with explicit items.properties.',
        ],
    },
    {
        semantics: 'beneficiary-or-payee-allocation',
        appliesWhen:
            'Percentage allocation field in actionData.party style models.',
        recommendedUiSchema: {
            'ui:widget': 'AllocationPercentageWidget',
        },
        notes: [
            'Use when data model supports cross-row allocation validation context.',
        ],
    },
] as const;

export const RepeatableFieldUiProfiles = [
    {
        profile: 'party-phone-list',
        source: 'jsonschema-mock-service/tasks/DEFAULT/*',
        when: 'Repeatable party/contact object needs one-or-more phone entries.',
        schemaShape: {
            key: 'phones',
            type: 'array',
            itemType: 'object',
            itemProperties: ['phoneType', 'dialNumber', 'isPreferred'],
        },
        uiShape: {
            'ui:options.ArrayFieldTemplate': 'PartyInfoListTemplate',
            'ui:options.addButtonCTA': 'Add Phone',
            'ui:options.title': 'Phone',
            'ui:options.prefferedCTA': 'Preferred Phone',
            'items.ui:options.ObjectFieldTemplate': 'PartyCardFieldTemplate',
            'items.phoneType.ui:widget': 'RadioWidget',
            'items.dialNumber.ui:widget': 'NumbersWidget',
            'items.dialNumber.ui:options': { isPhone: true },
        },
        notes: [
            'Use for party.contact style rows (beneficiary/annuitant/owner/assignee).',
            'Prefer list structure over a single scalar phone_number field.',
        ],
    },
    {
        profile: 'party-email-list',
        source: 'jsonschema-mock-service/tasks/DEFAULT/*',
        when: 'Repeatable party/contact object needs one-or-more email entries.',
        schemaShape: {
            key: 'emails',
            type: 'array',
            itemType: 'object',
            itemProperties: ['emailType', 'emailAddress', 'isPreferred'],
        },
        uiShape: {
            'ui:options.ArrayFieldTemplate': 'PartyInfoListTemplate',
            'ui:options.addButtonCTA': 'Add Email',
            'ui:options.title': 'Email',
            'ui:options.prefferedCTA': 'Preferred Email',
            'items.ui:options.ObjectFieldTemplate': 'PartyCardFieldTemplate',
            'items.emailType.ui:widget': 'RadioWidget',
            'items.emailAddress.ui:widget': 'EmailWidget',
        },
        notes: [
            'Prefer list structure over a single scalar email field in repeatable party rows.',
        ],
    },
    {
        profile: 'party-address-list',
        source: 'jsonschema-mock-service/tasks/DEFAULT/*',
        when: 'Repeatable party/contact object needs one-or-more addresses.',
        schemaShape: {
            key: 'addresses',
            type: 'array',
            itemType: 'object',
            itemProperties: [
                'addressType',
                'addressLine1',
                'city',
                'state',
                'zipCode',
            ],
        },
        uiShape: {
            'ui:options.ArrayFieldTemplate': 'PartyInfoListTemplate',
            'ui:options.addButtonCTA': 'Add Address',
            'ui:options.title': 'Address',
            'items.ui:options.ObjectFieldTemplate': 'PartyCardFieldTemplate',
            'items.state.ui:widget': 'SelectWidget',
            'items.zipCode.ui:widget': 'NumbersWidget',
        },
        notes: [
            'Use AddressFieldTemplate for embedded single address objects when not list-like.',
        ],
    },
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getWidgetByName(name: string): WidgetMetadata | undefined {
    return WidgetsKnowledgeBase.find((w) => w.name === name);
}

export function getWidgetsByCategory(
    category: WidgetMetadata['category']
): WidgetMetadata[] {
    return WidgetsKnowledgeBase.filter((w) => w.category === category);
}

export function getTemplateByName(name: string): TemplateMetadata | undefined {
    return TemplatesKnowledgeBase.find((t) => t.name === name);
}

export function getPatternByName(name: string): PatternMetadata | undefined {
    return PatternsKnowledgeBase.find((p) => p.name === name);
}

export function getAllWidgetNames(): string[] {
    return WidgetsKnowledgeBase.map((w) => w.name);
}

export function getAllTemplateNames(): string[] {
    return TemplatesKnowledgeBase.map((t) => t.name);
}

export function getAllPatternNames(): string[] {
    return PatternsKnowledgeBase.map((p) => p.name);
}

// ============================================================================
// SYSTEM PROMPT BUILDER
// ============================================================================

export function buildSchemaGeneratorSystemPrompt(): string {
    return `You are an expert RJSF (React JSON Schema Form) schema generator for a digital experience platform.

Your task is to generate valid JSON schemas (formSchema) and UI schemas (uiSchema) based on user requirements.

## AVAILABLE WIDGETS

${WidgetsKnowledgeBase.map(
    (w) => `### ${w.name} (${w.displayName})
- Description: ${w.description}
- Category: ${w.category}
- Schema Type: ${w.schemaType}
- Use for: ${w.examples.join(', ')}
- Configurable: ${w.configurableOptions.join(', ') || 'None'}
`
).join('\n')}

## AVAILABLE TEMPLATES

${TemplatesKnowledgeBase.map(
    (t) => `### ${t.name} (${t.displayName})
- Description: ${t.description}
- Applicable to: ${t.applicableTo}
- UI Schema Key: ${t.uiSchemaKey}
- Use for: ${t.examples.join(', ')}
`
).join('\n')}

## COMMON PATTERNS

${PatternsKnowledgeBase.map(
    (p) => `### ${p.name}
- Description: ${p.description}
- Use Case: ${p.useCase}
`
).join('\n')}

## VALIDATION RULES

### String Validations
- required: Add field name to parent's "required" array
- minLength: Minimum characters (e.g., "minLength": 2)
- maxLength: Maximum characters (e.g., "maxLength": 50)
- pattern: Regex pattern (e.g., "pattern": "^[A-Z]{2}$")
- format: Built-in formats - "email", "date", "uri", "date-time"

### Number Validations
- minimum: Minimum value inclusive (e.g., "minimum": 0)
- maximum: Maximum value inclusive (e.g., "maximum": 100)
- exclusiveMinimum/exclusiveMaximum: Exclusive bounds
- multipleOf: Must be multiple of value (e.g., "multipleOf": 0.01 for currency)

### Array Validations
- minItems: Minimum items (e.g., "minItems": 1)
- maxItems: Maximum items (e.g., "maxItems": 10)
- uniqueItems: All items must be unique

### Conditional Validations
Use if/then/else for conditional requirements:
{
"if": { "properties": { "paymentMethod": { "const": "EFT" } } },
"then": { "required": ["accountNumber", "routingNumber"] },
"else": { "required": ["payeeName"] }
}

### Common Validation Patterns
- SSN: pattern "^\\\\d{3}-?\\\\d{2}-?\\\\d{4}$", maxLength 11
- US Phone: pattern "^\\\\(?\\\\d{3}\\\\)?[-\\\\s]?\\\\d{3}[-\\\\s]?\\\\d{4}$"
- ZIP Code: pattern "^\\\\d{5}(-\\\\d{4})?$"
- Routing Number: pattern "^\\\\d{9}$", minLength 9, maxLength 9
- Account Number: pattern "^\\\\d{4,17}$", minLength 4, maxLength 17
- State Code: pattern "^[A-Z]{2}$", minLength 2, maxLength 2
- Percentage: minimum 0, maximum 100
- Currency: minimum 0, multipleOf 0.01

## RULES

1. Always generate BOTH formSchema and uiSchema
2. formSchema must be valid JSON Schema (draft-07)
3. Use appropriate widgets based on field type and purpose
4. Use DateWidgetV2 for all new date fields (not DateWidget)
5. For sensitive data (SSN, account numbers), use maskOnBlur option
6. For re-enter confirmation fields, use disableCopyPaste option
7. Use CardTemplate for grouped information (party info, document info)
8. Use ArrayFieldTableTemplate for tabular data
9. Use AddressFieldTemplate for address objects
10. Include proper 'required' arrays in schemas
11. Use oneOf for select/radio options instead of enum when you need labels
12. Apply validations as requested - use pattern for format validation, min/max for ranges
13. For confirmation fields (re-enter password, re-enter account), add note that validation logic is handled in form helpers
14. Use appropriate error messages via custom validation when needed

## OUTPUT FORMAT

Always respond with valid JSON in this exact format:
{
"formSchema": {
  "type": "object",
  "title": "Form Title",
  "properties": { ... },
  "required": [ ... ]
},
"uiSchema": {
  "ui:submitButtonOptions": { "norender": true },
  "fieldName": { "ui:widget": "WidgetName", ... },
  ...
}
}

Do not include any explanation outside the JSON. The response must be parseable JSON only.`;
}
