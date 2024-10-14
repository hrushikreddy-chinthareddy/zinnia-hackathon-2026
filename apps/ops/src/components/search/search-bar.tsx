import { TFunction, useTranslation } from 'next-i18next';
import { ChangeEvent, RefObject, useCallback, useContext, useEffect, useState } from 'react';

import Button, { ButtonType } from '@deps/components/button/button';
import ButtonGroup from '@deps/components/button-group/button-group';
import { TranslationFiles } from '@deps/config/translations';
import { PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

import SearchFieldToggle from './search-field-toggle/search-field-toggle';

export const SearchBarInitialValues: SearchViewQuery = {};

interface SearchBarProps {
    searchValue: SearchViewQuery;
    onSearch: (value: SearchViewQuery) => void;
    initialToggleValue: PolicySearchKeys;
    toggleLabels: (t: TFunction) => LabelValue<PolicySearchKeys>[];
    onToggle?: (value: PolicySearchKeys) => void;
    onClear?: (ref: RefObject<HTMLInputElement>) => void;
}

const SearchBar = ({
    searchValue = SearchBarInitialValues,
    onSearch,
    initialToggleValue,
    toggleLabels,
    onToggle,
    onClear,
}: SearchBarProps) => {
    const { setShowFieldErrorMessage } = useContext(PolicySearchFiltersContext);
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
        setValues(prevValues => ({ ...prevValues, [key]: (value || '').trim() }));
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

    return (
        <form className="flex flex-col items-start gap-4 sm:w-[492px] xl:w-full xl:flex-row" onSubmit={handleFormSubmit}>
            <div className="leading-[18px] sm:w-[492px]">
                <ButtonGroup
                    isFullWidth
                    activeValue={activeToggleBtn}
                    toggle={handleToggle}
                    labels={toggleLabels(t)}
                    groupLabel={t('dashboard.search.searchKeyType')}
                />
            </div>
            <div className="flex w-full grow items-end gap-4">
                <SearchFieldToggle
                    values={values}
                    activeLabels={activeLabels}
                    handleEnterKey={handleSearch}
                    handleChange={handleNewValue}
                    onClear={onClear}
                />
            </div>
            <div className="self-center xl:mt-5 xl:self-baseline">
                <Button type={ButtonType.Primary} onClick={handleSearch} data-testid="search-btn" aria-label={t('ariaLabel.search') as string}>
                    {t('dashboard.search.btnText')}
                </Button>
            </div>
        </form>
    );
};

export default SearchBar;
