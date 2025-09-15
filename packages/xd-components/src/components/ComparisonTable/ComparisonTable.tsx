import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
} from '@zinnia/bloom/components';
import styles from './ComparisonTable.module.css';
import { ComparisonTableProps } from './types';
import clsx from 'clsx';
import { ComparisonField } from './ComparisonField';

export const ComparisonTable = ({
  newValueHeader,
  currentValueHeader,
  data,
}: ComparisonTableProps) => {
  const renderHeaders = () =>
    [newValueHeader, currentValueHeader].map((header, index) => (
      <TableHeaderCell key={index}>{header}</TableHeaderCell>
    ));

  const renderRows = () =>
    Object.values(data).map(
      ({ label, newValue, currentValue, onEdit, isNew }, idx) => (
        <TableRow key={idx}>
          <TableCell>
            <ComparisonField header={label} onEdit={onEdit} />
          </TableCell>
          <TableCell>
            <ComparisonField subtext={newValue} isNew={isNew} />
          </TableCell>
          {currentValue && (
            <TableCell>
              <ComparisonField subtext={currentValue} />
            </TableCell>
          )}
        </TableRow>
      )
    );

  return (
    <div className={styles.tableContainer}>
      <Table
        className={clsx(styles.tableWrapper, styles.desktopView)}
        preventBackgroundHoverInteraction
      >
        <TableHeader>
          <TableRow>
            <TableHeaderCell />
            {renderHeaders()}
          </TableRow>
        </TableHeader>
        <TableBody>{renderRows()}</TableBody>
      </Table>
    </div>
  );
};
