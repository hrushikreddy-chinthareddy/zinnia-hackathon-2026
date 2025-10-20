import {
    AssistiveText,
    AssistiveTextVariant,
    Checkbox,
    FieldTypes as FieldDataTypes,
    FieldSize,
    FieldStatus,
    Radio,
    Select,
} from '@zinnia/bloom/components';
import {
    isRenderingPlaceholderField,
    OnAnswerChange,
    RenderingField,
    FieldTypes,
    FieldSizes,
    Language,
    isRenderingOptionField,
    RenderingOptionField,
    RenderingFieldOption,
} from '@zinnia/form-engine-sdk';
import clsx from 'clsx';
import { RenderingCustomField } from 'node_modules/@zinnia/form-engine-sdk/dist/esm/questionnaire-engine/renderingTransforms/RenderingQuestionnaire';
import { ReactElement, useCallback, useEffect, memo } from 'react';

import { FieldContainer, FieldContainerProps, FieldLabel } from './common';
import style from './field.module.css';
import { IllustrationScheduler } from './IllustrationScheduler';
import { StatefulFieldData } from './StatefulFieldData';
import { Tags } from './Tags';
import { CheckboxGroup } from '../../bloom-temp/checkbox-group';

export const DefaultFieldSizesMap: { [key in FieldTypes]?: number } = {
    [FieldTypes.agree]: FieldSizes.full,
    [FieldTypes.autocomplete]: FieldSizes.full,
    [FieldTypes.button]: FieldSizes.full,
    [FieldTypes.checkbox]: FieldSizes.full,
    [FieldTypes.checkboxGroup]: FieldSizes.full,
    [FieldTypes.currencyCard]: FieldSizes.full,
    [FieldTypes.date]: FieldSizes.half,
    [FieldTypes.yearMonth]: FieldSizes.half,
    [FieldTypes.dropdown]: FieldSizes.full,
    [FieldTypes.information]: FieldSizes.full,
    [FieldTypes.input]: FieldSizes.full,
    [FieldTypes.money]: FieldSizes.half,
    [FieldTypes.number]: FieldSizes.third,
    [FieldTypes.phone]: FieldSizes.twoThirds,
    [FieldTypes.radio]: FieldSizes.full,
    [FieldTypes.textarea]: FieldSizes.full,
};

export function getFieldSize(field: RenderingField): number {
    return (
        field.layout?.size ??
        DefaultFieldSizesMap?.[field.type] ??
        FieldSizes.full
    );
}

export function shouldForceNewLine(field: RenderingField): boolean {
    if (typeof field.layout?.forceNewLine !== 'undefined')
        return !!field.layout.forceNewLine;
    if (typeof field.layout?.size !== 'undefined') return false;

    const fieldSize = getFieldSize(field);
    return fieldSize !== FieldSizes.full;
}

export function getVisibleOptions(
    field: RenderingOptionField
): RenderingFieldOption[] {
    return field.options.filter(
        (option) =>
            option.visible &&
            (!field.displayOnlySelected || option.id === field.value)
    );
}

// const INFO_ICON_BUTTON_SIZE = 1;

type FieldProps = {
    field: RenderingField;
    onAnswerChange: OnAnswerChange;
    onAnswerComplete: (
        fieldId: string,
        answer: any,
        previousAnswer: any
    ) => void;
    locale?: Language;
    iconMap?: Record<string, string>;
    onInfoIconClick?: () => void;
    onError?: (fieldId: string, error?: string) => void;
    focusedIncompleteFieldId?: string;
    disabled?: boolean;
};
// const fieldProps = {
//   id: field.id,
//   name: field.id,
//   ['data-testid']: field.nodeId,
//   label: field.label || '',
//   onAnswerChange: onAnswerChangeForFieldProps,
//   // TODO refactor `onAnswerComplete` to abstract the usage of `field.id`, similar to `onAnswerChange`
//   onAnswerComplete,
//   disabled,
//   value: field.value,
//   validationError: field.validationError,
//   title: field.title || '',
//   subtitle: field.text,
//   required: !field.optional,
//   locale,
//   optionalText: translate('validation.optional', { locale }),
// };

// TODO: use i18n or whatever library we use for this
// function translate(key: string, options?: { locale?: Language }): string {
//   return `TODO-${options?.locale}-${key}`;
// }

export const Field = memo(InnerField);

export function InnerField(props: FieldProps): ReactElement | null {
    const {
        field,
        onAnswerChange,
        // onAnswerComplete: onAnswerCompleteCallback,
        onError,
        iconMap,
        onInfoIconClick,
        focusedIncompleteFieldId,
    } = props;

    // const onAnswerComplete = useCallback(
    //   (fieldId: string, answer: any, previousAnswer: any) => {
    //     onAnswerCompleteCallback(fieldId, answer, previousAnswer);
    //   },
    //   [onAnswerCompleteCallback]
    // );

    const onAnswerChangeForFieldProps = useCallback(
        (answer: any, triggerStepNavigation = field.triggerStepNavigation) => {
            // DOUBLE EQUALITY IS DESIRED HERE. THE INPUT SHOULD IDEAL GIVE NUMBERS WHEN THEY ARE MONEY FIELD BUT THEY ARE SENDING STRING WHICH ARE LATER CONVERTED BY THE ENGINE.
            if (field.value != answer) {
                // Only call the onChange if the value is different from what we have already.
                onAnswerChange([
                    {
                        tag: 'blueprintId',
                        blueprintId: field.blueprintId,
                        nodeId: field.nodeId,
                        value: answer,
                        effects: field.effects,
                        blueprintIdScope:
                            field.scope.repeatedInstanceIdentifierContext
                                .byBlueprintId,
                        nodeIdScope:
                            field.scope.repeatedInstanceIdentifierContext
                                .byNodeId,
                        triggerStepNavigation: triggerStepNavigation,
                    },
                ]);
            }
        },
        [
            field.triggerStepNavigation,
            field.value,
            field.blueprintId,
            field.nodeId,
            field.effects,
            field.scope.repeatedInstanceIdentifierContext.byBlueprintId,
            field.scope.repeatedInstanceIdentifierContext.byNodeId,
            onAnswerChange,
        ]
    );

    useEffect(() => {
        // Ignore the validity of hidden fields
        if (!field.visible) return;

        if (!field.valid) {
            onError?.(field.id, field.validationError?.message);
        }
    }, [
        field.id,
        field.valid,
        field.validationError?.message,
        field.visible,
        onError,
    ]);

    if (!field.visible) return null;

    const forceNewLine = shouldForceNewLine(field);
    const options = isRenderingOptionField(field)
        ? getVisibleOptions(field)
        : [];

    const placeholder = getPlaceholderForField(field);
    const disabled = field.readOnly || field.disabled;

    const fieldSize = getFieldSize(field);
    // const isFullSize = fieldSize === FieldSizes.full;
    const imageSrc = field.info?.image && iconMap?.[field.info.image.name];
    const infoSupplementImage = imageSrc
        ? {
              src: imageSrc,
              alt: field.info?.image?.alt,
          }
        : undefined;

    const defaultContainerProps: FieldContainerProps = {
        forceNewLine,
        fieldSize,
        field,
        infoSupplementImage,
        onInfoIconClick,
        focusedIncompleteFieldId,
    };

    switch (field.type) {
        case FieldTypes.custom: {
            const customField: RenderingCustomField = field;
            switch (customField.customName) {
                case 'Information': {
                    // adding this so that information fields can be rendered conditionally
                    return (
                        <FieldContainer {...defaultContainerProps}>
                            <FieldLabel field={field} />
                        </FieldContainer>
                    );
                }
                case 'IllustrationScheduler': {
                    return <IllustrationScheduler field={customField} />;
                }
                case 'Tags': {
                    return <Tags field={customField} />;
                }
                default: {
                    return (
                        <div>
                            Blueprint is referencing a custom component called{' '}
                            {customField.customName} but no component is
                            registered for it.
                        </div>
                    );
                }
            }
        }
        case FieldTypes.input:
            // const symbol = isRenderingTextField(field) ? field.symbol : undefined;
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <StatefulFieldData
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={onAnswerChangeForFieldProps}
                        fieldSize={FieldSize.Small}
                        readOnly={field.readOnly}
                        disabled={field.disabled}
                    />
                </FieldContainer>
            );
        case FieldTypes.textarea:
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <StatefulFieldData
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={onAnswerChangeForFieldProps}
                    />
                </FieldContainer>
            );
        case FieldTypes.number: {
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <StatefulFieldData
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={onAnswerChangeForFieldProps}
                        fieldType={FieldDataTypes.Number}
                        fieldSize={FieldSize.Small}
                    />
                </FieldContainer>
            );
        }

        case FieldTypes.money: {
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <StatefulFieldData
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={onAnswerChangeForFieldProps}
                        fieldType={FieldDataTypes.Value}
                        fieldSize={FieldSize.Small}
                    />
                </FieldContainer>
            );
        }

        case FieldTypes.phone: {
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <StatefulFieldData
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={onAnswerChangeForFieldProps}
                        fieldSize={FieldSize.Small}
                    />
                </FieldContainer>
            );
        }
        case FieldTypes.radio: {
            const radioOptions = options.map((o) => ({
                label: o.text,
                value: o.id,
                ariaLabel: o.text,
            }));

            return (
                <FieldContainer
                    {...defaultContainerProps}
                    withoutInfoSupplement
                >
                    <FieldLabel field={field} />
                    <Radio
                        options={radioOptions}
                        id={field.blueprintId}
                        onValueChange={onAnswerChangeForFieldProps}
                        defaultValue={field.value}
                    />
                </FieldContainer>
            );
        }
        case FieldTypes.checkbox:
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <Checkbox
                        id={field.id}
                        onClick={onAnswerChangeForFieldProps}
                        value={field.value}
                        showError={!!field.validationError?.message}
                    />
                </FieldContainer>
            );

        case FieldTypes.checkboxGroup: {
            const checkboxGroupOptions = options.map((o) => ({
                label: o.text,
                value: o.id,
                ariaLabel: o.text,
            }));
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <CheckboxGroup
                        options={checkboxGroupOptions}
                        onValueChange={onAnswerChangeForFieldProps}
                        value={field.value}
                        showError={!!field.validationError?.message}
                    />
                    {field.validationError?.message && (
                        <AssistiveText
                            role="alert"
                            variant={AssistiveTextVariant.Error}
                            text={field.validationError?.message}
                            className={clsx(style.assistiveTextCheckbox)}
                        />
                    )}
                </FieldContainer>
            );
        }
        case FieldTypes.dropdown: {
            // TODO: if searchable, render a searchable dropdown
            // if ((field as RenderingOptionField).searchable) {
            //   return (
            //     <FieldContainer {...defaultContainerProps}>
            //       <SearchableSelectField
            //         {...fieldProps}
            //         placeholder={placeholder ?? translate('select', { locale })}
            //         options={options}
            //         inputVariant={inputVariant}
            //         label={field.title}
            //         required={!field.optional}
            //         boldedBorder={isFocusedIncompleteField}
            //       />
            //     </FieldContainer>
            //   );
            // }

            const selectOptions = options.map((option) => ({
                textValue: option.text,
                value: option.id,
            }));

            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <Select
                        defaultValue={field.value}
                        value={field.value}
                        placeholder={placeholder ?? 'Select an option'}
                        options={selectOptions}
                        onValueChange={onAnswerChangeForFieldProps}
                        fieldSize={FieldSize.Small}
                        disabled={field.disabled}
                        fieldStatus={
                            field.optional
                                ? FieldStatus.DEFAULT
                                : FieldStatus.ERROR
                        }
                    />
                </FieldContainer>
            );
        }

        case FieldTypes.date:
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    {/* <DatePicker
            mode="single"
            selected={field.value}
            onSelect={(value) => {
              console.log('value', value);
              onAnswerChangeForFieldProps(value);
            }}
          /> */}
                    <StatefulFieldData
                        type="date"
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={onAnswerChangeForFieldProps}
                        fieldSize={FieldSize.Small}
                        readOnly={field.disabled}
                    />
                </FieldContainer>
            );

        // case FieldTypes.yearMonth:
        //   return (
        //     <FieldContainer {...defaultContainerProps}>
        //       <YearMonthField
        //         {...fieldProps}
        //         inputVariant={inputVariant}
        //         boldedBorder={isFocusedIncompleteField}
        //       />
        //     </FieldContainer>
        //   );

        // case FieldTypes.agree:
        //   if (styleVariant === StyleVariant.consumer) {
        //     if (isRenderingAgreeField(field)) {
        //       return (
        //         <FieldContainer {...defaultContainerProps}>
        //           <CheckboxAgree
        //             {...fieldProps}
        //             title={field.title || ''}
        //             showError={!!fieldProps.validationError}
        //             styleVariant={styleVariant}
        //             consentText={field.modalText || ''}
        //           />
        //         </FieldContainer>
        //       );
        //     }
        //   } else if (styleVariant === StyleVariant.pro) {
        //     if (isRenderingAgreeField(field)) {
        //       return (
        //         <FieldContainer {...defaultContainerProps}>
        //           <AgreeField
        //             {...fieldProps}
        //             text={field.text}
        //             title={field.title || ''}
        //             confirmedLabel={field.confirmedLabel}
        //             modalHeader={field.modalHeader}
        //             modalText={field.modalText}
        //             boldedBorder={isFocusedIncompleteField}
        //           />
        //         </FieldContainer>
        //       );
        //     }
        //   }
        //   break;

        // case FieldTypes.button:
        //   if (isRenderingButtonField(field)) {
        //     return (
        //       <FieldContainer {...defaultContainerProps}>
        //         <ActionButton
        //           promptText={field.label || ''}
        //           linkText={field.buttonText || ''}
        //           onAnswerChange={fieldProps.onAnswerChange}
        //           resetOnMount={styleVariant === StyleVariant.consumer}
        //           icon={
        //             field.iconName ? (
        //               <Icon
        //                 name={IconName[field.iconName as IconName]}
        //                 size="20px"
        //               />
        //             ) : undefined
        //           }
        //           boldedBorder={isFocusedIncompleteField}
        //         />
        //       </FieldContainer>
        //     );
        //   }
        //   break;

        // case FieldTypes.autocomplete:
        //   const { countryCode, nodeIdsToUpdate } =
        //     field as RenderingAutocompleteField;

        //   // onAnswerComplete is not defined on AddressAutoCompleteInput
        //   const {
        //     onAnswerComplete: __onAnswerComplete,
        //     ...addressAutoCompleteInputFieldProps
        //   } = fieldProps;

        //   return (
        //     <FieldContainer {...defaultContainerProps}>
        //       <AddressAutocompleteInput
        //         {...addressAutoCompleteInputFieldProps}
        //         boldedBorder={isFocusedIncompleteField}
        //         onAutocompleteAnswerChange={onAnswerChange}
        //         nodeIdScope={
        //           field.scope.repeatedInstanceIdentifierContext.byNodeId
        //         }
        //         countryCode={countryCode}
        //         nodeIdsToUpdate={nodeIdsToUpdate}
        //         inputVariant={inputVariant}
        //         placeholder={placeholder}
        //         variant="outlined"
        //       />
        //     </FieldContainer>
        //   );

        // case FieldTypes.information:
        // case FieldTypes.currencyCard:
        //   return (
        //     <FieldContainer {...defaultContainerProps}>
        //       <Fragment />
        //     </FieldContainer>
        //   );

        // // This is handled by the dynamic PDF package, and we don't render this field type with the field-generator
        // case FieldTypes.signature:
        //   return null;

        default:
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    Field of type {field.type} not supported
                </FieldContainer>
            );
        // throw new Error('Please specify the type of field in FieldGenerator');
    }
}

function getPlaceholderForField(field: RenderingField): string | undefined {
    return isRenderingPlaceholderField(field) ? field.placeholder : undefined;
}
