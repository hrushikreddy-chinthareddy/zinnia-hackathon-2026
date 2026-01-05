import { Transition } from '@headlessui/react';
import clsx from 'clsx';
import { Fragment, KeyboardEvent, ReactNode, useRef, useState } from 'react';

import Field, { FieldProps, FieldSize } from '@deps/components/fields/field';
import { useOutsideClick } from '@deps/hooks/useOutsideClick';
import { ReactComponent as ChevronDownIcon } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

import FieldSelectItem from './field-select-item';

export type FieldSelectOptions = {
    value: string;
    label: string | ReactNode;
};

export type FieldSelectProps = {
    options: FieldSelectOptions[];
    frequentOptions?: FieldSelectOptions[];
    dropdownValue?: string;
    onDropdownChange: (value: string) => void;
    dropdownAriaLabel?: string;
} & FieldProps;

export default function FieldSelect({
    options,
    frequentOptions,
    dropdownValue,
    onDropdownChange,
    dropdownAriaLabel,
    leading,
    trailing,
    ...rest
}: FieldSelectProps) {
    const [open, setOpen] = useState(false);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
        }
        if (e.key === 'Escape' && open) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
        }
    };

    function getFrequentClasses(index: number) {
        if (!frequentOptions) return '';

        if (index === 0) return 'rounded-t-lg';
        if (index === frequentOptions.length - 1 && options.length > 0)
            return 'border-b-gray-100';
        if (index === frequentOptions.length - 1 && options.length === 0)
            return 'rounded-b-lg';

        return '';
    }

    function getOptionsClasses(index: number) {
        if (index === 0 && frequentOptions && frequentOptions.length > 0)
            return 'border-t-gray-100';
        if (
            (index === 0 && !frequentOptions) ||
            (index === 0 && frequentOptions && frequentOptions.length === 0)
        )
            return 'rounded-t-lg';
        if (index === options.length - 1) return 'rounded-b-lg';

        return '';
    }

    const classes = clsx(
        'hide-scrollbar absolute z-10 w-full overflow-y-scroll rounded-lg bg-white shadow-elevation-light-16',
        {
            'top-[50px]': rest.size === FieldSize.Small && !rest.label,
            'top-[72px]': rest.size === FieldSize.Small && rest.label,
            'top-[66px]': rest.size === FieldSize.Default && !rest.label,
            'top-[88px]': rest.size === FieldSize.Default && rest.label,
        }
    );

    const handleClose = () => setOpen(false);
    const handleClick = () =>
        outsideClick ? setOutsideClick(false) : setOpen(!open);
    const handleClickOutside = () => setOutsideClick(true);

    const [outsideClick, setOutsideClick] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    useOutsideClick(containerRef, open, handleClose, handleClickOutside);

    return (
        <div className="relative w-full">
            <Field
                leading={
                    leading ? (
                        <div
                            className="default-focus flex h-full flex-row items-center gap-1 rounded"
                            onClick={handleClick}
                            onKeyDown={(e) => handleKeyDown(e)}
                            tabIndex={0}
                            role="button"
                            aria-haspopup="listbox"
                            aria-expanded={open}
                            aria-label={dropdownAriaLabel}
                        >
                            {leading}
                            <ChevronDownIcon
                                width={8}
                                height={8}
                                className={`simple-transition text-secondary ${
                                    open ? 'flip180' : ''
                                }`}
                            />
                        </div>
                    ) : undefined
                }
                trailing={
                    trailing ? (
                        <div
                            onClick={handleClick}
                            onKeyDown={(e) => handleKeyDown(e)}
                            className="default-focus h-full rounded"
                            tabIndex={0}
                            role="button"
                            aria-haspopup="listbox"
                            aria-expanded={open}
                            aria-label={dropdownAriaLabel}
                        >
                            {trailing}
                        </div>
                    ) : undefined
                }
                {...rest}
            />
            <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div
                    className={classes}
                    ref={containerRef}
                    role="listbox"
                    aria-label={dropdownAriaLabel}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpen(false);
                        }
                    }}
                >
                    <div className="max-h-[266px]">
                        {frequentOptions &&
                            frequentOptions.map((option, index) => (
                                <FieldSelectItem
                                    key={index}
                                    labelElement={option.label}
                                    className={getFrequentClasses(index)}
                                    selected={option.value === dropdownValue}
                                    onClick={() => {
                                        onDropdownChange(option.value);
                                        setOpen(false);
                                    }}
                                />
                            ))}
                        {options.map((option, index) => (
                            <FieldSelectItem
                                key={index}
                                labelElement={option.label}
                                className={getOptionsClasses(index)}
                                selected={option.value === dropdownValue}
                                onClick={() => {
                                    onDropdownChange(option.value);
                                    setOpen(false);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </Transition>
        </div>
    );
}
