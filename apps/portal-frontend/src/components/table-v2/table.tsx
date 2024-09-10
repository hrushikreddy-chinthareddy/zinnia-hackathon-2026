import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import TableBody from './table-body';
import TableHeader from './table-header';
import TablePagination from './table-pagination';
import { SortOrderColumn, TableColumn, TypedRow } from './table.types';

export const PAGE_SIZE = 5;

export type TableProps<T> = {
    data: TypedRow<T>[];
    columns: TableColumn[];
    disablePagination?: boolean;
    bodyCellClass?: string;
    onCellChange?: (data: TypedRow<T>) => void;
    onAllRowsSelected?: (allRowsSelected: boolean) => void;
};

// TODO MG: depreciate this in favor of bloom table
const Table = <T,>({ data, columns, onAllRowsSelected, disablePagination = true, bodyCellClass, onCellChange }: TableProps<T>) => {
    const [localData, setLocalData] = useState<TypedRow<T>[]>(data);
    const [allRowsSelected, setAllRowsSelected] = useState(data.every(obj => obj.check === true));
    const [sortOrderColumn, setSortOrderColumn] = useState<SortOrderColumn>({ column: 'id', order: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = disablePagination ? data.length : PAGE_SIZE;

    const handleSort = (column: string) => {
        if (sortOrderColumn.order === 'asc') setSortOrderColumn({ column, order: 'desc' });
        else setSortOrderColumn({ column, order: 'asc' });
    };

    const getPagedData = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return localData.slice(startIndex, endIndex);
    };

    const handleCellChange = (value: string | boolean, row: TypedRow<T>) => {
        const updatedRow = { ...row, check: value };
        if (onCellChange) {
            onCellChange(updatedRow);
        }
        setLocalData(prevData => prevData.map(item => (item.id === row.id ? updatedRow : item)));
    };

    const handleAllRowsSelected = (allRowsSelected: boolean) => {
        setAllRowsSelected(allRowsSelected);
        if(onAllRowsSelected) {
            onAllRowsSelected(allRowsSelected);
        }
        setLocalData(prevData => prevData.map(item => ({ ...item, check: allRowsSelected })));
    };

    useEffect(() => {
        const sortData = (data: TypedRow<T>[], column: string, order: 'asc' | 'desc') => {
            return data.slice().sort((a, b) => {
                if (typeof a[column] === 'string') {
                    return order === 'asc' ? a[column].localeCompare(b[column]) : b[column].localeCompare(a[column]);
                } else if (typeof a[column] === 'number') {
                    return order === 'asc' ? a[column] - b[column] : b[column] - a[column];
                }
                return 0;
            });
        };
        const sortedData = sortData(data, sortOrderColumn.column, sortOrderColumn.order);
        setLocalData(prevState => (prevState === sortedData ? prevState : sortedData));
    }, [sortOrderColumn, data]);

    useEffect(() => {
        const isAllRowSelected = localData.every(obj => obj.check === true);
        setAllRowsSelected(isAllRowSelected);
    }, [localData]);

    const paginatedData = getPagedData() || [];

    return (
        <div className={clsx(`w-auto overflow-x-auto rounded-lg border border-gray-200 shadow-sm`)}>
            <table className="body-sm w-full table-fixed text-left">
                <TableHeader
                    allRowsSelected={allRowsSelected}
                    setAllRowsSelected={handleAllRowsSelected}
                    columns={columns}
                    handleSort={handleSort}
                    sortOrderColumn={sortOrderColumn}
                />
                <TableBody bodyCellClass={bodyCellClass} data={paginatedData} columns={columns} handleCellChange={handleCellChange} />
            </table>
            {!disablePagination && (
                <TablePagination total={data.length} currentPage={currentPage} setCurrentPage={setCurrentPage} pageSize={pageSize} />
            )}
        </div>
    );
};

export default Table;
