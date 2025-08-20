import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@zinnia/bloom/components';
import clsx from 'clsx';

export type PomTableRow<T> =
  | Record<keyof T, React.ReactNode | React.ReactNode[]>
  | PomTableRow<T>[];
export type PomTableProps<T> = {
  headers: Record<keyof T, React.ReactNode>;
  rows: PomTableRow<T>[];
  emptyRowMessage?: string;
};

const createExpandedContent = <T,>(rows: PomTableRow<T>[]) => {
  return rows.map(row => {
    return (
      <TableRow>
        {Object.entries(row).map(([key, value]) => {
          return <TableCell key={key}>{value}</TableCell>;
        })}
      </TableRow>
    );
  });
};

const PomTable = <T,>({
  rows,
  headers,
  emptyRowMessage = 'No data',
}: PomTableProps<T>) => {
  const tableRows = Object.entries<PomTableRow<T> | PomTableRow<T>[]>(rows);
  const headerLabels = Object.entries<React.ReactNode>(headers);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headerLabels.map(([key, columnLabel], index) => {
            return (
              <TableHeaderCell
                key={key + '-' + index}
                className="typography-content-body-sm-b"
              >
                {columnLabel}
              </TableHeaderCell>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableRows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={headerLabels.length}>
              {emptyRowMessage}
            </TableCell>
          </TableRow>
        ) : (
          tableRows.map(([key, row]) => {
            // if row is an array, then it's expandable
            const shouldExpand = Array.isArray(row) && row.length > 1;

            // init variables for current row  and expanded content as undefined
            // we do not know whether row is expandable yet
            let currentRow: [string, React.ReactNode][];
            let expandedContent;

            // if row is an array, then it's expandable
            if (Array.isArray(row) && shouldExpand) {
              // split the row into the first row and the rest
              // so we can render first row
              const [firstRow, ...rest] = row;

              // create expanded content
              expandedContent = createExpandedContent(rest);

              // set current row to first row
              // so we can render it as if it was a normal row
              currentRow = Object.entries(firstRow);
            } else {
              currentRow = Object.entries(row);
            }
            return (
              <TableRow
                key={key}
                expandedContent={expandedContent}
                isExpandable={shouldExpand}
                showChevron={shouldExpand}
              >
                {currentRow.map(([key, value]) => {
                  return (
                    <TableCell
                      // if there is no specific formatting for the value,
                      // then apply typography-content-body-sm
                      className={clsx(
                        typeof value === 'string' &&
                          'typography-content-body-sm'
                      )}
                      key={key}
                    >
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default PomTable;
