import { sort as sortFunc } from '@deps/helpers/sort.helpers';
import { ReactComponent as CashIcon } from '@deps/styles/elements/icons/icons_outlined/cash.svg';
import { ReactComponent as ClipboardList } from '@deps/styles/elements/icons/icons_outlined/clipboard-list.svg';
import { ReactComponent as CurrencyDollarsIcon } from '@deps/styles/elements/icons/icons_outlined/currency-dollar.svg';
import { ReactComponent as FinanceIcon } from '@deps/styles/elements/icons/icons_outlined/finance.svg';
import { ReactComponent as NewspaperIcon } from '@deps/styles/elements/icons/icons_outlined/newspaper.svg';
import { ReactComponent as ShieldExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/shield-exclamation.svg';
import { DataDefinition, KeyObjectDef } from '@deps/types/data';
import { SearchParams } from '@deps/types/search';

export const filterOnSearchHandler = <T extends object>(data: DataDefinition<T>[], params?: SearchParams) => {
    if (!data || !data.length) return data;
    if (!params) return data;

    const { searchValue = '', operation = 'partial', sort = '', order = 'desc' } = params;

    let filteredResults = data;

    if (searchValue) {
        filteredResults = data.filter(({ label }) => {
            switch (operation) {
                case 'partial':
                    return label?.toString().toLocaleLowerCase().includes(searchValue.toLocaleLowerCase());
                default:
                case 'equals':
                    return label?.toString().toLocaleLowerCase() === searchValue.toLocaleLowerCase();
            }
        });
    }

    if (sort) {
        filteredResults = filteredResults.sort(sortFunc);
    }

    if (order && order === 'asc') {
        filteredResults = filteredResults.reverse();
    }

    return filteredResults;
};

export const groupValues = (list: KeyObjectDef[], key: string) =>
    list.reduce((hash, obj) => ({ ...hash, [obj[key]]: (hash[obj[key]] || []).concat(obj) }), {});

export const mapGroupToIcon = (group: string) => {
    switch (group) {
        case 'loans':
            return FinanceIcon;
        case 'pending_lapse':
            return ShieldExclamationIcon;
        case 'policy_details':
            return NewspaperIcon;
        case 'premium':
            return CurrencyDollarsIcon;
        case 'withdrawals':
            return CashIcon;
        case 'funds':
            return ClipboardList;
        default:
            return NewspaperIcon;
    }
};
