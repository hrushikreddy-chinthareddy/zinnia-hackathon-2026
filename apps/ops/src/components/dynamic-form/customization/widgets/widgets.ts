import { RegistryWidgetsType } from '@rjsf/utils';

import ArithmeticOperationWidget from './arithmetic-operation-widget/arithmetic-operation-widget';
import TransactionAccordion from './bene-transaction-accordion/bene-transaction-accordion';
import PercentageWidget from './beneficiary-allocation-percentage/beneficiary-allocation-percentage';
import CheckboxWidget from './checkbox-widget/checkbox-widget';
import CheckBoxesSelectWidget from './checkboxes-select-widget/checkboxes-select-widget';
import CheckboxesWidget from './checkboxes-widget/checkboxes-widget';
import DateWidget from './date-widget/date-widget';
import NewDateWidget from './date-widget/new-date-widget';
import EmailWidget from './email-widget/email-widget';
import AttachmentWidget from './file-widget/attachment-widget';
import FileWidget from './file-widget/file-widget';
import HyperLinkWidget from './hyper-link-widget/hyper-link-widget';
import NotesWidget from './notes-widget/notes-widget';
import NumbersWidget from './numbers/numbers';
import RadioWidget from './radio-widget/radio-widget';
import SelectWidget from './select-widget/select-widget';
import SSNWidget from './ssn-widget/ssn-widget';
import TextWidget from './text-widget/text-widget';
import ValueWidget from './text-widget/value-widget';
import TextareaWidget from './textarea-widget/textarea-widget';
import TitleWidget from './title-widget/titile-widget';

export function generateWidgets(): RegistryWidgetsType {
    return {
        CheckboxWidget,
        CheckboxesWidget,
        CheckBoxesSelectWidget,
        TextWidget,
        TextareaWidget,
        SelectWidget,
        DateWidget,
        RadioWidget,
        ValueWidget,
        FileWidget,
        HyperLinkWidget,
        NotesWidget,
        AttachmentWidget,
        ArithmeticOperationWidget,
        TransactionAccordion,
        PercentageWidget,
        EmailWidget,
        NumbersWidget,
        NewDateWidget,
        SSNWidget,
        TitleWidget,
    };
}

export default generateWidgets();
