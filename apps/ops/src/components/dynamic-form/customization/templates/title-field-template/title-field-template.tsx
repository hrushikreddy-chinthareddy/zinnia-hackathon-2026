import { TitleFieldProps } from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';

export function TitleFieldTemplate(props: TitleFieldProps) {
    const { title } = props;
    return <Label>{title}</Label>;
}
