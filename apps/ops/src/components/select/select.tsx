import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Select from '@radix-ui/react-select';
import clsx from 'clsx';
import { useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldIcon from '@deps/components/fields/field-icon';
import FieldLabel from '@deps/components/fields/field-label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as ChevronDownIcon } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

import {
    SelectProps,
    getItemClasses,
    getCheckboxClasses,
    getCheckboxFillClasses,
    MultiselectProps,
    SimpleSelectProps,
    getTriggerClasses,
    getSelectedValueClasses,
    MultiselectOption,
    SimpleOption,
} from './select.helpers';
import style from './select.module.css';

const SingleSelectOptions = ({
    options,
    value,
}: Omit<SimpleSelectProps, 'onChange' | 'isMultiselect'>) => {
    return (
        <Select.Viewport>
            {options
                .filter((option) => option.value !== '')
                .map((option: SimpleOption, index: number) => (
                    <Select.Item
                        disabled={option.disabled}
                        value={option.value}
                        key={`option-${option.value}`}
                        className={getItemClasses(
                            option,
                            index,
                            options.length,
                            option.value === value
                        )}
                        aria-label={`Button ${option.label}`}
                    >
                        <Select.ItemText>
                            <Typography
                                variant={
                                    value === option.value
                                        ? TypographyVariant.BodySmBold
                                        : TypographyVariant.BodySm
                                }
                            >
                                {option.label}
                            </Typography>
                            {option.description && (
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className="text-gray-500"
                                >
                                    {option.description}
                                </Typography>
                            )}
                        </Select.ItemText>
                    </Select.Item>
                ))}
        </Select.Viewport>
    );
};

const SingleSelectOptionsWithEmptyValue = ({
    options,
    value,
}: Omit<SimpleSelectProps, 'onChange' | 'isMultiselect'>) => {
    return (
        <Select.Viewport>
            {options
                .filter((option) => option.value !== '')
                .map((option: SimpleOption, index: number) => (
                    <Select.Item
                        disabled={option.disabled}
                        value={option.value}
                        key={`option-${option.value}`}
                        className={getItemClasses(
                            option,
                            index,
                            options.length,
                            option.value === value
                        )}
                        aria-label={`Button ${option.label}`}
                    >
                        <Select.ItemText>
                            <Typography
                                variant={
                                    value === option.value
                                        ? TypographyVariant.BodySmBold
                                        : TypographyVariant.BodySm
                                }
                            >
                                {option.label}
                            </Typography>
                            {option.description && (
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className="text-gray-500"
                                >
                                    {option.description}
                                </Typography>
                            )}
                        </Select.ItemText>
                    </Select.Item>
                ))}
        </Select.Viewport>
    );
};

const MultiselectOptionItem = ({
    options,
    value,
    onChange,
}: MultiselectProps) => {
    return (
        <>
            {options.map((option: MultiselectOption, index: number) => (
                <DropdownMenu.CheckboxItem
                    key={`option-${option.value}`}
                    checked={!!value[option.value]}
                    onCheckedChange={(isChecked) =>
                        onChange(
                            option.value,
                            option.displayText ?? '',
                            isChecked
                        )
                    }
                    onSelect={(e) => e.preventDefault()}
                    className={getItemClasses(
                        option,
                        index,
                        options.length,
                        false
                    )}
                    aria-label={`Button ${option.label}`}
                >
                    {/* Pseudo-element for the checkbox square */}
                    <div className={getCheckboxClasses(!!value[option.value])}>
                        {/* Pseudo-element for the square fill */}
                        <div
                            className={getCheckboxFillClasses(
                                !!value[option.value]
                            )}
                        />
                    </div>
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="ml-2"
                    >
                        {option.label}
                    </Typography>
                    {option.description && (
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className="ml-2 text-gray-500"
                        >
                            {option.description}
                        </Typography>
                    )}
                </DropdownMenu.CheckboxItem>
            ))}
        </>
    );
};

const SelectComponent = ({
    className,
    disabled = false,
    isMultiselect,
    label,
    labelClassNames,
    labelTooltip,
    labelTooltipBody,
    message,
    name,
    variant,
    type,
    required = false,
    onChange,
    options,
    placeholder,
    size = FieldSize.Small,
    value,
    onOpenChange,
    maxContentWidth,
    readOnly,
    id,
    allowEmptyValue = false,
}: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const MainComponent = isMultiselect ? DropdownMenu : Select;

    const handleOnOpenChange = (isOpen: boolean) => {
        setIsOpen(isOpen);

        if (onOpenChange) {
            onOpenChange(isOpen);
        }
    };

    const rootProps = {
        open: isOpen,
        onOpenChange: handleOnOpenChange,
        ...(!isMultiselect && {
            value,
            onValueChange: onChange,
            disabled: disabled,
        }),
    };

    const endIcon = (
        <ChevronDownIcon width={22} height={22} aria-hidden="true" />
    );

    const contentClasses =
        'hide-scrollbar overflow-y-scroll rounded-lg bg-white shadow-elevation-light-16 mt-2';

    const baseDefaultVariantClass = 'text-gray-900 ';
    const baseInactiveVariantClass =
        'text-gray-300 border-0 pointer-events-none';
    const baseSuccessVariantClass =
        'text-gray-900 border-0 relative after:absolute after:content-[" "] after:h-[2px] after:w-full after:-bottom-[2px] after:bg-semantic-success !ring-0';
    const baseErrorVariantClass =
        'text-semantic-error border-0 relative after:absolute after:content-[" "] after:h-[2px] after:w-full after:-bottom-[2px] after:bg-semantic-error !ring-0';
    const defaultVariantClasses =
        'bg-white border-2 border-gray-200 text-gray-900';
    const inactiveVariantClasses =
        'bg-gray-100 border-2 border-gray-300 pointer-events-none text-gray-300';
    const successVariantClasses =
        'bg-white border-2 border-semantic-success text-gray-900';
    const errorVariantClasses =
        'bg-white border-2 border-semantic-error text-semantic-error';

    let variantClass;
    switch (variant) {
        case FieldVariant.Inactive:
            variantClass =
                type === FieldType.Base
                    ? baseInactiveVariantClass
                    : inactiveVariantClasses;
            break;
        case FieldVariant.Success:
            variantClass =
                type === FieldType.Base
                    ? baseSuccessVariantClass
                    : successVariantClasses;
            break;
        case FieldVariant.Error:
            variantClass =
                type === FieldType.Base
                    ? baseErrorVariantClass
                    : errorVariantClasses;
            break;
        case FieldVariant.Default:
        default:
            variantClass =
                type === FieldType.Base
                    ? baseDefaultVariantClass
                    : defaultVariantClasses;
            break;
    }

    const selectedOption =
        options?.length &&
        (options as SimpleOption[]).find((option) => option.value === value);
    let selectedLabel = placeholder;

    if (!!isMultiselect && Object.values(value).length)
        selectedLabel = Object.values(value).join(', ');
    else if (!isMultiselect && selectedOption)
        selectedLabel = selectedOption.label as string;

    return (
        <div className={clsx(className, 'flex w-full flex-col')} id={id}>
            <FieldLabel
                required={required}
                labelClassNames={labelClassNames}
                label={label}
                labelTooltipBody={labelTooltipBody}
                labelTooltip={labelTooltip}
                variant={
                    readOnly
                        ? FieldVariant.Inactive
                        : disabled
                        ? FieldVariant.Inactive
                        : FieldVariant.Default
                }
            />
            <MainComponent.Root {...rootProps}>
                <MainComponent.Trigger
                    aria-label={label ?? placeholder}
                    className={`${variantClass} ${getTriggerClasses(isOpen)}`}
                    data-testid={name}
                    disabled={disabled}
                    aria-haspopup="listbox"
                >
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={getSelectedValueClasses(
                            readOnly || disabled,
                            size
                        )}
                    >
                        {selectedLabel}
                    </Typography>
                    <div aria-hidden="true">
                        <FieldIcon
                            icon={endIcon}
                            variant={
                                readOnly || disabled
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                            className={clsx('simple-transition', {
                                flip180: isOpen,
                                'text-link': readOnly || disabled,
                                'mr-4': size !== FieldSize.XS,
                                'mr-2': size === FieldSize.XS,
                            })}
                        />
                    </div>
                </MainComponent.Trigger>
                <MainComponent.Portal>
                    <MainComponent.Content
                        position="popper"
                        align={maxContentWidth ? 'start' : undefined}
                        className={clsx(
                            `${contentClasses} max-h-[266px]`,
                            {
                                'w-[var(--radix-popper-anchor-width)]':
                                    !maxContentWidth,
                            },
                            style.content
                        )}
                        onEscapeKeyDown={(e) => e.stopPropagation()} // Prevents closure of the side sheet or any parent element
                    >
                        {isMultiselect ? (
                            <MultiselectOptionItem
                                options={options}
                                value={value as { [key: string]: string }}
                                onChange={onChange}
                                isMultiselect
                            />
                        ) : (
                            <>
                                {allowEmptyValue ? (
                                    <SingleSelectOptionsWithEmptyValue
                                        options={options}
                                        value={value}
                                    />
                                ) : (
                                    <SingleSelectOptions
                                        options={options}
                                        value={value}
                                    />
                                )}
                            </>
                        )}
                    </MainComponent.Content>
                </MainComponent.Portal>
            </MainComponent.Root>
            {message && (
                <AssistiveText
                    text={message}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2"
                />
            )}
        </div>
    );
};

export default SelectComponent;
