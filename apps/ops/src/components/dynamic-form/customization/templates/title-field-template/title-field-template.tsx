import { ObjectFieldTemplateProps } from '@rjsf/utils';

import classes from './title-field.module.css';

export function TitleFieldTemplate(props: ObjectFieldTemplateProps) {
    const { title, uiSchema } = props;
    const fontSize = (uiSchema?.['ui:options']?.fontSize as number) || 32;

    const fontClass = (fontSize: number) => {
        return fontSize === 24 ? 'text-xl' : fontSize === 16 ? 'text-lg' : '';
    };

    return (
        <div className={`${classes.text} ${fontClass(fontSize)}`}>{title}</div>
    );
}
