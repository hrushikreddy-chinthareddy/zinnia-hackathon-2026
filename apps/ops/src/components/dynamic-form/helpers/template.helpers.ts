import { ArrayFieldTemplateProps, isObject, UiSchema } from '@rjsf/utils';

import AddressFieldTemplate from '../customization/templates/address-field-template/address-field-template';
import ArrayFieldTableTemplate from '../customization/templates/array-field-template/array-field-table-template';
import ArrayFieldTemplate from '../customization/templates/array-field-template/array-field-template';
import { TransactionsArrayFieldTemplate } from '../customization/templates/array-field-template/TransactionsArrayFieldTemplate';
import { CardTemplate } from '../customization/templates/card-templates/card-template';
import DifferenceTemplate from '../customization/templates/difference-template/difference-template';
import { PartyCardFieldTemplate } from '../customization/templates/field-template/party-card-field-template';
import InstructionsTemplate from '../customization/templates/instructions-template/instructions-template';
import TransactionInstructionTemplate from '../customization/templates/instructions-template/transaction-instruction-template';
import { NigoSummaryTemplate } from '../customization/templates/nigo-summary-template/nigo-summary-template';
import ObjectRowFieldTemplate from '../customization/templates/object-field-template/object-row-template';
import PartyInfoListTemplate from '../customization/templates/party-info-list-template/party-info-list';
import TextListTemplate from '../customization/templates/text-list-template';
import { TitleFieldTemplate } from '../customization/templates/title-field-template/title-field-template';
import { TransactionAccordionTemplate } from '../customization/templates/transaction-accordion/transaction-accordion';

export const UIArrayTemplateMap: Record<
    string,
    (props: ArrayFieldTemplateProps) => React.JSX.Element
> = {
    ['ArrayFieldTemplate']: ArrayFieldTemplate,
    ['ArrayFieldTableTemplate']: ArrayFieldTableTemplate,
    ['TextListTemplate']: TextListTemplate,
    ['TransactionsArrayFieldTemplate']: TransactionsArrayFieldTemplate,
    ['TransactionAccordionTemplate']: TransactionAccordionTemplate,
    ['PartyInfoListTemplate']: PartyInfoListTemplate,
};

export const UIObjectTemplateMap: Record<
    string,
    (props: any) => React.JSX.Element
> = {
    ['CardTemplate']: CardTemplate,
    ['InstructionsTemplate']: InstructionsTemplate,
    ['TransactionInstructionTemplate']: TransactionInstructionTemplate,
    ['AddressFieldTemplate']: AddressFieldTemplate,
    ['ObjectRowFieldTemplate']: ObjectRowFieldTemplate,
    ['DifferenceTemplate']: DifferenceTemplate,
    ['PartyCardFieldTemplate']: PartyCardFieldTemplate,
    ['NigoSummaryTemplate']: NigoSummaryTemplate,
};

export const UIfieldTemplateMap: Record<
    string,
    (props: any) => React.JSX.Element
> = {
    ['TitleFieldTemplate']: TitleFieldTemplate,
};

export const ApplyUITemplates = (uiSchema: UiSchema) => {
    Object.keys(uiSchema || {}).forEach((key) => {
        const currentValue = uiSchema[key];

        // Backward-compat: support direct ui:* template keys when provided as strings.
        if (
            key === 'ui:ArrayFieldTemplate' &&
            typeof currentValue === 'string' &&
            UIArrayTemplateMap[currentValue] !== undefined
        ) {
            uiSchema[key] = UIArrayTemplateMap[currentValue];
            return;
        }
        if (
            key === 'ui:ObjectFieldTemplate' &&
            typeof currentValue === 'string' &&
            UIObjectTemplateMap[currentValue] !== undefined
        ) {
            uiSchema[key] = UIObjectTemplateMap[currentValue];
            return;
        }
        if (
            key === 'ui:FieldTemplate' &&
            typeof currentValue === 'string' &&
            UIfieldTemplateMap[currentValue] !== undefined
        ) {
            uiSchema[key] = UIfieldTemplateMap[currentValue];
            return;
        }

        if (isObject(currentValue)) {
            if (key.indexOf('ui:options') !== -1) {
                Object.keys(uiSchema[key]).forEach((optionKey) => {
                    if (
                        UIArrayTemplateMap[uiSchema[key][optionKey]] !==
                        undefined
                    ) {
                        uiSchema[key][optionKey] =
                            UIArrayTemplateMap[uiSchema[key][optionKey]];
                    }
                    if (
                        UIObjectTemplateMap[uiSchema[key][optionKey]] !==
                        undefined
                    ) {
                        uiSchema[key][optionKey] =
                            UIObjectTemplateMap[uiSchema[key][optionKey]];
                    }
                    if (
                        UIfieldTemplateMap[uiSchema[key][optionKey]] !==
                        undefined
                    ) {
                        uiSchema[key][optionKey] =
                            UIfieldTemplateMap[uiSchema[key][optionKey]];
                    }
                });
            } else if (key.indexOf('ui:') === -1) {
                ApplyUITemplates(uiSchema[key]);
            }
        }
    });
};
