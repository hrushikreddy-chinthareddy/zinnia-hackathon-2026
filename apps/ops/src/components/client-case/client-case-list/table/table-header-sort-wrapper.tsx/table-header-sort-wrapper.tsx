import { Icon, IconType, TableHeaderCell } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useState } from 'react';

import { useIllustrationsClientCase } from '@deps/contexts/illustrations/IllustrationsClientCaseContext';

import styles from './table-header-sort-wrapper.module.css';

interface TableHeaderSortWrapperProps {
    children: ReactNode;
    className?: string | undefined;
    columnId: string;
}

const TableHeaderSortWrapper = ({
    children,
    className,
    columnId,
}: TableHeaderSortWrapperProps) => {
    const { setFilters } = useIllustrationsClientCase();
    const tableHeaderClassNames = clsx(styles.tableHeader, className);
    const [asc, setAsc] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const searchParams = useSearchParams();

    const activeColumn = searchParams.get('sortBy');
    const isActive = activeColumn === columnId;

    useEffect(() => {
        if (isActive) {
            setAsc(searchParams.get('sortDir') === 'ascending');
        }
    }, [isActive, searchParams]);

    const handleSort = useCallback(() => {
        const nextAsc = isActive ? !asc : true;
        setAsc(nextAsc);
        setFilters({
            sortBy: columnId,
            sortDir: nextAsc ? 'ascending' : 'descending',
        });
    }, [isActive, asc, columnId, setFilters]);

    return (
        <TableHeaderCell
            className={tableHeaderClassNames}
            onClick={handleSort}
            sortable
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            {isHovered && !isActive && (
                <Icon
                    type={IconType.SORT}
                    color="#00628B"
                    height={16}
                    width={16}
                />
            )}
            {isActive && (
                <Icon
                    type={asc ? IconType.ARROW_UP : IconType.ARROW_DOWN}
                    color="#00628B"
                    height={16}
                    width={16}
                />
            )}
            {!isActive && !isHovered && (
                <div className={styles.tablePlaceholder}></div>
            )}
        </TableHeaderCell>
    );
};

export default TableHeaderSortWrapper;
