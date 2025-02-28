import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';
import { Icon, IconType, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import { useState } from 'react';

import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import style from './object-field.module.css';

export function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
    const uiOptions = getUiOptions(props.uiSchema);
    const helpText = uiOptions.help;
    const [openSection, setOpenSection] = useState(true);
    const helpInformation = helpText && (
        <Tooltip
            trigger={<CircleInfoIcon onClick={e => e.preventDefault()} height={'16px'} width={'16px'} className="text-primary" />}
            placement={TooltipPlacement.TopRight}
        >
            {helpText}
        </Tooltip>
    );

    const classes = props.uiSchema?.inline ? style.customRow : style.customColumn;
    const content = (
        <div className={`my-0 px-0 ${classes} `}>
            {props.properties
                .filter(element => {
                    return element.hidden !== true;
                })
                .map(element => {
                    return (
                        <div
                            key={element.name}
                            className={uiOptions?.width ? `${style[uiOptions?.width as string]}` : 'property-wrapper flex flex-col'}
                        >
                            {element.content}
                        </div>
                    );
                })}
        </div>
    );

    return (
        <>
            {props.uiSchema?.accord ? (
                <div className="accordion">
                    <div className="accordion-item">
                        <div className="accordion-header" onClick={() => setOpenSection(!openSection)}>
                            {props.title && (
                                <div className={'flex my-2'}>
                                    <div className={style.container}>
                                        <div className={style.text}>{props.title}</div>
                                        {helpInformation}

                                        <Icon width={20} height={20} type={IconType.CHEVRON} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {openSection && content}
                    </div>
                </div>
            ) : (
                <>
                    {props.title && (
                        <div className={'flex my-5'}>
                            <div className={style.container}>
                                <div className={style.text}>{props.title} </div>
                                {helpInformation}
                            </div>
                        </div>
                    )}
                    {content}
                </>
            )}
        </>
    );
}
