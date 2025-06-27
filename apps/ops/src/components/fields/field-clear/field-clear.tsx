import { useTranslation } from 'next-i18next';
import React, { ChangeEvent, RefObject } from 'react';

import { FieldTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';

interface FieldClearProps {
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClear?: (ref: RefObject<HTMLInputElement>) => void;
    value?: string;
    label?: string;
    inputRef: RefObject<HTMLInputElement>;
}

export default function FieldClear({
    onChange,
    onClear,
    label,
    value,
    inputRef,
}: FieldClearProps) {
    const { t } = useTranslation();

    if (!value) return null;

    /* Faking an event with an empty value to clear the input */
    const clearFakeEvent = {
        target: inputRef.current,
    } as any as ChangeEvent<HTMLInputElement>;

    return (
        <button
            aria-label={t('ariaLabel.clearInput', { label }) as string}
            className="default-focus-icons my-auto mr-1 h-fit rounded-xl text-secondary hover:text-secondary-dark"
            onClick={() => {
                // clear the input's value and pass the ref to the onChange callback
                if (inputRef.current) {
                    inputRef.current.value = '';
                    onChange(clearFakeEvent);
                }

                inputRef.current?.focus();

                if (onClear) {
                    onClear(inputRef);
                }
            }}
        >
            <CancelIcon width={24} height={24} data-testid={FieldTest.Cancel} />
        </button>
    );
}
