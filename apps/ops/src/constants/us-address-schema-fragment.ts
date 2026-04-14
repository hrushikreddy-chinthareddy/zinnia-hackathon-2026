import { DEFAULT_FIELD_REGISTRY } from '@deps/lib/transaction-builder/field-registry';

const stateValidation = DEFAULT_FIELD_REGISTRY.state.validation;
const US_STATE_CODES = [...(stateValidation.enum ?? [])] as string[];
const US_STATE_LABELS = [...(stateValidation.enumNames ?? [])] as string[];

/**
 * Standard nested US address block for RJSF (matches AddressFieldTemplate + ZipCodeWidget).
 */
export function buildStandardUsAddressObjectSchema(
    blockTitle: string
): Record<string, unknown> {
    return {
        type: 'object',
        title: blockTitle,
        properties: {
            addressLine1: {
                type: 'string',
                title: 'Address',
            },
            addressLine2: {
                type: 'string',
                title: 'Address line 2',
            },
            city: { type: 'string', title: 'City' },
            state: {
                type: 'string',
                title: 'State',
                enum: US_STATE_CODES,
                enumNames: US_STATE_LABELS,
            },
            zipCode: {
                type: 'string',
                title: 'ZIP Code',
                maxLength: 10,
            },
            country: {
                type: 'string',
                title: 'Country',
                default: 'USA',
            },
        },
        required: ['addressLine1', 'city', 'state', 'zipCode'],
    };
}

export function buildStandardUsAddressUiSchema(): Record<string, unknown> {
    return {
        'ui:ObjectFieldTemplate': 'AddressFieldTemplate',
        addressLine1: { 'ui:widget': 'TextWidget' },
        addressLine2: { 'ui:widget': 'TextWidget' },
        city: { 'ui:widget': 'TextWidget' },
        state: { 'ui:widget': 'SelectWidget' },
        zipCode: { 'ui:widget': 'ZipCodeWidget' },
        country: { 'ui:widget': 'TextWidget', 'ui:readonly': true },
    };
}
