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
import {
    RIDERS_WITH_FACE_AMOUNT,
    QuickQuoteFormState,
} from '@deps/types/quickQuote';
import { narrowIncludes } from '@deps/utils/array';

import { useQuickQuoteResultsForm } from '../../use-results-form-context';
import styles from '../content.module.css';

export type QuickQuoteRiderRowHeaderProps = {
    riderName: keyof QuickQuoteFormState['riders'];
};

export const QuickQuoteRiderRowHeader = ({
    riderName,
}: QuickQuoteRiderRowHeaderProps) => {
    const label = useRidersLabelMap()[riderName];
    const { control } = useQuickQuoteResultsForm();
    const isChecked = useWatch({
        control,
        name: `riders.${riderName}.enabled`,
    });
    const checkboxId = useId();
    const faceAmountId = useId();

    return (
        <div className={styles.riderRowHeader}>
            <Controller
                control={control}
                name={`riders.${riderName}.enabled`}
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
            {narrowIncludes(RIDERS_WITH_FACE_AMOUNT, riderName) && (
                <Controller
                    control={control}
                    name={`riders.${riderName}.faceAmount`}
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
