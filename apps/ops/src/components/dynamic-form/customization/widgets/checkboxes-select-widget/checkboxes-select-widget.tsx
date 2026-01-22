import {
    FormContextType,
    getUiOptions,
    RJSFSchema,
    StrictRJSFSchema,
    UiSchema,
    WidgetProps,
} from '@rjsf/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { SubOptionsKeyName } from '@deps/containers/task-container/task-handlers/types';

import styles from './checkboxes.module.css';

export type CheckBoxesSelectDropdownOption = {
    label: string;
    value: string;
};

export type CheckBoxesSelectOption = {
    label: string;
    value: string;
    subOptionLabel?: string;
    category?: string;
    reason?: string;
    detailedReason?: string;
    selectOptions: CheckBoxesSelectDropdownOption[];
};

type CheckboxEntry = {
    value: string;
    [key: string]: any;
};

export interface UIOptions extends UiSchema {
    // formSchema payload key containing the subOptions array (dropdown options)
    subOptionsKeyName: SubOptionsKeyName;

    // unique key used to identify items in the subOptions array
    subOptionsUniqueKey: string;

    label?: string;
    subOptionLabel?: string;
    enumOptions?: CheckBoxesSelectOption[];
    enumDisabled?: string[];
}

export default function CheckBoxesSelectWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>({ id, value, onChange, readonly, uiSchema }: WidgetProps<T, S, F>) {
    const {
        label,
        subOptionsKeyName,
        subOptionsUniqueKey,
        enumOptions = [],
        enumDisabled = [],
        subOptionLabel,
    } = getUiOptions(uiSchema) as UIOptions;

    // selectedData is the payload defined in formSchema and to be sent to the backend.
    const [selectedData, setSelectedData] = useState(
        Array.isArray(value)
            ? value.filter(
                  (v: CheckboxEntry) =>
                      typeof v === 'object' &&
                      'value' in v &&
                      Array.isArray(v[subOptionsKeyName as SubOptionsKeyName])
              )
            : []
    );

    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'allFields',
    });

    const isChecked = (val: string) =>
        selectedData.some((entry: CheckboxEntry) => entry.value === val);

    const getSelectedEntry = (val: string) =>
        selectedData.find((entry: CheckboxEntry) => entry.value === val);

    const getNewCheckboxEntryData = (
        type: string,
        option: CheckBoxesSelectOption
    ) => {
        switch (type) {
            case SubOptionsKeyName.ExceptionSubRefs:
                return {
                    value: option.value,
                    [subOptionsKeyName as SubOptionsKeyName]: [],
                    category: option.category,
                    reason: option.reason,
                    detailedReason: option.detailedReason,
                };
        }
    };

    const handleCheckboxChange = (
        option: CheckBoxesSelectOption,
        checked: boolean
    ) => {
        if (checked) {
            setSelectedData((prev: CheckboxEntry[]) => [
                ...prev,
                getNewCheckboxEntryData(
                    subOptionsKeyName as SubOptionsKeyName,
                    option
                ),
            ]);
        } else {
            setSelectedData((prev: CheckboxEntry[]) =>
                prev.filter(
                    (entry: CheckboxEntry) => entry.value !== option.value
                )
            );
        }
    };

    const handleSelectChange = (
        checkboxValue: string,
        selectedValues: string[],
        selectOptions: { [key: string]: string }[]
    ) => {
        const mapped = selectedValues.map((val) => {
            const found = selectOptions.find((opt) => opt.value === val);
            return {
                [subOptionsUniqueKey as string]: val,
                value: found?.label || val,
            };
        });

        setSelectedData((prev: CheckboxEntry[]) =>
            prev.map((entry: CheckboxEntry) =>
                entry.value === checkboxValue
                    ? {
                          ...entry,
                          [subOptionsKeyName as SubOptionsKeyName]: mapped,
                      }
                    : entry
            )
        );
    };

    const handleMultiSelectChange = (
        selectedKey: string,
        option: CheckBoxesSelectOption,
        selectedEntry: CheckboxEntry
    ) => {
        const previousValues =
            selectedEntry?.[subOptionsKeyName as SubOptionsKeyName]?.map(
                (obj: CheckboxEntry) => obj[subOptionsUniqueKey as string]
            ) || [];

        const isSelected = previousValues.includes(selectedKey);

        const newValues = isSelected
            ? previousValues.filter((v: string) => v !== selectedKey)
            : [...previousValues, selectedKey];

        handleSelectChange(
            option.value,
            newValues,
            getSubOptions(option.selectOptions, option.value)
        );
    };

    const getSubOptions = (
        options: CheckBoxesSelectDropdownOption[],
        parent: string
    ) => {
        return options.map((item) => ({
            ...item,
            displayText: item.label,
            parentLabel: parent,
        }));
    };

    useEffect(() => {
        onChange(selectedData);
    }, [selectedData]);

    if (readonly) {
        return (
            <>
                {selectedData
                    .map(
                        (entry: CheckboxEntry) =>
                            `${entry.value}: ${entry[
                                subOptionsKeyName as SubOptionsKeyName
                            ].join(', ')}`
                    )
                    .join(' | ')}
            </>
        );
    }

    return (
        <div
            id={id}
            className={styles.checkboxGroupRoot}
            aria-label="Checkbox Group"
        >
            {enumOptions.map(
                (option: CheckBoxesSelectOption, index: number) => {
                    const checked = isChecked(option.value);
                    const itemDisabled = enumDisabled.includes(option.value);
                    const selectedEntry = getSelectedEntry(option.value);

                    return (
                        <div key={`checkbox-${index}`}>
                            <CheckboxText
                                id={`${id}_${index}`}
                                label={label ? option.label : ''}
                                onChange={(isChecked) =>
                                    handleCheckboxChange(option, isChecked)
                                }
                                checked={checked}
                                isDisabled={itemDisabled}
                            />
                            {checked && (
                                <div className={styles.selectSimpleContainer}>
                                    <SelectSimple
                                        label={
                                            option.subOptionLabel ||
                                            subOptionLabel ||
                                            (t('selectDetails') as string)
                                        }
                                        value={
                                            selectedEntry?.[
                                                subOptionsKeyName as SubOptionsKeyName
                                            ]?.reduce(
                                                (
                                                    acc: CheckboxEntry,
                                                    curr: CheckboxEntry
                                                ) => {
                                                    acc[
                                                        curr[
                                                            subOptionsUniqueKey as string
                                                        ]
                                                    ] = curr.value;
                                                    return acc;
                                                },
                                                {} as CheckboxEntry
                                            ) || {}
                                        }
                                        isMultiselect
                                        onChange={(selectedKey: string) => {
                                            handleMultiSelectChange(
                                                selectedKey,
                                                option,
                                                selectedEntry
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
                }
            )}
        </div>
    );
}
