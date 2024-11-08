import { AssistiveText, AssistiveTextVariant, Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ChangeEvent, RefObject, useContext, useRef } from 'react';

import { PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys } from '@deps/types/search';

import styles from './search-field-toggle.module.css';

interface SearchFieldToggleProps {
    handleChange: (e: ChangeEvent<HTMLInputElement>, value: string, key: PolicySearchKeys) => void;
    activeLabels: LabelValue<PolicySearchKeys>;
    onClear?: (ref: RefObject<HTMLInputElement>) => void;
}

export const SearchFieldContainer = ({ handleChange, activeLabels, onClear }: SearchFieldToggleProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { showFieldErrorMessage } = useContext(PolicySearchFiltersContext);
    const { value: policyKey, label = '', placeholder, errorMessage } = activeLabels;

    const inputType = () => {
        switch (activeLabels.value) {
            case 'policyNumber':
            case 'ssn':
                return 'number';
            default:
                return 'text';
        }
    };

    // to do - the entire search will clear but only one input (when there are two) clears
    const handleClear = () => {
        if (inputRef?.current && onClear) {
            onClear(inputRef);
            inputRef.current.value = '';
        }
    };

    return (
        <div className={clsx(styles.inputContainer)}>
            <Icon type={IconType.SEARCH} className={styles.icon} color="#676767" />
            <input
                // We're using an aria attribute here because if there are multiple inputs they couldn't use one label attached to them both
                aria-labelledby="case-search-label"
                type={inputType()}
                placeholder={placeholder ? placeholder : toSentenceCase(label)}
                className={clsx(styles.input, 'text-body-sm focus:!ring-0')}
                onChange={e => {
                    const text = (e.target as HTMLInputElement).value;
                    handleChange(e, text, policyKey as PolicySearchKeys);
                }}
                ref={inputRef}
            />
            <Button className={styles.close} onClick={handleClear} mode="link">
                <Icon type={IconType.CLOSE} />
            </Button>
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
            fields = (
                <fieldset className={styles.fieldSet}>
                    {group.map((g, index) => (
                        <SearchFieldContainer key={'search-field-container-key-' + index} activeLabels={g} {...rest} />
                    ))}
                </fieldset>
            );
        } else {
            fields = <SearchFieldContainer activeLabels={activeLabels} {...rest} />;
        }
    }

    return <>{fields}</>;
};

export default SearchFieldToggle;
