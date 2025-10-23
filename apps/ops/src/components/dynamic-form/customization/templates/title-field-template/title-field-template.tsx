import { TitleFieldProps } from '@rjsf/utils';

import Content from '@deps/components/content/content';

import classes from './title-field.module.css';

export function TitleFieldTemplate(props: TitleFieldProps) {
    const { title, uiSchema } = props;
    const fontSize = (uiSchema?.['ui:options']?.fontSize as number) || 32;

    return (
        <Content className={`${classes.text} text-[${fontSize}px]`}>
            {title}
        </Content>
    );
}
