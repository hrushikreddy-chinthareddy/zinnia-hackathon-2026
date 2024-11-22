import { FieldProps } from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';

export function StringField(props: FieldProps) {
    const { title } = props;
    return <Label>{title}</Label>;
}
