import { RegistryWidgetsType } from '@rjsf/utils';

import CheckboxWidget from './checkbox-widget/checkbox-widget';
import CheckboxesWidget from './checkboxes-widget/checkboxes-widget';
import DateWidget from './date-widget/date-widget';
import FileWidget from './file-widget/file-widget';
import RadioWidget from './radio-widget/radio-widget';
import SelectWidget from './select-widget/select-widget';
import TextWidget from './text-widget/text-widget';
import ValueWidget from './text-widget/value-widget';

export function generateWidgets(): RegistryWidgetsType {
    return {
        CheckboxWidget,
        CheckboxesWidget,
        TextWidget,
        SelectWidget,
        DateWidget,
        RadioWidget,
        ValueWidget,
        FileWidget,
    };
}

export default generateWidgets();
