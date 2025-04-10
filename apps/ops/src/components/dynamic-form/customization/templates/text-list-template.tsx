import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';

const variantMap: { [key: string]: AssistiveTextVariant } = {
    error: AssistiveTextVariant.Error,
    success: AssistiveTextVariant.Success,
    info: AssistiveTextVariant.Info,
};

type FormContextOptions = {
    keyName: string;
    listName: string;
    parseKey?: string;
};

const getVariant = (value: string): AssistiveTextVariant => {
    return variantMap[value.toLowerCase()] || AssistiveTextVariant.Info;
};

export default function TextListTemplate(props: ArrayFieldTemplateProps): JSX.Element {
    const { formData, uiSchema } = props;
    const keyName = uiSchema?.['ui:options']?.keyName;
    const listType = (uiSchema?.['ui:options']?.type as string) || 'error';
    const hasBg = uiSchema?.['ui:options']?.hasBg;
    const { title } = props;
    const formContextOptions: FormContextOptions = uiSchema?.['ui:options']?.formContext as FormContextOptions;

    let list: string[] = [];

    if (typeof keyName === 'string') {
        list = formData.map((item: { [key: string]: any }) => item[keyName]) ?? [];
    }

    if (list.length === 0 && formContextOptions) {
        if (props.formContext[formContextOptions?.keyName][formContextOptions?.listName]) {
            const data = props.formContext[formContextOptions?.keyName][formContextOptions?.listName];
            const parseKey: string = formContextOptions?.parseKey ?? '';

            list = parseKey ? data.map((item: string) => JSON.parse(item)[parseKey]) : data;
        }
    }

    return list.length > 0 ? (
        <div className={`${hasBg ? 'bg-gray-50 w-2/4 p-4' : ''}`}>
            {title && <Typography variant={TypographyVariant.BodySmBold}>{title as any}</Typography>}
            <ul className="mt-3 ml-2">
                {list.map((text: string, index: number) => (
                    <AssistiveText className="mb-2" key={index} text={text} variant={getVariant(listType)} />
                ))}
            </ul>
        </div>
    ) : (
        <></>
    );
}
