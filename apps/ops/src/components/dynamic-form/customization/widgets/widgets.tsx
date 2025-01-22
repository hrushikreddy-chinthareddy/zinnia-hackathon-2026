import { RegistryWidgetsType, WidgetProps } from '@rjsf/utils';

import CheckboxWidget from './checkbox-widget/checkbox-widget';
import CheckboxesWidget from './checkboxes-widget/checkboxes-widget';
import DateWidget from './date-widget/date-widget';
import FileWidget from './file-widget/file-widget';
import HyperLinkWidget from './hyper-link-widget/hyper-link-widget';
import RadioWidget from './radio-widget/radio-widget';
import SelectWidget from './select-widget/select-widget';
import TextWidget from './text-widget/text-widget';
import ValueWidget from './text-widget/value-widget';

function generateWidgets(setCustomData: (data: any) => void): RegistryWidgetsType {
    return {
        CheckboxWidget: (props: WidgetProps) => <CheckboxWidget {...props} setCustomData={setCustomData} />,
        CheckboxesWidget: (props: WidgetProps) => <CheckboxesWidget {...props} setCustomData={setCustomData} />,
        TextWidget: (props: WidgetProps) => <TextWidget {...props} setCustomData={setCustomData} />,
        SelectWidget: (props: WidgetProps) => <SelectWidget {...props} setCustomData={setCustomData} />,
        DateWidget: (props: WidgetProps) => <DateWidget {...props} setCustomData={setCustomData} />,
        RadioWidget: (props: WidgetProps) => <RadioWidget {...props} setCustomData={setCustomData} />,
        ValueWidget: (props: WidgetProps) => <ValueWidget {...props} setCustomData={setCustomData} />,
        FileWidget: (props: WidgetProps) => <FileWidget {...props} setCustomData={setCustomData} />,
        HyperLinkWidget: (props: WidgetProps) => <HyperLinkWidget {...props} setCustomData={setCustomData} />,
    };
}

export default generateWidgets;
