import { ReactComponent as DownIcon } from '@deps/styles/elements/icons/arrow/direction-down.svg';
import { ReactComponent as UpIcon } from '@deps/styles/elements/icons/arrow/direction-up.svg';

import { ColumnType, SortOrderColumn, TableColumn } from './table.types';
import InputCheckBox from '../checkbox-v2/input-checkbox';

type TableHeaderProps = {
    columns: TableColumn[];
    handleSort: (column: string) => void;
    allRowsSelected: boolean;
    setAllRowsSelected: (allRowsSelected: boolean) => void;
    sortOrderColumn: SortOrderColumn;
};

const TableHeader = ({
    columns,
    handleSort,
    sortOrderColumn,
    allRowsSelected,
    setAllRowsSelected,
}: TableHeaderProps) => {
    const getColumnHeader = (column: TableColumn): string | JSX.Element => {
        if (column.type === ColumnType.Boolean) {
            return (
                <InputCheckBox
                    checked={allRowsSelected}
                    onChange={() => setAllRowsSelected(!allRowsSelected)}
                />
            );
        }
        return column.headerName ?? '';
    };

    return (
        <thead>
            <tr className="body-sm h-10 bg-gray-50 font-medium text-gray-900">
                {columns.map((column) => {
                    const icon =
                        sortOrderColumn.order === 'asc' ? (
                            <UpIcon
                                className="text-secondary"
                                height={16}
                                width={16}
                            />
                        ) : (
                            <DownIcon
                                className="text-secondary"
                                height={16}
                                width={16}
                            />
                        );
                    return (
                        <th
                            key={column.field}
                            className={`cursor-pointer px-6 py-2  hover:bg-gray-100`}
                            style={{ width: column?.width }}
                            onClick={() => {
                                if (
                                    column.type !== ColumnType.Boolean &&
                                    column?.sortable
                                ) {
                                    handleSort(column.field);
                                }
                            }}
                        >
                            <div className="flex items-center">
                                {getColumnHeader(column)}{' '}
                                {column.field === sortOrderColumn.column &&
                                    icon}
                            </div>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
};

export default TableHeader;
