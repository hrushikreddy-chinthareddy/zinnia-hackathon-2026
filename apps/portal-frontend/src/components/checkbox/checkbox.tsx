import clsx from 'clsx';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CheckboxTextProps } from './checkbox-text/checkbox-text';

const Checkbox = ({ onChange, isDisabled, isIndeterminate = false, checked = false, ...rest }: Omit<CheckboxTextProps, 'label'>) => {
    const [isChecked, setIsChecked] = useState<boolean>(checked);
    const [indeterminate, setIndeterminate] = useState(isIndeterminate);

    const checkboxRef = useRef<HTMLInputElement>(null);

    const handleCheck = useCallback(
        (isChecked: boolean) => {
            if (isIndeterminate) {
                setIndeterminate(false);
            }
            setIsChecked(isChecked);
            onChange && onChange(isChecked);
        },
        [isChecked]
    );

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!isDisabled) {
            handleCheck(e.target.checked);
        }
    };

    useEffect(() => {
        if (checkboxRef && checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [checkboxRef, indeterminate]);

    const isSelectedState = useMemo(() => isChecked === true || indeterminate, [isChecked]);

    const focusCheckboxClasses = 'focus:ring-2 focus:ring-offset-2 focus:ring-semantic-focus';

    const checkboxClasses = clsx(
        'h-6 w-6 rounded border-2 text-white',
        {
            '!border-gray-200 !bg-white': !isDisabled,
            '!border-primary': isSelectedState && !isDisabled,
            '!border-primary-lightest': isSelectedState && isDisabled,
            '!border-gray-300 !bg-gray-100': !isSelectedState && isDisabled,
            'hover:!border-yellow-400 active:!border-yellow-400': !isDisabled,
        },
        focusCheckboxClasses
    );

    const fillClasses = clsx('center absolute w-3.5 rounded-sm', {
        'bg-primary': isSelectedState && !isDisabled,
        'bg-primary-lightest': isSelectedState && isDisabled,
        block: isSelectedState,
        hidden: !isSelectedState,
        'h-0.5': indeterminate,
        'h-3.5': !indeterminate || isChecked,
    });

    return (
        <>
            <div className="relative flex">
                <input
                    type="checkbox"
                    className={checkboxClasses}
                    onChange={handleCheckboxChange}
                    checked={isChecked === true}
                    disabled={isDisabled}
                    ref={checkboxRef}
                    data-testid="checkbox"
                    {...rest}
                />

                {/* Pseudo-element for the square fill */}
                <div className={fillClasses} />
            </div>
        </>
    );
};

export default Checkbox;
