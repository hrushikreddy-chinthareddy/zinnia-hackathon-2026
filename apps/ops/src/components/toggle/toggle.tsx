import clsx from 'clsx';

import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';
import { ReactComponent as CheckmarkIcon } from '@deps/styles/elements/icons/icons_outlined/checkmark.svg';

export enum ToggleSize {
    Default = 'default',
    Large = 'large',
}

export enum ToggleVariant {
    Default = 'default',
    Inactive = 'inactive',
}

export interface ToggleProps {
    classes?: string;
    size?: ToggleSize;
    variant?: ToggleVariant;
    label?: string;
    ariaLabel?: string;
    text?: string;
    value: boolean;
    handleToggle: (value: boolean) => void;
}

const ToggleLabel = ({ label }: Pick<ToggleProps, 'label'>) => {
    if (!label) return null;
    return (
        <p className="font-primary text-sm font-bold leading-4.5 text-gray-900">
            {label}
        </p>
    );
};

const ToggleText = ({ text }: Pick<ToggleProps, 'text'>) => {
    if (!text) return null;
    return (
        <p className="font-secondary text-md font-normal leading-5.5 text-gray-900">
            {text}
        </p>
    );
};

const ToggleInterior = ({
    size,
    variant,
    value,
}: Pick<ToggleProps, 'size' | 'variant' | 'value'>) => {
    const baseClasses = `${
        variant === ToggleVariant.Inactive && !value
            ? 'bg-gray-100'
            : 'bg-white'
    } pointer-events-none inline-block transform rounded-full shadow ring-0`;
    if (size !== ToggleSize.Large)
        return <span className={`${baseClasses} h-4 w-4`} />;

    const iconClasses = 'text-white';
    if (value)
        return (
            <>
                <CheckmarkIcon
                    width={20}
                    height={20}
                    className={`${iconClasses} mr-4`}
                />
                <span className={`${baseClasses} h-6 w-6`} />
            </>
        );

    return (
        <>
            <span className={`${baseClasses} h-6 w-6`} />
            <CancelIcon
                width={20}
                height={20}
                className={`${iconClasses} ml-4`}
            />
        </>
    );
};

export default function Toggle({
    classes,
    size = ToggleSize.Default,
    variant = ToggleVariant.Default,
    ariaLabel,
    label,
    text,
    value,
    handleToggle,
}: ToggleProps) {
    const focusClasses = 'default-focus';
    const baseClasses = `${focusClasses} ${
        variant === ToggleVariant.Inactive
            ? 'pointer-events-none'
            : 'pointer-events-auto'
    } py-1 relative inline-flex items-center flex-shrink-0 cursor-pointer rounded-full transition-padding duration-200 ease-in-out`;
    const selectedClasses = `${size === ToggleSize.Large ? 'pl-2.5' : 'pl-6'} ${
        variant === ToggleVariant.Inactive
            ? 'bg-primary-lightest'
            : 'bg-primary'
    } pr-1.5 `;
    const unselectedClasses = `${
        size === ToggleSize.Large ? 'pr-2.5' : 'pr-6'
    } ${
        variant === ToggleVariant.Inactive ? 'bg-gray-300' : 'bg-gray-600'
    } pl-1.5`;

    return (
        <div className={clsx('flex flex-col gap-4', classes)}>
            <ToggleLabel label={label} />
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className={`${baseClasses} ${
                        value ? selectedClasses : unselectedClasses
                    }`}
                    onClick={() => handleToggle(!value)}
                    aria-label={ariaLabel}
                    tabIndex={variant === ToggleVariant.Inactive ? -1 : 0}
                    aria-pressed={value}
                    role="button"
                >
                    <ToggleInterior
                        size={size}
                        variant={variant}
                        value={value}
                    />
                </button>
                <ToggleText text={text} />
            </div>
        </div>
    );
}
