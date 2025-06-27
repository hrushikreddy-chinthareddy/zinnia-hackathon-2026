'use client';

import {
    Label,
    AssistiveText,
    AssistiveTextVariant,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { cloneElement, forwardRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import fieldStyles from '../Field.module.css';
import {
    FieldDataActiveProps,
    FieldDataActiveTestIds,
    FieldStatus,
} from '../types';

export const FieldDataActive = forwardRef<
    HTMLInputElement,
    FieldDataActiveProps
>(
    (
        {
            errorMessage = '',
            label,
            fieldStatus = FieldStatus.DEFAULT,
            fieldSize,
            icon,
            ...props
        },
        ref
    ) => {
        if (
            !!label &&
            (label.type as React.JSXElementConstructor<any>)?.name !==
                Label.name
        ) {
            throw new Error('Required field: label is not of type Label');
        }
        const inputId = uuidv4();
        const status = props.disabled ? FieldStatus.INACTIVE : fieldStatus;
        const clonedLabel =
            label &&
            cloneElement(label, {
                labelFor: inputId,
                status,
            });

        return (
            <>
                <div data-testid={FieldDataActiveTestIds.LABEL}>
                    {clonedLabel}
                </div>
                <div
                    className={clsx(
                        fieldStyles.inputContainer,
                        fieldStyles[status],
                        'typography-content-body-sm'
                    )}
                >
                    <input
                        id={inputId}
                        ref={ref}
                        data-testid={FieldDataActiveTestIds.INPUT}
                        type="text"
                        className={clsx(
                            fieldStyles.input,
                            fieldSize && fieldStyles[fieldSize],
                            fieldStyles[status]
                        )}
                        {...props}
                    />
                    {icon && (
                        <div
                            data-testid={FieldDataActiveTestIds.ICON}
                            className={fieldStyles.rightIconContainer}
                        >
                            {icon}
                        </div>
                    )}
                </div>
                {fieldStatus === FieldStatus.ERROR && errorMessage && (
                    <div data-testid={FieldDataActiveTestIds.ERROR_MESSAGE}>
                        <AssistiveText
                            className={fieldStyles.assistiveMessage}
                            text={errorMessage}
                            variant={AssistiveTextVariant.Error}
                        />
                    </div>
                )}
            </>
        );
    }
);

FieldDataActive.displayName = 'FieldDataActive';
