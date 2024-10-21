import { TitleFieldProps } from '@rjsf/utils';

import TitleField from './title-field';

export function TitleFieldTemplate(props: TitleFieldProps) {
    const { title, schema, registry } = props;
    return <TitleField title={title} id={props.id} schema={schema} registry={registry}></TitleField>;
}
