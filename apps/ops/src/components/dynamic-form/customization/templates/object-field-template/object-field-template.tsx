import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';
import { Tooltip } from '@zinnia/bloom/components';
import clsx from 'clsx';

import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import style from './object-field.module.css';

export function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
    const uiOptions = getUiOptions(props.uiSchema);
    const helpText = uiOptions.help;

    const helpInformation = helpText && (
        <Tooltip trigger={<CircleInfoIcon height={'16px'} width={'16px'} className="text-primary" />}>{helpText}</Tooltip>
    );

    return (
        <div className="mt-2">
            {props.title && (
                <div className={clsx('my-4 typography-titles-subtitle flex', style.container)}>
                    {props.title}
                    {helpInformation}
                </div>
            )}

            {props.description}
            <div className="my-0 px-0  w-full">
                {props.properties
                    .filter(element => element.hidden !== true)
                    .map(element => {
                        return (
                            <div key={element.name} className="property-wrapper flex flex-col">
                                {element.content}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
