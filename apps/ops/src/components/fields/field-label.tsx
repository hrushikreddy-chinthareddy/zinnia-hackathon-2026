import clsx from 'clsx';

import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import { FieldVariant } from './field';

export type FieldLabelProps = {
    label?: string;
    required?: boolean;
    labelTooltip?: string;
    labelTooltipBody?: string;
    variant?: FieldVariant;
    classNames?: string;
    labelClassNames?: string;
    popoverClassName?: string;
    arrow?: boolean;
    isReadOnly?: boolean;
};

export default function FieldLabel({
    label,
    required,
    classNames,
    labelClassNames,
    popoverClassName = '',
    labelTooltip,
    labelTooltipBody = '',
    variant,
    isReadOnly,
}: FieldLabelProps) {
    if (!label) return null;
    const labelClasses = clsx(
        'field-label',
        {
            'text-gray-300': isReadOnly || variant === FieldVariant.Inactive,
            'text-gray-900': variant !== FieldVariant.Inactive,
        },
        labelClassNames
    );

    return (
        <div className={`mb-1 flex items-center gap-2 ${classNames}`}>
            <p className={labelClasses} data-testid={label}>
                {label}
                {required && (
                    <span className="text-semantic-error">&nbsp;*</span>
                )}
            </p>
            {label != 'None' && labelTooltip && labelTooltipBody && (
                <Popover
                    placement={PopoverPlacement.TopRight}
                    title={labelTooltip}
                    body={labelTooltipBody}
                    popoverClassName={popoverClassName}
                >
                    <CircleInfoIcon
                        height={'16px'}
                        width={'16px'}
                        className="text-primary"
                    />
                </Popover>
            )}
        </div>
    );
}
