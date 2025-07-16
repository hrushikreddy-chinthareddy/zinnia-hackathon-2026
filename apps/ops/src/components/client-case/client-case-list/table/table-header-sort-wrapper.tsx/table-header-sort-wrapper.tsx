import { Icon, IconType, TableHeaderCell } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ReactNode, useState } from 'react';

import { useIllustrationsClientCase } from '@deps/contexts/illustrations/IllustrationsClientCaseContext';

import styles from './table-header-sort-wrapper.module.css';

interface TableHeaderSortWrapperProps {
    children: ReactNode;
    className?: string | undefined;
    collumnId: string;
}

const TableHeaderSortWrapper = ({
    children,
    className,
    collumnId,
}: TableHeaderSortWrapperProps) => {
    const { setFilters } = useIllustrationsClientCase();
    const tableHeaderClassNames = clsx(styles.tableHeader, className);
    const [asc, setAsc] = useState(true);

    const setSortBy = () => {
        const sortDir = asc ? 'ascending' : 'descending';
        setFilters({
            sortBy: collumnId,
            sortDir,
        });
        setAsc(!asc);
    };
    return (
        <TableHeaderCell
            className={tableHeaderClassNames}
            onClick={setSortBy}
            sortable
        >
            {children}
            <Icon type={IconType.SORT} color="#00628B" height={16} width={16} />
        </TableHeaderCell>
    );
};

export default TableHeaderSortWrapper;
