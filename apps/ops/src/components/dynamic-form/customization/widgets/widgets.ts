import { RegistryWidgetsType } from '@rjsf/utils';

import CheckboxWidget from './checkbox-widget/checkbox-widget';
import DateWidget from './date-widget/date-widget';
import RadioWidget from './radio-widget/radio-widget';
import SelectWidget from './select-widget/select-widget';
import TextWidget from './text-widget/text-widget';

export function generateWidgets(): RegistryWidgetsType {
    return {
        CheckboxWidget,
        TextWidget,
        SelectWidget,
        DateWidget,
        RadioWidget,
    };
}

export default generateWidgets();
