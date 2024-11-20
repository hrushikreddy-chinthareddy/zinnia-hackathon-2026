import { AssistiveText, AssistiveTextVariant, Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ChangeEvent, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys } from '@deps/types/search';

import styles from './search-field-toggle.module.css';

interface SearchFieldToggleProps {
    handleChange: (e: ChangeEvent<HTMLInputElement>, value: string, key: PolicySearchKeys) => void;
    activeLabels: LabelValue<PolicySearchKeys>;
    onClear?: (searchField: PolicySearchKeys | undefined) => void;
}

export const SearchFieldContainer = ({ handleChange, activeLabels, onClear }: SearchFieldToggleProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { showFieldErrorMessage } = useContext(PolicySearchFiltersContext);
    const { value: policyKey, label = '', placeholder, errorMessage } = activeLabels;
    const { t } = useTranslation(TranslationFiles.COMMON);

    const inputType = () => {
        switch (activeLabels.value) {
            case 'ssn':
                return 'number';
            default:
                return 'text';
        }
    };

    const inputClass = () => {
        switch (activeLabels.value) {
            case 'ssn':
            case 'policyNumber':
                return styles.wide;
        }
    };

    const handleClear = () => {
        if (inputRef?.current && onClear) {
            onClear(activeLabels.value);
            inputRef.current.value = '';
        }
    };
    const hasValue = !!inputRef.current?.value;

    return (
        <div className={clsx(styles.inputContainer)}>
            <Icon type={IconType.SEARCH} className={styles.icon} color="#676767" />
            <input
                // We're using an aria attribute here because if there are multiple inputs they couldn't use one label attached to them both
                aria-labelledby="case-search-label"
                type={inputType()}
                placeholder={placeholder ? placeholder : toSentenceCase(label)}
                className={clsx(styles.input, inputClass(), 'text-body-sm focus:!ring-0')}
                onChange={e => {
                    const text = (e.target as HTMLInputElement).value;
                    handleChange(e, text, policyKey as PolicySearchKeys);
                }}
                key={activeLabels.value}
                ref={inputRef}
            />
            {hasValue && (
                <Button className={styles.close} onClick={handleClear} mode="link">
                    <span className="sr-only">{t('dashboard.search.clear')}</span>
                    <Icon type={IconType.CLOSE} />
                </Button>
            )}
            {showFieldErrorMessage && errorMessage && (
                <AssistiveText text={errorMessage} variant={AssistiveTextVariant.Error} className="mt-2 max-w-[210px]" />
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
