import { RegistryWidgetsType } from '@rjsf/utils';

import ArithmeticOperationWidget from './arithmetic-operation-widget/arithmetic-operation-widget';
import CheckboxWidget from './checkbox-widget/checkbox-widget';
import CheckBoxesSelectWidget from './checkboxes-select-widget/checkboxes-select-widget';
import CheckboxesWidget from './checkboxes-widget/checkboxes-widget';
import DateWidget from './date-widget/date-widget';
import AttachmentWidget from './file-widget/attachment-widget';
import FileWidget from './file-widget/file-widget';
import HyperLinkWidget from './hyper-link-widget/hyper-link-widget';
import NotesWidget from './notes-widget/notes-widget';
import RadioWidget from './radio-widget/radio-widget';
import SelectWidget from './select-widget/select-widget';
import TextWidget from './text-widget/text-widget';
import ValueWidget from './text-widget/value-widget';
import TextareaWidget from './textarea-widget/textarea-widget';

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
    };
}

export default generateWidgets();
