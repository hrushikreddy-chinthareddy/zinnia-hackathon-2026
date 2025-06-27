import clsx from 'clsx';

export type InputCheckboxProps = {
    checked: boolean;
    className?: string;
    isDisabled?: boolean;
    onChange: (checked: boolean) => void;
    required?: boolean;
};

const InputCheckBox = ({
    checked,
    className,
    isDisabled,
    onChange,
    required,
}: InputCheckboxProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isDisabled) {
            onChange(event.target.checked);
        }
    };

    const focusCheckboxClasses =
        'focus:ring-2 focus:ring-offset-2 focus:ring-semantic-focus';

    const checkboxClasses = clsx(
        'h-6 w-6 rounded border-2 text-white',
        {
            '!border-gray-200 !bg-white': !isDisabled,
            '!border-primary': checked && !isDisabled,
            '!border-primary-lightest': checked && isDisabled,
            '!border-gray-300 !bg-gray-100': !checked && isDisabled,
            'hover:!border-yellow-400 active:!border-yellow-400': !isDisabled,
        },
        focusCheckboxClasses
    );

    const fillClasses = clsx('center absolute w-3.5 rounded-sm', {
        'bg-primary': checked && !isDisabled,
        'bg-primary-lightest': checked && isDisabled,
        block: checked,
        hidden: !checked,
        'h-3.5': checked,
    });

    return (
        <label className="flex cursor-pointer items-center space-x-2">
            <div className={`relative ${className}`}>
                <input
                    className={checkboxClasses}
                    name="input-checkbox"
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    disabled={isDisabled}
                    required={required}
                />
                <div className={fillClasses} />
            </div>
        </label>
    );
};

export default InputCheckBox;
