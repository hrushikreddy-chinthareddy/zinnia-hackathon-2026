import { TitleFieldProps } from '@rjsf/utils';

import classes from './title-field.module.css';
export function TitleFieldTemplate(props: TitleFieldProps) {
    const { title } = props;
    return <div className={classes.text}>{title}</div>;
}
