import { useMemo, useState } from 'react';

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

interface UseTableOptionsArgs<T> {
    sortByDefault: string;
    defaultSortOrder?: SortOrder;
    dataToSort: T[];
}

export const useTableOptions = <T>({ sortByDefault, dataToSort, defaultSortOrder }: UseTableOptionsArgs<T>) => {
    const [sortOrder, setSortOrder] = useState(defaultSortOrder ?? SortOrder.DESC);
    const [sortBy, setSortBy] = useState(sortByDefault as keyof T);

    const handleSort = (column: keyof T) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
        } else {
            setSortBy(column);
            setSortOrder(SortOrder.ASC);
        }
    };

    const sortedData = useMemo(() => {
        return [...dataToSort].sort((a, b) => {
            //If we're sorting numbers...
            if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
                return sortOrder === SortOrder.ASC ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
            }
            // else sort alphabetically
            else if (typeof a[sortBy] === 'string' && typeof b[sortBy] === 'string') {
                return sortOrder === SortOrder.ASC ? a[sortBy].localeCompare(b[sortBy]) : b[sortBy].localeCompare(a[sortBy]);
            } else {
                //Default to comparing everything to strings if we none of the above works
                return sortOrder === SortOrder.ASC
                    ? String(a[sortBy]).localeCompare(String(b[sortBy]))
                    : String(b[sortBy]).localeCompare(String(a[sortBy]));
            }
        });
    }, [dataToSort, sortBy, sortOrder]);

    return { sortBy, sortOrder, handleSort, sortedData };
};
