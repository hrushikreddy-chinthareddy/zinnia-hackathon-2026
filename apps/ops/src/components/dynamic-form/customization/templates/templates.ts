import AddressFieldTemplate from './address-field-template/address-field-template';
import ArrayFieldItemTemplate from './array-field-item-template/array-field-item-template';
import ArrayFieldTableTemplate from './array-field-template/array-field-table-template';
import ArrayFieldTemplate from './array-field-template/array-field-template';
import { TransactionsArrayFieldTemplate } from './array-field-template/TransactionsArrayFieldTemplate';
import AddButton from './button-templates/add-button/add-button';
import RemoveButton from './button-templates/remove-button/remove-button';
import SubmitButton from './button-templates/submit-button/submit-button';
import { CardTemplate } from './card-templates/card-template';
import DifferenceTemplate from './difference-template/difference-template';
import FieldErrorTemplate from './field-error-template/field-error-template';
import { FieldTemplate } from './field-template/field-template';
import { PartyCardFieldTemplate } from './field-template/party-card-field-template';
import InstructionsTemplate from './instructions-template/instructions-template';
import { ObjectFieldTemplate } from './object-field-template/object-field-template';
import ObjectRowFieldTemplate from './object-field-template/object-row-template';
import PartyInfoListTemplate from './party-info-list-template/party-info-list';
import TextListTemplate from './text-list-template';
import { TitleFieldTemplate } from './title-field-template/title-field-template';
import { TransactionAccordionTemplate } from './transaction-accordion/transaction-accordion';
import { TransactionSummaryTemplate } from './transaction-summary-template/transaction-summary-template';
export function generateTemplates() {
    return {
        TitleFieldTemplate,
        FieldTemplate,
        ArrayFieldTemplate,
        TransactionsArrayFieldTemplate,
        ArrayFieldItemTemplate,
        ObjectFieldTemplate,
        FieldErrorTemplate,
        ArrayFieldTableTemplate,
        CardTemplate,
        InstructionsTemplate,
        TextListTemplate,
        AddressFieldTemplate,
        ObjectRowFieldTemplate,
        DifferenceTemplate,
        TransactionAccordionTemplate,
        PartyCardFieldTemplate,
        PartyInfoListTemplate,
        ButtonTemplates: { AddButton, RemoveButton, SubmitButton },
        TransactionSummaryTemplate,
    };
}

export default generateTemplates();
