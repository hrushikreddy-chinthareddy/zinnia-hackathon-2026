import { Icon, IconType, TableHeaderCell } from '@zinnia/bloom/components';
import { type ReactNode } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';

type SortOrderValue = 'asc' | 'desc';

type SortableHeaderCellProps<TSortKey extends string> = {
    label: ReactNode;
    sortKey: TSortKey;
    activeSortKey: TSortKey | null;
    onSort: (sortKey: TSortKey) => void;
    sortOrder: SortOrderValue;
};

export const SortableHeaderCell = <TSortKey extends string>({
    label,
    sortKey,
    activeSortKey,
    onSort,
    sortOrder,
}: SortableHeaderCellProps<TSortKey>) => (
    <TableHeaderCell onClick={() => onSort(sortKey)} sortable>
        <div className={sharedStyles.sortableHeaderContent}>
            {label}
            {activeSortKey === sortKey && (
                <Icon
                    type={
                        sortOrder === 'asc'
                            ? IconType.ARROW_UP
                            : IconType.ARROW_DOWN
                    }
                    color="var(--color-toast-toast-text)"
                    width={16}
                />
            )}
        </div>
    </TableHeaderCell>
);
