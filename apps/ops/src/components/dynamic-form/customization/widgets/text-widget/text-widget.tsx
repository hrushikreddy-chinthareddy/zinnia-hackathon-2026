import { WidgetProps } from '@rjsf/utils';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';

export const TextWidget = function (props: WidgetProps) {
    const { id, value, disabled, onChange } = props;
    console.log('value', id);
    return (disabled as boolean) ? (
        <div>{props.value}</div>
    ) : (
        <TextField id={id} value={value || ''} onChange={onChange} disabled={props.disabled || false} />
    );
};

export default TextWidget;
