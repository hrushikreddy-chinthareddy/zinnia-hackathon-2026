import {
    Checkbox,
    FieldData,
    FieldSize,
    FieldTypes,
} from '@zinnia/bloom/components';
import { useId } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { useRidersLabelMap } from '@deps/components/illustrations/components/details/content/use-riders-label-map';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

import { QuickQuoteFormState } from '../../../types';
import { useQuickQuoteResultsForm } from '../../use-results-form-context';
import styles from '../content.module.css';

export type QuickQuoteRiderRowHeaderProps = {
    riderName: keyof QuickQuoteFormState['riders'];
    hasFaceValue?: boolean;
};

export const QuickQuoteRiderRowHeader = (
    props: QuickQuoteRiderRowHeaderProps
) => {
    const label = useRidersLabelMap()[props.riderName];
    const { control } = useQuickQuoteResultsForm();
    const isChecked = useWatch({
        control,
        name: `riders.${props.riderName}.enabled`,
    });
    const checkboxId = useId();
    const faceAmountId = useId();

    return (
        <div className={styles.riderRowHeader}>
            <Controller
                control={control}
                name={`riders.${props.riderName}.enabled`}
                render={({ field }) => (
                    <div className={styles.riderRowHeaderCheckbox}>
                        <Checkbox
                            id={checkboxId}
                            name={field.name}
                            isCheckedByDefault={!!field.value}
                            onClick={(value?: boolean) =>
                                field.onChange(!!value)
                            }
                        />
                    </div>
                )}
            />
            <Typography variant={TypographyVariant.BodySm} htmlFor={checkboxId}>
                {label}
            </Typography>
            {props.hasFaceValue && (
                <Controller
                    control={control}
                    name={`riders.${props.riderName}.faceAmount`}
                    render={({ field }) => (
                        <FieldData
                            className={styles.riderRowHeaderInput}
                            disabled={!isChecked}
                            fieldSize={FieldSize.Small}
                            fieldType={FieldTypes.Value}
                            id={faceAmountId}
                            value={field.value}
                            onChange={(e) => {
                                const { value } = e.target;

                                field.onChange(parseFloat(value));
                            }}
                            name={field.name}
                        />
                    )}
                />
            )}
        </div>
    );
};
