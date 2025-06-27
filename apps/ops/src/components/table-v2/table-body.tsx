import { ColumnType, TableColumn, TypedRow } from './table.types';
import InputCheckBox from '../checkbox-v2/input-checkbox';

type TableBodyProps<T> = {
    data: T[];
    columns: TableColumn[];
    bodyCellClass?: string;
    handleCellChange: (
        value: string | boolean,
        row: TypedRow<T>,
        column?: TableColumn
    ) => void;
};

const TableBody = <T,>({
    data,
    columns,
    handleCellChange,
    bodyCellClass,
}: TableBodyProps<T>) => {
    const formatData = (
        value: TypedRow<T>[string] = '',
        row: TypedRow<T>,
        column: TableColumn
    ) => {
        // Placeholder function if we want to do any operation to format data based on colmun type and config
        if (typeof value === 'function') {
            return value({
                data: row,
                ...column.cellRendererParams,
            });
        }
        return value.toString();
    };

    return (
        <tbody>
            {data.map((row, idx) => {
                const typedRow = row as TypedRow<T>;

                return (
                    <tr
                        key={idx}
                        className="border-b border-gray-200 bg-white first:border-t hover:bg-gray-50"
                    >
                        {columns.map((column) => {
                            if (column?.type === ColumnType.Boolean) {
                                return (
                                    <td
                                        key={column.field}
                                        className={`px-6 ${bodyCellClass}`}
                                    >
                                        <InputCheckBox
                                            key={column.field}
                                            checked={typedRow.check}
                                            onChange={() => {
                                                if (column?.editable) {
                                                    handleCellChange(
                                                        !typedRow.check,
                                                        typedRow
                                                    );
                                                }
                                            }}
                                        />
                                    </td>
                                );
                            }
                            if (column.editable) {
                                return (
                                    <td
                                        key={column.field}
                                        className={`${bodyCellClass}`}
                                    >
                                        <input
                                            type="text"
                                            value={formatData(
                                                typedRow[column.field],
                                                typedRow,
                                                column
                                            )}
                                            onChange={(e) =>
                                                handleCellChange(
                                                    e.target.value,
                                                    typedRow,
                                                    column
                                                )
                                            }
                                        />
                                    </td>
                                );
                            }

                            return (
                                <td
                                    key={column.field}
                                    className={`truncate px-6 ${bodyCellClass}`}
                                >
                                    {formatData(
                                        typedRow[column.field],
                                        typedRow,
                                        column
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
        </tbody>
    );
};

export default TableBody;
