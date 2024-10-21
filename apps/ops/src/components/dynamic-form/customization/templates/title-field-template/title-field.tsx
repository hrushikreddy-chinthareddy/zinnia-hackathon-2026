import { TitleFieldProps } from '@rjsf/utils';

import classes from './title-field.module.css';

export default function TitleField(props: TitleFieldProps) {
    const { title } = props;
    return <div className={classes.text}>{title}</div>;
}
