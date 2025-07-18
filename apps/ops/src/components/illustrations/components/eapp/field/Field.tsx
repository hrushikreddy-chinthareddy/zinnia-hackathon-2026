import {
    Checkbox,
    FieldData,
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
import ReactHtmlParser from 'html-react-parser';
import {
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    memo,
} from 'react';

import style from './field.module.css';
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

const FieldLabel = ({ field }: { field: RenderingField }) => {
    return (
        (field.title || field.text) && (
            <div className={style.fieldHeader}>
                {field.title && (
                    <label
                        htmlFor={field.id}
                        className="typography-labels-label-md-alt"
                    >
                        {ReactHtmlParser(field.title)}
                        {!field.optional && '*'}
                    </label>
                )}
                {field.text && (
                    <p className="typography-labels-label-sm-alt">
                        {ReactHtmlParser(field.text)}
                    </p>
                )}
            </div>
        )
    );
};

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
                            field.metadata.repeatedInstanceIdentifierContext
                                .byBlueprintId,
                        nodeIdScope:
                            field.metadata.repeatedInstanceIdentifierContext
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
            field.metadata.repeatedInstanceIdentifierContext.byBlueprintId,
            field.metadata.repeatedInstanceIdentifierContext.byNodeId,
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
        case FieldTypes.input:
            // const symbol = isRenderingTextField(field) ? field.symbol : undefined;
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <FieldData
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={(e) =>
                            onAnswerChangeForFieldProps(e.target.value)
                        }
                        fieldSize={FieldSize.Small}
                        readOnly={field.disabled}
                    />
                </FieldContainer>
            );
        case FieldTypes.textarea:
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <FieldData
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={(e) =>
                            onAnswerChangeForFieldProps(e.target.value)
                        }
                    />
                </FieldContainer>
            );
        case FieldTypes.number: {
            return (
                <FieldContainer {...defaultContainerProps}>
                    <FieldLabel field={field} />
                    <FieldData
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={(e) =>
                            onAnswerChangeForFieldProps(e.target.value)
                        }
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
                    <FieldData
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={(e) =>
                            onAnswerChangeForFieldProps(e.target.value)
                        }
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
                    <FieldData
                        name={field.id}
                        errorMessage={field.validationError?.message}
                        fieldStatus={
                            field.validationError?.message
                                ? FieldStatus.ERROR
                                : undefined
                        }
                        required={!field.optional}
                        value={field.value}
                        onChange={(e) =>
                            onAnswerChangeForFieldProps(e.target.value)
                        }
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
                    />
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
                    <FieldData
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
                        onChange={(e) =>
                            onAnswerChangeForFieldProps(e.target.value)
                        }
                        fieldSize={FieldSize.Small}
                        readOnly={field.disabled}
                    />
                    {field.validationError?.message && (
                        <p className={style.errorMessage}>
                            {field.validationError?.message}
                        </p>
                    )}
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
        //           field.metadata.repeatedInstanceIdentifierContext.byNodeId
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

interface FieldContainerProps {
    forceNewLine: boolean;
    fieldSize: number;
    field: RenderingField;
    infoSupplementImage?: { src: string; alt?: string };
    onInfoIconClick?: () => void;
    withoutInfoSupplement?: boolean;
    children?: ReactNode;
    focusedIncompleteFieldId?: string;
    boldedBorder?: boolean;
}

function FieldContainer(props: FieldContainerProps): ReactElement {
    const {
        // forceNewLine,
        field,
        children,
        // fieldSize,
        // onInfoIconClick,
        // infoSupplementImage,
        withoutInfoSupplement = false,
        focusedIncompleteFieldId,
        // boldedBorder,
    } = props;

    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (focusedIncompleteFieldId === field.blueprintId) {
            const { current } = divRef;
            if (current) {
                current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [focusedIncompleteFieldId, field.blueprintId]);

    // const gridSize = useMemo(() => {
    //   if (withoutInfoSupplement) {
    //     return 12;
    //   }
    //   return (
    //     field.info ? fieldSize - INFO_ICON_BUTTON_SIZE : fieldSize
    //   ) as number;
    // }, [withoutInfoSupplement, field.info, fieldSize]);

    return (
        <div className={style.fieldContainer}>
            {/*  TODO: handle force new line*/}
            {/* {forceNewLine && <SpacerField styleVariant={styleVariant} />} */}

            <div>{children}</div>
            {withoutInfoSupplement === false && field.info && (
                <div>
                    <div>
                        {/* TODO: info supplement */}
                        <div>(i)</div>
                        {/* <InfoSupplement
              title={field.info.title}
              text={field.info.text}
              image={infoSupplementImage}
              modalOptions={field.info.modalOptions}
              onClick={onInfoIconClick}
              boldedBorder={boldedBorder}
            /> */}
                    </div>
                </div>
            )}
        </div>
    );
}

export function ReadOnlyField({ field }: { field: RenderingField }) {
    return (
        <FieldContainer field={field} forceNewLine fieldSize={FieldSizes.full}>
            <FieldLabel field={field} />
            {field.value && <p>{field.value}</p>}
        </FieldContainer>
    );
}
