import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';
import { Tooltip, TooltipPlacement } from '@zinnia/bloom/components';

import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import style from './object-field.module.css';

export function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
    const uiOptions = getUiOptions(props.uiSchema);
    const helpText = uiOptions.help;

    const helpInformation = helpText && (
        <Tooltip
            trigger={<CircleInfoIcon onClick={e => e.preventDefault()} height={'16px'} width={'16px'} className="text-primary" />}
            placement={TooltipPlacement.TopRight}
        >
            {helpText}
        </Tooltip>
    );

    return (
        <div>
            {props.title && (
                <div className={'flex my-2'}>
                    <div className={style.container}>
                        <div className={style.text}>{props.title}</div>
                        {helpInformation}
                    </div>
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
