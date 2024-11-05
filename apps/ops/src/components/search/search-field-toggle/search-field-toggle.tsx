import { ChangeEvent, RefObject, useContext } from 'react';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

interface SearchFieldToggleProps {
    values: SearchViewQuery;
    handleEnterKey: () => void;
    handleChange: (e: ChangeEvent<HTMLInputElement>, value: string, key: PolicySearchKeys) => void;
    activeLabels: LabelValue<PolicySearchKeys>;
    onClear?: (ref: RefObject<HTMLInputElement>) => void;
}

interface SearchFieldContainerProps extends SearchFieldToggleProps {
    columns?: number;
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

    return (
        <div className="w-full" key={'active-labels-grid-' + label}>
            <Field
                value={value}
                key={'search-field-toggle-' + policyKey}
                autoFocus={autoFocus}
                label={fullLabel ? fullLabel : toSentenceCase(label)}
                type={FieldType.BaseActive}
                variant={showFieldErrorMessage ? FieldVariant.Error : FieldVariant.Default}
                size={FieldSize.Small}
                formatOptions={format ? { format, mask, prefix } : undefined}
                placeholder={placeholder}
                onChange={e => {
                    const text = (e.target as HTMLInputElement).value;

                    handleChange(e, text, policyKey as PolicySearchKeys);
                }}
                onClear={onClear}
                handleEnterKey={handleEnterKey}
                isClearable
                message={showFieldErrorMessage && errorMessage ? errorMessage : ''}
            />
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
                    columns={2}
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
