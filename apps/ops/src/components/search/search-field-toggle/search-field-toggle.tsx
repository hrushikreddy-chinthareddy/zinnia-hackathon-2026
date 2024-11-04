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
    handleChange: (e: ChangeEvent<HTMLInputElement>, value: string, key: PolicySearchKeys) => void;
    activeLabels: LabelValue<PolicySearchKeys>;
    onClear?: (ref: RefObject<HTMLInputElement>) => void;
}

interface SearchFieldContainerProps extends SearchFieldToggleProps {
    autoFocus?: boolean;
}

export const SearchFieldContainer = ({ values, handleChange, activeLabels, onClear }: SearchFieldContainerProps) => {
    const { showFieldErrorMessage } = useContext(PolicySearchFiltersContext);
    const { value: policyKey, label, replaceValue = '', placeholder, errorMessage } = activeLabels;
    let value = (policyKey && values[policyKey]) || '';

    // to do - i don't think i want value on the input field at all
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
                onChange={e => {
                    const text = (e.target as HTMLInputElement).value;
                    handleChange(e, text, policyKey as PolicySearchKeys);
                }}
            />
            {showFieldErrorMessage && errorMessage && (
                <AssistiveText text={errorMessage} variant={AssistiveTextVariant.Error} className="mt-2" />
            )}
        </div>
    );
};

const SearchFieldToggle = ({ activeLabels, ...rest }: SearchFieldToggleProps) => {
    let fields;
    if (activeLabels) {
        const { group } = activeLabels;

        if (group?.length) {
            fields = group.map((g, index) => (
                <SearchFieldContainer key={'search-field-container-key-' + g.value} activeLabels={g} autoFocus={index === 0} {...rest} />
            ));
        } else {
            fields = <SearchFieldContainer activeLabels={activeLabels} autoFocus={true} {...rest} />;
        }
    }

    return <>{fields}</>;
};

export default SearchFieldToggle;
