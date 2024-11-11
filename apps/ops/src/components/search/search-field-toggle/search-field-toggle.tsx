import { AssistiveText, AssistiveTextVariant, Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ChangeEvent, forwardRef, MutableRefObject, useContext, useRef } from 'react';

import { PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys } from '@deps/types/search';

import styles from './search-field-toggle.module.css';

interface SearchFieldToggleProps {
    handleChange: (e: ChangeEvent<HTMLInputElement>, value: string, key: PolicySearchKeys) => void;
    activeLabels: LabelValue<PolicySearchKeys>;
    onClear?: () => void;
    ref?: MutableRefObject<HTMLInputElement | null>;
}

export const SearchFieldContainer = forwardRef<HTMLInputElement, SearchFieldToggleProps>(({ handleChange, activeLabels, onClear }, ref) => {
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
                ref={ref}
            />
            <Button className={styles.close} onClick={onClear} mode="link">
                <Icon type={IconType.CLOSE} />
            </Button>
            {showFieldErrorMessage && errorMessage && (
                <AssistiveText text={errorMessage} variant={AssistiveTextVariant.Error} className="mt-2" />
            )}
        </div>
    );
});
SearchFieldContainer.displayName = 'SearchFieldContainer';

const SearchFieldToggle = ({ activeLabels, onClear, ...rest }: SearchFieldToggleProps) => {
    let fields;
    const firstInputRef = useRef<HTMLInputElement | null>(null);
    const secondInputRef = useRef<HTMLInputElement | null>(null);
    if (activeLabels) {
        const { group } = activeLabels;

        const handleClear = () => {
            if (firstInputRef?.current && onClear) {
                onClear();
                firstInputRef.current.value = '';
            }
            if (secondInputRef.current) {
                secondInputRef.current.value = '';
            }
        };

        if (group?.length) {
            const firstInput = group[0];
            const secondInput = group[1];

            fields = (
                <fieldset className={styles.fieldSet}>
                    <SearchFieldContainer activeLabels={firstInput} ref={firstInputRef} {...rest} onClear={handleClear} />
                    <SearchFieldContainer activeLabels={secondInput} ref={secondInputRef} {...rest} onClear={handleClear} />
                </fieldset>
            );
        } else {
            fields = <SearchFieldContainer activeLabels={activeLabels} onClear={handleClear} {...rest} />;
        }
    }

    return <>{fields}</>;
};

export default SearchFieldToggle;
