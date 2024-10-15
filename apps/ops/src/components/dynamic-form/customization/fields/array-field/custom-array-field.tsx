import { FieldProps } from '@rjsf/utils';
import { Checkbox } from '@zinnia/bloom/components';
import React from 'react';

import styles from './CustomArrayField.module.css';

// Custom Array Field that renders checkboxes if the array has an enum
// This replaces the default multi-select
const CustomArrayField = (props: FieldProps) => {
    const { schema, formData = [], onChange } = props;

    // Check if the array has an enum (multi-select case)
    if (schema.items && (schema.items as any).enum) {
        const options = (schema.items as any).enum;

        const handleCheckboxChange = (option: any) => {
            console.log('handleCheckboxChange', option);
            if (formData.includes(option)) {
                // If option is already selected, remove it
                onChange(formData.filter((item: any) => item !== option));
            } else {
                // If option is not selected, add it
                onChange([...formData, option]);
            }
        };

        return (
            <div className={styles.arrayField}>
                {options.map((option: any, index: number) => (
                    <Checkbox key={index} onClick={() => handleCheckboxChange(option)} id={`${props.idSchema.$id}_${index}`}>
                        <label htmlFor={`${props.idSchema.$id}_${index}`}>{option}</label>
                    </Checkbox>
                ))}
            </div>
        );
    }

    // Fallback to default array rendering if no enum is present
    return <div>{props.children}</div>;
};

export default CustomArrayField;
