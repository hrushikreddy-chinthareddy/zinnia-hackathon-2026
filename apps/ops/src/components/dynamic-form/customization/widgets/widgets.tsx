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

export default function generateWidgets(formData: any, setFormData: (formData: any) => void): RegistryWidgetsType {
    return {
        CheckboxWidget: (props: WidgetProps) => <CheckboxWidget {...props} formData={formData} setFormData={setFormData} />,
        CheckboxesWidget: (props: WidgetProps) => <CheckboxesWidget {...props} formData={formData} setFormData={setFormData} />,
        TextWidget: (props: WidgetProps) => <TextWidget {...props} formData={formData} setFormData={setFormData} />,
        SelectWidget: (props: WidgetProps) => <SelectWidget {...props} formData={formData} setFormData={setFormData} />,
        DateWidget: (props: WidgetProps) => <DateWidget {...props} formData={formData} setFormData={setFormData} />,
        RadioWidget: (props: WidgetProps) => <RadioWidget {...props} formData={formData} setFormData={setFormData} />,
        ValueWidget: (props: WidgetProps) => <ValueWidget {...props} formData={formData} setFormData={setFormData} />,
        FileWidget: (props: WidgetProps) => <FileWidget {...props} formData={formData} setFormData={setFormData} />,
        HyperLinkWidget: (props: WidgetProps) => <HyperLinkWidget {...props} formData={formData} setFormData={setFormData} />,
    };
}
