import {
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    Accordion as AccordionRoot,
    AccordionTrigger,
} from '@radix-ui/react-accordion';
import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';
import {
    Icon,
    IconType,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import { useState } from 'react';

import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import style from './object-field.module.css';
import fieldStyles from '../field-template/field-template.module.css';
export function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
    const { expandable, help, defaultItemLabel, width } = getUiOptions(
        props.uiSchema
    );
    const helpText = help;
    const [openSection, setOpenSection] = useState(true);
    const helpInformation = helpText && (
        <Tooltip
            trigger={
                <CircleInfoIcon
                    onClick={(e) => e.preventDefault()}
                    height={'16px'}
                    width={'16px'}
                    className="tooltip-primary"
                />
            }
            placement={TooltipPlacement.TopRight}
            replaceElement
        >
            {helpText}
        </Tooltip>
    );

    const classes = props.uiSchema?.inline
        ? style.customRow
        : style.customColumn;
    const content = (
        <div className={`my-0 px-0 ${classes} `}>
            {props.properties
                .filter((element) => {
                    return element.hidden !== true;
                })
                .map((element) => {
                    return (
                        <div
                            key={element.name}
                            className={
                                width
                                    ? `${style[width as string]}`
                                    : 'property-wrapper flex flex-col'
                            }
                        >
                            {element.content}
                        </div>
                    );
                })}
        </div>
    );

    return (
        <>
            {expandable ? (
                <AccordionRoot type="single" value={props.title}>
                    <AccordionItem
                        key={props.title}
                        value={props.title}
                        className="rounded-lg border-2 border-gray-100"
                    >
                        <AccordionHeader>
                            <AccordionTrigger
                                className={`flex flex-wrap w-full items-center justify-between ${
                                    openSection ? 'rounded-t-lg' : 'rounded-lg'
                                } py-2 px-4`}
                                onClick={() => setOpenSection(!openSection)}
                            >
                                <div className="flex gap-2 items-center">
                                    {openSection === true ? (
                                        <div
                                            onClick={() =>
                                                setOpenSection(false)
                                            }
                                        >
                                            <Icon
                                                type={IconType.CHEVRON}
                                                height={20}
                                                width={20}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setOpenSection(true)}
                                        >
                                            <Icon
                                                type={IconType.CHEVRON_RIGHT}
                                                height={20}
                                                width={20}
                                            />
                                        </div>
                                    )}
                                    <div className={style.text}>
                                        {(replacePlaceholders(
                                            props.title,
                                            props?.formData,
                                            true,
                                            true
                                        ) ||
                                            defaultItemLabel) ??
                                            ''}
                                    </div>
                                    {props.required && (
                                        <span
                                            className={
                                                fieldStyles.requiredAsterisk
                                            }
                                        >
                                            {'\u00A0'}
                                            {'\u002A'}{' '}
                                        </span>
                                    )}
                                    {helpInformation}
                                </div>
                            </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent>
                            <div className="flex flex-col w-full justify-between border-b-2 border-gray-100 bg-gray-50 px-4 last:rounded-b-lg last:border-b-0">
                                {openSection && (
                                    <div className="py-2">{content}</div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </AccordionRoot>
            ) : (
                <>
                    {props.title && (
                        <div className={'flex my-1'}>
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
