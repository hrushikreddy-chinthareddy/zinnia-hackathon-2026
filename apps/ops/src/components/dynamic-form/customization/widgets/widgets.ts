import { RegistryWidgetsType } from '@rjsf/utils';

import ArithmeticOperationWidget from './arithmetic-operation-widget/arithmetic-operation-widget';
import CheckboxWidget from './checkbox-widget/checkbox-widget';
import CheckboxesWidget from './checkboxes-widget/checkboxes-widget';
import DateWidget from './date-widget/date-widget';
import AutoCompleteWidget from './file-widget/autocomplete-widget';
import FileWidget from './file-widget/file-widget';
import HyperLinkWidget from './hyper-link-widget/hyper-link-widget';
import NotesWidget from './notes-widget';
import RadioWidget from './radio-widget/radio-widget';
import SelectWidget from './select-widget/select-widget';
import TextWidget from './text-widget/text-widget';
import ValueWidget from './text-widget/value-widget';
import TextareaWidget from './textarea-widget/textarea-widget';

export function generateWidgets(): RegistryWidgetsType {
    return {
        CheckboxWidget,
        CheckboxesWidget,
        TextWidget,
        TextareaWidget,
        SelectWidget,
        DateWidget,
        RadioWidget,
        ValueWidget,
        FileWidget,
        HyperLinkWidget,
        AutoCompleteWidget,
        NotesWidget,
        ArithmeticOperationWidget,
    };
}

export default generateWidgets();
