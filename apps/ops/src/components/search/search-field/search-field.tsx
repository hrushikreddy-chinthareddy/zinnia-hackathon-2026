import {
    AssistiveText,
    AssistiveTextVariant,
    Button,
    Icon,
    IconType,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { useSearchBarcontext } from '@deps/contexts/SearchBarContext';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

import styles from './search-field.module.css';

interface SearchFieldProps {
    activeLabels: LabelValue<PolicySearchKeys>;
    onChange?: (value: string, key: PolicySearchKeys) => void;
    onClear?: (searchField: PolicySearchKeys | undefined) => void;
    values: SearchViewQuery;
    inputClasses?: string;
}

export const SearchFieldContainer = ({
    activeLabels,
    onChange,
    onClear,
    values,
    inputClasses,
}: SearchFieldProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { showFieldErrorMessage } = useSearchBarcontext();
    const {
        value: policyKey,
        label = '',
        placeholder,
        errorMessage,
    } = activeLabels;
    const { t } = useTranslation(TranslationFiles.COMMON);
    const inputValue = values[activeLabels?.value || ''] || '';

    const inputClass = () => {
        switch (activeLabels.value) {
            case 'ssn':
            case 'policyNumber':
            case 'caseId':
            case 'firmName':
                return styles.wide;
        }
    };

    const handleClear = () => {
        if (inputRef?.current && onClear) {
            onClear(activeLabels.value);
            inputRef.current.value = '';
            setHasValue(false);
        }
    };

    const [hasValue, setHasValue] = useState(false);

    useEffect(() => {
        setHasValue(!!inputValue);
    }, [inputValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            const text = e?.target?.value || '';
            onChange(text, policyKey as PolicySearchKeys);
        }
    };

    return (
        <div className={clsx(styles.inputContainer)}>
            <Icon
                type={IconType.SEARCH}
                className={styles.icon}
                color="#676767"
            />
            <input
                placeholder={placeholder ? placeholder : toSentenceCase(label)}
                className={clsx(
                    styles.input,
                    inputClass(),
                    'text-body-sm',
                    inputClasses
                )}
                key={activeLabels.value}
                ref={inputRef}
                onChange={handleChange}
                value={inputValue}
            />
            {hasValue && (
                <Button
                    className={styles.close}
                    onClick={handleClear}
                    mode="link"
                >
                    <span className="sr-only">
                        {t('dashboard.search.clear')}
                    </span>
                    <Icon type={IconType.CLOSE} />
                </Button>
            )}
            {showFieldErrorMessage && errorMessage && (
                <AssistiveText
                    text={errorMessage}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2 max-w-[210px]"
                />
            )}
        </div>
    );
};

const SearchField = ({ activeLabels, values, ...rest }: SearchFieldProps) => {
    let fields;

    if (activeLabels) {
        const { group } = activeLabels;

        if (group?.length) {
            fields = (
                <div className={styles.fieldSet}>
                    {group.map((g, index) => (
                        <SearchFieldContainer
                            key={'search-field-container-key-' + index}
                            activeLabels={g}
                            values={values}
                            {...rest}
                        />
                    ))}
                </div>
            );
        } else {
            fields = (
                <SearchFieldContainer
                    activeLabels={activeLabels}
                    values={values}
                    {...rest}
                />
            );
        }
    }

    return <>{fields}</>;
};

export default SearchField;
