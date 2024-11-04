import { AssistiveText, AssistiveTextVariant, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ChangeEvent, RefObject, useContext } from 'react';

import { PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

import styles from './search-field-toggle.module.css';

interface SearchFieldToggleProps {
    values: SearchViewQuery;
    handleEnterKey: () => void;
    handleChange: (e: ChangeEvent<HTMLInputElement>, value: string, key: PolicySearchKeys) => void;
    activeLabels: LabelValue<PolicySearchKeys>;
    onClear?: (ref: RefObject<HTMLInputElement>) => void;
}

interface SearchFieldContainerProps extends SearchFieldToggleProps {
    autoFocus?: boolean;
}

export const SearchFieldContainer = ({
    values,
    handleEnterKey,
    handleChange,
    activeLabels,
    autoFocus = false,
    onClear,
}: SearchFieldContainerProps) => {
    const { showFieldErrorMessage } = useContext(PolicySearchFiltersContext);
    const { value: policyKey, label, format, mask, prefix, replaceValue = '', fullLabel, placeholder, errorMessage } = activeLabels;
    let value = (policyKey && values[policyKey]) || '';

    if (replaceValue) {
        value = value.replaceAll(replaceValue, '') || '';
    }

    const inputType = () => {
        switch (activeLabels.value) {
            case 'policyNumber':
            case 'ssn':
                return 'number';
            default:
                return 'text';
        }
    };

    return (
        <div className={clsx(styles.inputContainer)}>
            <Icon type={IconType.SEARCH} className={styles.icon} color="#676767" />
            <input
                id="case-search-input"
                type={inputType()}
                placeholder={placeholder ? placeholder : toSentenceCase(label)}
                className={clsx(styles.input, 'text-body-sm', styles[inputType()])}
                value={value}
            />
            {showFieldErrorMessage && errorMessage && (
                <AssistiveText text={errorMessage} variant={AssistiveTextVariant.Error} className="mt-2" />
            )}
            {/* <Field
                value={value}
                key={'search-field-toggle-' + policyKey}
                autoFocus={autoFocus}
                type={FieldType.BaseActive}
                variant={showFieldErrorMessage ? FieldVariant.Error : FieldVariant.Default}
                formatOptions={format ? { format, mask, prefix } : undefined}
                placeholder={fullLabel ? fullLabel : toSentenceCase(label)}
                onChange={e => {
                    const text = (e.target as HTMLInputElement).value;

                    handleChange(e, text, policyKey as PolicySearchKeys);
                }}
                onClear={onClear}
                message={showFieldErrorMessage && errorMessage ? errorMessage : ''}
                containerClassName={styles.fieldContainer}
                className={`${styles.field} text-body-sm`}
            /> */}
        </div>
    );
};

const SearchFieldToggle = ({ activeLabels, handleEnterKey, ...rest }: SearchFieldToggleProps) => {
    let fields;
    if (activeLabels) {
        const { group } = activeLabels;

        if (group?.length) {
            fields = group.map((g, index) => (
                <SearchFieldContainer
                    key={'search-field-container-key-' + g.value}
                    activeLabels={g}
                    autoFocus={index === 0}
                    handleEnterKey={handleEnterKey}
                    {...rest}
                />
            ));
        } else {
            fields = <SearchFieldContainer activeLabels={activeLabels} autoFocus={true} handleEnterKey={handleEnterKey} {...rest} />;
        }
    }

    return <>{fields}</>;
};

export default SearchFieldToggle;
