import { WidgetProps } from '@rjsf/utils';
import { Checkbox } from '@zinnia/bloom/components';

export const CheckboxWidget = function (props: WidgetProps) {
    return (
        <Checkbox id={props.id} label={String(props.label)} onChange={() => props.onChange(!props.value)}>
            {String(props.value)} Checkbox text
        </Checkbox>
    );
};
export default CheckboxWidget;
