import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { TFunction, useTranslation } from 'next-i18next';
import { HTMLAttributes, useCallback, useEffect, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

import styles from './search-bar.module.css';
import Typography, { TypographyVariant } from '../typography/typography';
import SearchField from './search-field/search-field';

export const SearchBarInitialValues: SearchViewQuery = {};

interface SearchBarProps
    extends Omit<HTMLAttributes<HTMLInputElement>, 'onToggle'> {
    searchValue: SearchViewQuery;
    onSearch: (value: SearchViewQuery) => void;
    initialToggleValue: PolicySearchKeys;
    toggleLabels: (t: TFunction) => LabelValue<PolicySearchKeys>[];
    onToggle?: (value: PolicySearchKeys) => void;
    onClear?: (searchField: PolicySearchKeys | undefined) => void;
    formClasses?: string;
    handleError?: (bool: boolean) => void;
    disabled?: boolean;
    onChangeCallback?: (value: string, key: PolicySearchKeys) => void;
    hasLegend?: boolean;
}

const SearchBar = ({
    searchValue = SearchBarInitialValues,
    onSearch,
    initialToggleValue,
    toggleLabels,
    onToggle,
    onClear,
    className,
    handleError,
    disabled = false,
    onChangeCallback,
    hasLegend = true,
}: SearchBarProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const getToggleLabel = useCallback(
        (targetVal: string) => {
            return toggleLabels(t).find(
                (a) => a.value === targetVal
            ) as LabelValue<PolicySearchKeys>;
        },
        [t, toggleLabels]
    );

    const [values, setValues] = useState<SearchViewQuery>({});
    const [activeToggleBtn, setActiveToggleBtn] = useState(initialToggleValue);
    const [activeLabels, setActiveLabels] = useState(
        getToggleLabel(initialToggleValue)
    );

    useEffect(() => {
        setValues(searchValue);
    }, [searchValue]);

    useEffect(() => {
        setActiveToggleBtn(initialToggleValue);
        setActiveLabels(getToggleLabel(initialToggleValue));
    }, [initialToggleValue, getToggleLabel]);

    const handleSearch = () => {
        const searchValue: SearchViewQuery = {
            [activeToggleBtn]: values[activeToggleBtn],
        };
        const activeToggle = getToggleLabel(activeToggleBtn);

        if (activeToggle.group) {
            activeToggle.group.forEach((group) => {
                if (group.value) searchValue[group.value] = values[group.value];
            });
        }

        onSearch(searchValue);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    const handleChange = (value: string, key: PolicySearchKeys) => {
        handleError?.(false); // reset field error message on change
        onChangeCallback?.(value, key);
        setValues((prevValues) => ({ ...prevValues, [key]: value || '' }));
    };

    const handleToggle = useCallback(
        (value: string) => {
            if (!value) {
                value = activeToggleBtn;
            }
            setActiveToggleBtn(value as PolicySearchKeys);

            setActiveLabels(getToggleLabel(value));

            if (onToggle) {
                onToggle(value as PolicySearchKeys);
            }
        },
        [activeToggleBtn, getToggleLabel, onToggle]
    );

    const dropdownLabels = toggleLabels(t);

    return (
        <form
            className={clsx(styles.formContainer, className)}
            onSubmit={handleFormSubmit}
            id="search-form"
        >
            <fieldset>
                {hasLegend && (
                    <legend>
                        <label
                            htmlFor="search-by-dropdown"
                            className="typography-labels-field-label mb-1"
                        >
                            {t('caseManagementDashboard.search.searchKeyType')}
                        </label>
                    </legend>
                )}
                <div className={styles.searchRow}>
                    <div className={styles.searchContainer}>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger
                                id="search-by-dropdown"
                                className={clsx(
                                    styles.dropdownTrigger,
                                    'typography-content-body-sm whitespace-nowrap'
                                )}
                                role="combobox"
                                aria-controls="filter-dropdown"
                            >
                                <label id="case-search-label">
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                    >
                                        {activeLabels.label}
                                    </Typography>
                                </label>
                                <Icon
                                    type={IconType.CHEVRON}
                                    height={22}
                                    width={22}
                                    color="#00628B"
                                />
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                    className={styles.dropdownMenu}
                                    id="filter-dropdown"
                                    role="listbox"
                                    aria-label={
                                        t(
                                            'caseManagementDashboard.search.searchKeyType'
                                        ) || 'Search by'
                                    }
                                >
                                    {dropdownLabels.map((item, index) => (
                                        <DropdownMenu.Item
                                            className={styles.dropdownItem}
                                            key={`dropdown-item-${index}`}
                                            onSelect={() =>
                                                handleToggle(item.value || '')
                                            }
                                        >
                                            <Typography
                                                variant={
                                                    TypographyVariant.BodySm
                                                }
                                            >
                                                {item.label}
                                            </Typography>
                                        </DropdownMenu.Item>
                                    ))}
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                        <SearchField
                            activeLabels={activeLabels}
                            values={values}
                            onClear={onClear}
                            onChange={handleChange}
                        />
                    </div>
                    <Button
                        className="md:mt-1"
                        mode="primary"
                        onClick={handleSearch}
                        data-testid="search-btn"
                        aria-label={t('ariaLabel.search') as string}
                        type="submit"
                        size="small"
                        disabled={disabled}
                    >
                        {t('dashboard.search.btnText')}
                    </Button>
                </div>
            </fieldset>
        </form>
    );
};

export default SearchBar;
