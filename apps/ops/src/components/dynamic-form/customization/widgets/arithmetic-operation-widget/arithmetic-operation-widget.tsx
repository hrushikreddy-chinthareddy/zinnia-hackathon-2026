import { getUiOptions, WidgetProps } from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';
import React, { useEffect } from 'react';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';



const enum ArithmeticOperation {
  Addition = 'addition',
  Subtraction='subtraction',
  Multiplication = 'multiplication'
};
type FormContextOptions = {
  keyName: string;
  details: string;
  mainObject: string;
  field1: string;
  field2: string;
  operation: ArithmeticOperation;
};

const ArithmeticOperationWidget = function (props: WidgetProps) {
  const { id, required, disabled, rawErrors, description, errors, readonly, uiSchema, hideError = false, onChange, title, formContext, name, placeholder } = props;

  const formContextOptions: FormContextOptions = getUiOptions(uiSchema)?.formContext as FormContextOptions;

  const applyArithmeticOperations = (formContextOptions: FormContextOptions) => {
    const data = formContext?.[formContextOptions.keyName]?.[formContextOptions.details]?.[formContextOptions.mainObject];

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
    }
    else
      return null
  };

  const value = applyArithmeticOperations(formContextOptions);

  useEffect(() => {
    if (value !== null || value !== undefined) {
      onChange(value?.toString());
    }
  }, [value]);


  if (typeof value === 'number') {
    return (disabled as boolean) ? (
      <div>{value}</div>
    ) : (
      readonly ? <>{value}</> :
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
            <TextField
              placeholder={placeholder}
              id={id}
              className={"text-right"}
              value={value || ''}
              required={required}
              disabled={true}
              onChange={() => onChange(value.toString())}
              hideError={hideError}
              status={rawErrors && rawErrors?.length > 0 ? 'error' : undefined}
            />
          </div>
          {!hideError && errors}
        </div>
    );
  } else {
    return <></>;
  }
};
export default ArithmeticOperationWidget
