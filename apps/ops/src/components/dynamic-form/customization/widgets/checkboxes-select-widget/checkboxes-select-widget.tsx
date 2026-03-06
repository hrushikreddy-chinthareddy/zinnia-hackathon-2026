import {
    FormContextType,
    getUiOptions,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import SelectSimple from '@deps/components/select/select';

import styles from './checkboxes.module.css';

const FormSectionLabel = ({ text }: { text: string }) => (
    <div className="mb-2 mt-4 first:mt-0">
        <Label>
            <span className={styles.sectionLabel}>
                {text}
                <span className={styles.requiredAsterisk}> *</span>
            </span>
        </Label>
    </div>
);

export default function CheckBoxesSelectWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>({
    id,
    options,
    value,
    onChange,
    readonly,
    uiSchema,
    formContext,
}: WidgetProps<T, S, F>) {
    const { enumOptions = [], enumDisabled = [] } = options;
    const { label } = getUiOptions(uiSchema);
    const [selectedData, setSelectedData] = useState<
        Array<{
            value: string;
            exceptionSubRefs: Array<{ subNigoId: string; value: string }>;
        }>
    >(
        Array.isArray(value)
            ? value.filter(
                  (
                      v
                  ): v is {
                      value: string;
                      exceptionSubRefs: Array<{
                          subNigoId: string;
                          value: string;
                      }>;
                  } =>
                      typeof v === 'object' &&
                      'value' in v &&
                      Array.isArray(v.exceptionSubRefs)
              )
            : []
    );

    const issueResolved = formContext?.customData?.issueResolved;
    const isNigo = issueResolved === false;

    const isMismatchCategory = (category?: string) =>
        !!category && category.toLowerCase().includes('mismatch');

    const missingOptions = Array.isArray(enumOptions)
        ? enumOptions.filter((opt: any) => !isMismatchCategory(opt.category))
        : [];
    const mismatchedOptions = Array.isArray(enumOptions)
        ? enumOptions.filter((opt: any) => isMismatchCategory(opt.category))
        : [];

    useEffect(() => {
        onChange(selectedData);
    }, [selectedData, onChange]);

    const isChecked = (val: string) =>
        selectedData.some((entry) => entry.value === val);

    const getSelectedEntry = (val: string) =>
        selectedData.find((entry) => entry.value === val);

    const handleCheckboxChange = (option: any, checked: boolean) => {
        if (checked) {
            setSelectedData((prev) => [
                ...prev,
                {
                    value: option.value,
                    exceptionSubRefs: [],
                    category: option.category,
                    reason: option.reason,
                    detailedReason: option.detailedReason,
                },
            ]);
        } else {
            setSelectedData((prev) =>
                prev.filter((entry) => entry.value !== option.value)
            );
        }
    };

    const handleSelectChange = (
        checkboxValue: string,
        selectedValues: string[],
        selectOptions: { value: string; label: string }[]
    ) => {
        const mapped = selectedValues.map((val) => {
            const found = selectOptions.find((opt) => opt.value === val);
            return {
                subNigoId: val,
                value: found?.label || val,
            };
        });

        setSelectedData((prev) =>
            prev.map((entry) =>
                entry.value === checkboxValue
                    ? { ...entry, exceptionSubRefs: mapped }
                    : entry
            )
        );
    };

    const getSubOptions = (options: any[], parent: string) => {
        return options.map((item) => ({
            value: item.value,
            label: item.label,
            displayText: item.label,
            parentLabel: parent,
        }));
    };

    if (readonly) {
        return (
            <>
                {selectedData
                    .map(
                        (entry) =>
                            `${entry.value}: ${entry.exceptionSubRefs.join(
                                ', '
                            )}`
                    )
                    .join(' | ')}
            </>
        );
    }

    const renderOption = (option: any) => {
        const checked = isChecked(option.value);
        const itemDisabled = enumDisabled.includes(option.value);
        const selectedEntry = getSelectedEntry(option.value);

        return (
            <div key={option.value}>
                <CheckboxText
                    id={`${id}_${option.value}`}
                    label={label ? option.label : ''}
                    onChange={(checked) =>
                        handleCheckboxChange(option, checked)
                    }
                    checked={checked}
                    isDisabled={itemDisabled}
                />
                {checked && (
                    <div className="w-[300px] mx-8 mt-2">
                        <SelectSimple
                            label={'Select details'}
                            value={
                                selectedEntry?.exceptionSubRefs?.reduce(
                                    (acc, curr) => {
                                        acc[curr.subNigoId] = curr.value;
                                        return acc;
                                    },
                                    {} as { [key: string]: string }
                                ) || {}
                            }
                            isMultiselect
                            onChange={(selectedKey: string) => {
                                const previousValues =
                                    selectedEntry?.exceptionSubRefs?.map(
                                        (obj) => obj.subNigoId
                                    ) || [];

                                const isSelected =
                                    previousValues.includes(selectedKey);

                                const newValues = isSelected
                                    ? previousValues.filter(
                                          (v) => v !== selectedKey
                                      )
                                    : [...previousValues, selectedKey];

                                handleSelectChange(
                                    option.value,
                                    newValues,
                                    getSubOptions(
                                        option.selectOptions,
                                        option.value
                                    )
                                );
                            }}
                            options={getSubOptions(
                                option.selectOptions,
                                option.value
                            )}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            id={id}
            className={styles.checkboxGroupRoot}
            aria-label="Checkbox Group"
        >
            {isNigo ? (
                <>
                    {missingOptions.length > 0 && (
                        <div className="mb-4">
                            <FormSectionLabel text="Missing details in the form" />
                            <div className="space-y-2">
                                {missingOptions.map((option: any) =>
                                    renderOption(option)
                                )}
                            </div>
                        </div>
                    )}
                    {mismatchedOptions.length > 0 && (
                        <div>
                            <FormSectionLabel text="Mismatched details in the form" />
                            <div className="space-y-2">
                                {mismatchedOptions.map((option: any) =>
                                    renderOption(option)
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                (enumOptions as any[]).map((option: any) =>
                    renderOption(option)
                )
            )}
        </div>
    );
}
