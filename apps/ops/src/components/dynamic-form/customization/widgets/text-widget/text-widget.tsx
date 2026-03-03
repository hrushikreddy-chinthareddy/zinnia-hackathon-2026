import { getUiOptions, WidgetProps } from '@rjsf/utils';
import {
    Tooltip,
    TooltipPlacement,
    Icon,
    IconType,
} from '@zinnia/bloom/components';
import clsx from 'clsx';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';

import style from './text-widget.module.css';
import { formatValueByDataType } from '../../templates/card-templates/card-template';

const renderLabelWithFlag = (
    label: string,
    missingValueTooltipText: string
) => {
    return (
        <span className={style.labelWithFlag}>
            <span>{label}</span>
            <Tooltip
                placement={TooltipPlacement.TopRight}
                trigger={
                    <span onClick={(e) => e.preventDefault()}>
                        <Icon
                            type={IconType.FLAG}
                            className={style.flagIcon}
                            color="#ff3300"
                        />
                    </span>
                }
                triggerClassName={`${style.flagTrigger} w-fit`}
                replaceElement
            >
                {missingValueTooltipText ?? ''}
            </Tooltip>
        </span>
    );
};

export const TextWidget = function (props: WidgetProps) {
    const {
        id,
        value,
        disabled,
        required,
        rawErrors,
        onChange,
        uiSchema,
        label,
        placeholder,
        readonly,
        hideError,
    } = props;

    const {
        inline,
        prefix,
        inlinetext,
        dataType,
        type,
        labelStyle,
        missingValueTooltipText,
    } = getUiOptions(uiSchema);

    if (inline) {
        return (
            <div className="grid grid-cols-2 text-md max-w-screen-sm">
                <div
                    className={clsx(
                        'text-gray-500',
                        style[type as string],
                        labelStyle && '!text-black'
                    )}
                >
                    {missingValueTooltipText && isNullEmptyOrUndefined(value)
                        ? renderLabelWithFlag(
                              label,
                              missingValueTooltipText as string
                          )
                        : label}
                </div>
                <div>
                    {formatValueByDataType(
                        (dataType as string) || 'text',
                        value
                    )}
                </div>
            </div>
        );
    }

    if (inlinetext) {
        return (
            <div className="text-md ">
                <div className={clsx('text-gray-500', style[type as string])}>
                    {label}
                </div>
                <div>
                    {prefix ? prefix : ''}
                    {formatValueByDataType(
                        (dataType as string) || 'text',
                        value
                    )}
                </div>
            </div>
        );
    }

    return readonly ? (
        <>{formatValueByDataType((dataType as string) || 'text', value)}</>
    ) : (
        <div className="max-w-sm flex w-full flex-col pl-1">
            <TextField
                className={readonly || disabled ? style.readOnly : ''}
                placeholder={placeholder}
                id={id}
                value={value || ''}
                required={required}
                disabled={disabled}
                onChange={onChange}
                hideError={hideError}
                status={
                    rawErrors && rawErrors?.length > 0 ? 'error' : undefined
                }
                readOnly={disabled}
            />
        </div>
    );
};

export default TextWidget;
