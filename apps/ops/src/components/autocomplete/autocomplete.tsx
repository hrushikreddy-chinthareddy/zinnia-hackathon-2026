import {
    Combobox,
    ComboboxItem,
    ComboboxList,
    ComboboxProvider,
} from '@ariakit/react';
import * as RadixSelect from '@radix-ui/react-select';
import clsx from 'clsx';
import { matchSorter } from 'match-sorter';
import { useMemo, useState } from 'react';

import { ReactComponent as SearchIcon } from '@deps/styles/elements/icons/actions/search.svg';
import { ReactComponent as ChevronDownIcon } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as CheckIcon } from '@deps/styles/elements/icons/icons_outlined/checkmark.svg';

import {
    getItemClasses,
    getSelectedValueClasses,
    getTriggerClasses,
} from './autocomplete.helpers';
import {
    AutocompleteOptionsProps,
    SelectProps,
    SimpleOption,
} from './autocomplete.types';
import AssistiveText, {
    AssistiveTextVariant,
} from '../assistive-text/assistive-text';
import { FieldSize, FieldType, FieldVariant } from '../fields/field';
import FieldIcon from '../fields/field-icon';
import FieldLabel from '../fields/field-label';
import Typography, { TypographyVariant } from '../typography/typography';

const AutocompleteOptions = ({
    options,
    value,
    matches,
    contentClasses,
}: AutocompleteOptionsProps) => {
    return (
        <RadixSelect.Content
            role="dialog"
            aria-label="options"
            position="popper"
            className={`${contentClasses} z-20 max-h-[266px] w-[var(--radix-popper-anchor-width)]`}
            id="autocomplete-select"
        >
            <div className="relative flex items-center p-1 pb-0">
                <div className="pointer-events-none absolute left-2.5 text-[hsl(204_4%_0%_/_0.6)]">
                    <SearchIcon />
                </div>
                <Combobox
                    autoSelect
                    placeholder="Search options"
                    className="h-10 w-full appearance-none rounded bg-[hsl(204_4%_0%_/_0.05)] pl-7  text-black outline-none  sm:h-9 sm:text-[15px]"
                    onBlurCapture={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                />
            </div>
            <ComboboxList className="overflow-y-auto p-1">
                {matches.map((option: SimpleOption, index) => (
                    <RadixSelect.Item
                        key={`option-${option.value}`}
                        value={option.value}
                        asChild
                        className={getItemClasses(
                            option,
                            index,
                            options.length,
                            option.value === value
                        )}
                    >
                        <ComboboxItem>
                            <RadixSelect.ItemText>
                                {option.label}
                            </RadixSelect.ItemText>
                            <RadixSelect.ItemIndicator className="absolute left-1.5">
                                <CheckIcon />
                            </RadixSelect.ItemIndicator>
                        </ComboboxItem>
                    </RadixSelect.Item>
                ))}
            </ComboboxList>
        </RadixSelect.Content>
    );
};

const Autocomplete = ({
    options,
    value,
    placeholder,
    size = FieldSize.Small,
    label,
    type,
    variant,
    className,
    labelTooltip,
    labelTooltipBody,
    message,
    required,
    disabled = false,
    onChange,
}: SelectProps) => {
    const [searchValue, setSearchValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const rootProps = {
        open: isOpen,
        onOpenChange: setIsOpen,
        value,
        onValueChange: onChange,
        disabled: disabled,
    };

    const matches = useMemo(() => {
        if (!searchValue) return options;
        const keys = ['label', 'value'];
        const matches = matchSorter(options, searchValue, { keys });

        const selectedOption = options.find((lang) => lang.value === value);
        if (selectedOption && !matches.includes(selectedOption)) {
            matches.push(selectedOption);
        }
        return matches;
    }, [searchValue, options, value]);

    const endIcon = (
        <ChevronDownIcon width={22} height={22} aria-hidden="true" />
    );
    const contentClasses =
        'hide-scrollbar overflow-y-scroll rounded-lg bg-white shadow-elevation-light-16 mt-2';
    const selectedLabel =
        options?.length &&
        (options as SimpleOption[]).find((option) => option.value === value)
            ?.label;

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

    return (
        <div className={clsx('flex w-full flex-col', className)}>
            <FieldLabel
                required={required}
                label={label}
                variant={FieldVariant.Default}
                labelTooltipBody={labelTooltipBody}
                labelTooltip={labelTooltip}
            />
            <RadixSelect.Root {...rootProps}>
                <ComboboxProvider
                    open={isOpen}
                    setOpen={setIsOpen}
                    resetValueOnHide
                    includesBaseElement={false}
                    setValue={setSearchValue}
                >
                    <RadixSelect.Trigger
                        aria-label="options"
                        className={`${variantClass} ${getTriggerClasses(
                            isOpen
                        )}`}
                    >
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={getSelectedValueClasses(disabled, size)}
                        >
                            {selectedLabel || placeholder}
                        </Typography>
                        <div aria-hidden="true">
                            <FieldIcon
                                icon={endIcon}
                                variant={
                                    disabled
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                                className={clsx('simple-transition', 'mr-4', {
                                    flip180: isOpen,
                                })}
                            />
                        </div>
                    </RadixSelect.Trigger>
                    <AutocompleteOptions
                        options={options}
                        value={value || ''}
                        matches={matches}
                        contentClasses={contentClasses}
                    />
                </ComboboxProvider>
            </RadixSelect.Root>
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

export default Autocomplete;
