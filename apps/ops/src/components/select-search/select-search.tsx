import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuid4 } from 'uuid';

import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import NavElement, { NavElementType } from '@deps/components/nav-element/nav-element';
import SelectSearchItem from '@deps/components/select-search/select-search-item/select-search-item';
import { TranslationFiles } from '@deps/config/translations';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { filterOnSearchHandler } from '@deps/helpers/search.helper';
import { useOutsideClick } from '@deps/hooks/useOutsideClick';
import { ReactComponent as ChevronIcon } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { DataDefinition } from '@deps/types/data';
import useDebounce from '@deps/utils/useDebounce';

import SelectSearchGroupContainer from './select-search-group-container/select-search-group-container';
import { getInputClasses, getLabelClasses } from './select-search.helper';

interface SelectFieldProps {
    label?: string;
    errorMessageLink?: string;
    errorMessage?: JSX.Element;
    variant?: FieldVariant;
    size?: FieldSize;
    placeHolder?: string;
    classNames?: string;
    labelClassNames?: string;
    values: DataDefinition<any>[];
    group?: boolean;
    value?: any;
    dropUp?: boolean;
    segmentTrackName?: string;
    userPartyId?: string;
}

interface SelectFieldPopupContainerProps {
    values?: DataDefinition<any>[];
    group?: boolean;
    hasSearchValue?: boolean;
    errorMessage?: JSX.Element;
    dropUp?: boolean;
}

const SelectFieldPopupContainer = ({
    values = [],
    group = false,
    errorMessage = <></>,
    hasSearchValue = false,
    dropUp = false,
}: SelectFieldPopupContainerProps): JSX.Element => {
    let fields = null;
    let container = null;
    let containerClasses = 'max-h-[288px] h-fit overflow-y-scroll first:[&>div]:border-t-2 first:[&>div]:border-gray-900 z-50';

    if (values.length > 0) {
        if (group) {
            fields = <SelectSearchGroupContainer values={values} />;
        } else {
            fields = values.map(({ value, label }, index) => (
                <SelectSearchItem key={'select-search-item-' + index} fieldLabel={label} data={value?.toString()} />
            ));
        }

        container = fields;
    } else if (values.length === 0 && hasSearchValue) {
        container = <div className={'mt-[2px] px-4 py-2 text-[14px]'}>{errorMessage}</div>;

        containerClasses = 'h-auto';
    }

    return (
        <div
            className={`${dropUp ? 'bottom-[48px]' : 'top-[48px]'} absolute z-10 w-full rounded-lg bg-white shadow-xl ${containerClasses}`}
        >
            {container}
        </div>
    );
};

const SelectSearch = ({
    variant = FieldVariant.Default,
    size = FieldSize.Default,
    placeHolder = 'Highest percentage completed',
    label,
    errorMessageLink,
    errorMessage,
    classNames,
    labelClassNames,
    values,
    group,
    value,
    dropUp,
    segmentTrackName,
    userPartyId,
}: SelectFieldProps) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(value ? value : '');
    const [searchResults, setSearchResults] = useState(values);
    const [isSelected, setIsSelected] = useState(false);
    const { t } = useTranslation(TranslationFiles.COMMON);
    const labelId = uuid4();

    const ref = useRef<HTMLInputElement>(null);

    // TODO MG: useCallback or useMemo?
    const onOutsideClick = () => {
        if (!segmentTrackName) {
            return;
        }
        segmentAnalyticsTrackEvent(segmentTrackName, {
            searchText: searchValue,
            userId: userPartyId,
        });
    };
    useOutsideClick(ref, open, setOpen, onOutsideClick);

    const debouncedSearchValue = useDebounce(searchValue, 300);

    useEffect(() => {
        if (debouncedSearchValue) {
            setSearchResults(filterOnSearchHandler(values, { searchValue: debouncedSearchValue }));
            setOpen(true);
        } else {
            setSearchResults(values);
        }
    }, [debouncedSearchValue]);

    const mergedLabelClassNames = getLabelClasses(variant, `font-primary font-bold text-[12px] leading-4.5 ${labelClassNames}`);

    const inputClassNames = getInputClasses(
        variant,
        size,
        'flex self-center gap-4 rounded-md justify-center [&>p]:w-[254px] [&>p]:h-[22px] [&>p]:font-secondary [&>p]:text-[14px] [&>*]:self-center [&>div>svg]:w-[22px] focus-within:outline focus-within:outline-2 focus-within:outline-semantic-focus focus-within:outline-offset-8 focus-within:outline-offset-color-inherit',
        debouncedSearchValue.length > 0 || open || isSelected
    );

    errorMessage = (
        <div className="font-secondary">
            <b>{t('dashboard.quickSearch.errorMessage.question')}</b>{' '}
            <NavElement type={NavElementType.Link} className="font-primary text-md" href={errorMessageLink}>
                {t('dashboard.quickSearch.errorMessage.navlink')}
            </NavElement>{' '}
            {t('dashboard.quickSearch.errorMessage.message')}
        </div>
    );

    const popupSelection = (
        <SelectFieldPopupContainer
            values={searchResults}
            group={group}
            errorMessage={errorMessage}
            hasSearchValue={debouncedSearchValue.length > 0}
            dropUp={dropUp}
        />
    );

    const handleSelect = useCallback(
        (select = false) => {
            setIsSelected(select);
        },
        [isSelected, searchValue]
    );

    return (
        <div className={classNames}>
            <label htmlFor={labelId} className={mergedLabelClassNames}>
                {label}
            </label>

            <div className="relative" ref={ref} onFocus={() => handleSelect(true)} onBlur={() => handleSelect(false)}>
                <div className="bg-transparent">
                    <div className={inputClassNames}>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={event => setSearchValue(event.target.value)}
                            className="w-full border-none bg-transparent pl-4 font-secondary text-md font-normal leading-5.5 shadow-none placeholder:text-gray-300 focus-visible:ring-0"
                            placeholder={placeHolder}
                            id={labelId}
                            aria-label={label}
                        />
                        <button className="py-2 pr-4" onClick={() => setOpen(!open)}>
                            <ChevronIcon
                                className={'simple-transition default-focus-icons h-6 w-6 text-secondary ' + (open ? 'flip180' : '')}
                                aria-label={`${t('ariaLabel.findKeyValuesIcon')} ${label}`}
                            />
                            <span className="sr-only">{t(`site.controlActions.${open ? 'close' : 'open'}`)}</span>
                            <span className="sr-only">{label}</span>
                        </button>
                    </div>
                </div>
                {open && popupSelection}
            </div>
        </div>
    );
};

export default SelectSearch;
