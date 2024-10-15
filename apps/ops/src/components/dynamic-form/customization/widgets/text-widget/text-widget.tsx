import { WidgetProps } from '@rjsf/utils';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';

export const TextWidget = function (props: WidgetProps) {
    const { id, value, disabled } = props;
    return (disabled as boolean) ? (
        <div>{props.value}</div>
    ) : (
        <TextField id={id} name={id} value={value} disabled={props.disabled || false} />
    );
};

export default TextWidget;
