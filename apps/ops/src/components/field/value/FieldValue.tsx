import { AssistiveText, AssistiveTextVariant, Label } from '@zinnia/bloom/components';
import clsx from 'clsx';
import React, { ChangeEvent, cloneElement } from 'react';
import { v4 as uuidv4 } from 'uuid';

import fieldStyles from '../Field.module.css';
import { FieldValueProps, FieldStatus, FieldDataActiveTestIds } from '../types';

// TODO: might have to include "," and change this to validate against a currency
const decimalRegex = /^-?\d*(\.\d*)?$/;

export const FieldValue = React.forwardRef<HTMLInputElement, FieldValueProps>(
    (
        {
            label,
            fieldStatus = FieldStatus.DEFAULT,
            errorMessage,
            fieldSize,
            currencySymbol,
            onChange,
            type,
            value,
            placeholder = 'Replace this text',
            ...props
        },
        forwardRef
    ) => {
        if (!!label && (label.type as React.JSXElementConstructor<any>).name !== Label.name) {
            throw new Error('Required field: label is not of type Label');
        }

        if (props.disabled) {
            fieldStatus = FieldStatus.INACTIVE;
        }

        const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;

            if (decimalRegex.test(value)) {
                if (onChange) {
                    onChange(event);
                }
            }
        };

        const inputId = uuidv4();

        const clonedLabel =
            label &&
            cloneElement(label, {
                labelFor: inputId,
                status: fieldStatus,
            });

        return (
            <div>
                <div data-testid={FieldDataActiveTestIds.LABEL}>{clonedLabel}</div>
                <div className={clsx(fieldStyles.inputContainer, fieldStyles[fieldStatus])}>
                    <div className={clsx(fieldStyles.symbolBox, fieldStyles[fieldStatus], 'typography-content-body-sm-bold')}>
                        <span className={clsx(fieldStyles[fieldStatus])}>{currencySymbol || '$'}</span>
                    </div>
                    <input
                        type={type || 'text'}
                        className={clsx(
                            fieldStyles.input,
                            fieldSize && fieldStyles[fieldSize],
                            fieldStyles[fieldStatus],
                            'typography-content-body'
                        )}
                        id={inputId}
                        value={value ?? ''}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        ref={forwardRef}
                        {...props}
                    />
                </div>
                {fieldStatus === FieldStatus.ERROR && errorMessage && (
                    <AssistiveText className={fieldStyles.assistiveMessage} text={errorMessage} variant={AssistiveTextVariant.Error} />
                )}
            </div>
        );
    }
);

FieldValue.displayName = 'FieldValue';
