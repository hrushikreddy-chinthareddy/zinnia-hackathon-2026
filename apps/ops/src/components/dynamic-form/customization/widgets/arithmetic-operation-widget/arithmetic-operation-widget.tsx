import { getUiOptions, WidgetProps } from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';
import { useEffect } from 'react';

import Field, {
    FieldFormat,
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';

const enum ArithmeticOperation {
    Addition = 'addition',
    Subtraction = 'subtraction',
    Multiplication = 'multiplication',
}
type FormContextOptions = {
    keyName: string;
    details: string;
    mainObject: string;
    field1: string;
    field2: string;
    operation: ArithmeticOperation;
};

const ArithmeticOperationWidget = function (props: WidgetProps) {
    const {
        id,
        required,
        disabled,
        description,
        errors,
        readonly,
        uiSchema,
        hideError = false,
        onChange,
        title,
        formContext,
        placeholder,
    } = props;

    const formContextOptions: FormContextOptions = getUiOptions(uiSchema)
        ?.formContext as FormContextOptions;

    const applyArithmeticOperations = (
        formContextOptions: FormContextOptions
    ) => {
        const data =
            formContext?.[formContextOptions.keyName]?.[
                formContextOptions.details
            ]?.[formContextOptions.mainObject];

        if (data) {
            const field1 = data[formContextOptions.field1];
            const field2 = data[formContextOptions.field2];

            switch (formContextOptions.operation) {
                case ArithmeticOperation.Addition:
                    return Number(field1) + Number(field2);

                case ArithmeticOperation.Subtraction:
                    return Number(field1) - Number(field2);

                case ArithmeticOperation.Multiplication:
                    return Number(field1) * Number(field2);
            }
        } else return null;
    };

    const value = applyArithmeticOperations(formContextOptions);
    const numberFormat = {
        type: 'number' as FieldFormat,
        decimalPlaces: 2,
        format: 'en-US',
    };
    const formatNumber = (num: any) => {
        return parseFloat(num).toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        });
    };

    useEffect(() => {
        if (value !== null || value !== undefined) {
            onChange(value?.toFixed(2));
        }
    }, [value]);

    if (typeof value === 'number') {
        return readonly ? (
            <>{formatNumber(value)}</>
        ) : (
            <div className="">
                {title && (
                    <div className="mb-2">
                        <Label labelFor={props.id}>
                            <span className="">{title}</span>
                        </Label>
                    </div>
                )}
                {description}
                <div className="max-w-sm flex w-full flex-col">
                    <Field
                        name={id}
                        value={value.toString()}
                        formatOptions={numberFormat}
                        id={id}
                        disabled={disabled}
                        required={required}
                        readOnly={readonly}
                        isReadOnly={disabled}
                        placeholder={placeholder}
                        onChange={(e) => onChange(e.target.value)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        variant={
                            disabled
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                    />
                </div>
                {!hideError && errors}
            </div>
        );
    } else {
        return <></>;
    }
};
export default ArithmeticOperationWidget;
