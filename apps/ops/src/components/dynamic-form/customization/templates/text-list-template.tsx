import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';

const variantMap: { [key: string]: AssistiveTextVariant } = {
    error: AssistiveTextVariant.Error,
    success: AssistiveTextVariant.Success,
    info: AssistiveTextVariant.Info,
};

const getVariant = (value: string): AssistiveTextVariant => {
    return variantMap[value.toLowerCase()] || AssistiveTextVariant.Info;
};

export default function TextListTemplate(props: ArrayFieldTemplateProps): JSX.Element {
    const { formData, title, uiSchema } = props;
    const keyName = uiSchema?.['ui:options']?.keyName;
    let list = [];
    if (typeof keyName === 'string') {
        list = formData.map((item: { [key: string]: any }) => item[keyName]) ?? [];
    }
    const type = 'error';

    return (
        <div>
            <label className="text-xs">{title}</label>
            <ul className="mt-2">
                {list.map((text: string, index: number) => (
                    <AssistiveText className="mb-2" key={index} text={text} variant={getVariant(type)} />
                ))}
            </ul>
        </div>
    );
}
