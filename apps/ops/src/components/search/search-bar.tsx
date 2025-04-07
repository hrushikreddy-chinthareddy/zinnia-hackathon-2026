import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { TFunction, useTranslation } from 'next-i18next';
import { ChangeEvent, HTMLAttributes, useCallback, useContext, useEffect, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

import styles from './search-bar.module.css';
import SearchFieldToggle from './search-field-toggle/search-field-toggle';
import Typography, { TypographyVariant } from '../typography/typography';

export const SearchBarInitialValues: SearchViewQuery = {};

interface SearchBarProps extends Omit<HTMLAttributes<HTMLInputElement>, 'onToggle'> {
    searchValue: SearchViewQuery;
    onSearch: (value: SearchViewQuery) => void;
    initialToggleValue: PolicySearchKeys;
    toggleLabels: (t: TFunction) => LabelValue<PolicySearchKeys>[];
    onToggle?: (value: PolicySearchKeys) => void;
    onClear?: (searchField: PolicySearchKeys | undefined) => void;
    formClasses?: string;
}

const SearchBar = ({
    searchValue = SearchBarInitialValues,
    onSearch,
    initialToggleValue,
    toggleLabels,
    onToggle,
    onClear,
    className,
}: SearchBarProps) => {
    const { setShowFieldErrorMessage, setPolicySearchFilters, policySearchFilters } = useContext(PolicySearchFiltersContext);
    const { t } = useTranslation(TranslationFiles.COMMON);
    const getToggleLabel = useCallback(
        (targetVal: string) => {
            return toggleLabels(t).find(a => a.value === targetVal) as LabelValue<PolicySearchKeys>;
        },
        [t, toggleLabels]
    );

    const [values, setValues] = useState<SearchViewQuery>({});
    const [activeToggleBtn, setActiveToggleBtn] = useState(initialToggleValue);
    const [activeLabels, setActiveLabels] = useState(getToggleLabel(initialToggleValue));

    useEffect(() => {
        setValues(searchValue);
    }, [searchValue]);

    useEffect(() => {
        setActiveToggleBtn(initialToggleValue);
        setActiveLabels(getToggleLabel(initialToggleValue));
    }, [initialToggleValue, getToggleLabel]);

    const handleSearch = () => {
        const searchValue: SearchViewQuery = { [activeToggleBtn]: values[activeToggleBtn] };
        const activeToggle = getToggleLabel(activeToggleBtn);

        if (activeToggle.group) {
            activeToggle.group.forEach(group => {
                if (group.value) searchValue[group.value] = values[group.value];
            });
        }

        onSearch(searchValue);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSearch();
    };

    const handleNewValue = (e: ChangeEvent<HTMLInputElement>, value: string, key: PolicySearchKeys) => {
        setShowFieldErrorMessage(false); // reset field error message on change
        if (activeLabels?.value != 'firmName') {
            value = (value || '').trim();
        }
        setValues(prevValues => ({ ...prevValues, [key]: value || '' }));
    };

    const handleToggle = useCallback(
        (value: string) => {
            if (!value) {
                value = activeToggleBtn;
            }
            setActiveToggleBtn(value as PolicySearchKeys);
            setPolicySearchFilters({ ...policySearchFilters, toggleValue: value as PolicySearchKeys });
            setActiveLabels(getToggleLabel(value));

            if (onToggle) {
                onToggle(value as PolicySearchKeys);
            }
        },
        [activeToggleBtn, getToggleLabel, onToggle, policySearchFilters, setPolicySearchFilters]
    );

    const dropdownLabels = toggleLabels(t);

    return (
        <form className={clsx(styles.formContainer, className)} onSubmit={handleFormSubmit}>
            <div className={styles.searchContainer}>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger className={clsx(styles.dropdownTrigger, 'typography-content-body-sm whitespace-nowrap')}>
                        <label id="case-search-label">
                            <Typography variant={TypographyVariant.BodySm}>{activeLabels.label}</Typography>
                        </label>
                        <Icon type={IconType.CHEVRON} height={22} width={22} color="#00628B" />
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content className={styles.dropdownMenu}>
                            {dropdownLabels.map((item, index) => (
                                <DropdownMenu.Item
                                    className={styles.dropdownItem}
                                    key={`dropdown-item-${index}`}
                                    onSelect={() => handleToggle(item.value || '')}
                                >
                                    <Typography variant={TypographyVariant.BodySm}>{item.label}</Typography>
                                </DropdownMenu.Item>
                            ))}
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <SearchFieldToggle activeLabels={activeLabels} handleChange={handleNewValue} values={values} onClear={onClear} />
            </div>
            <Button
                mode="primary"
                onClick={handleSearch}
                data-testid="search-btn"
                aria-label={t('ariaLabel.search') as string}
                type="submit"
                size="small"
            >
                {t('dashboard.search.btnText')}
            </Button>
        </form>
    );
};

export default SearchBar;
