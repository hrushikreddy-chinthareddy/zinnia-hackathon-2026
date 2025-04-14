import {
  Label,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';

import ActionCellRenderer from './action-cell-renderer';
import { TasksTableProps } from './task-listing.types';
import styles from './tasks-table.module.css';
export default function TasksTable({
  t,
  config,
  tasks
}: TasksTableProps) {
  const limit = 5;
  const [offset, setOffset] = useState(0);
  const goToPage = useCallback(
    (pageNumber: number) => {
      window.scroll(0, 0);
      setOffset((pageNumber - 1) * limit);
    },
    [setOffset]
  );

  const paginatedTasks = useMemo(() => {
    return tasks?.slice(offset, offset + limit);
  }, [offset, limit, tasks]);

  return (
    <>
        <div data-testid="task-list-container" className='p-4'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell><Label>{t('tasksListing.tableColumns.status')}</Label></TableHeaderCell>
                        <TableHeaderCell><Label>{t('tasksListing.tableColumns.taskId')}</Label></TableHeaderCell>
                        <TableHeaderCell><Label>{t('tasksListing.tableColumns.statusDuration')}</Label></TableHeaderCell>
                        <TableHeaderCell><Label>{t('tasksListing.tableColumns.dateTime')}</Label></TableHeaderCell>
                        <TableHeaderCell><Label>{t('tasksListing.tableColumns.userId')}</Label></TableHeaderCell>
                        <TableHeaderCell><Label>{t('tasksListing.tableColumns.actions')}</Label></TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody className={clsx('typography-content-body-sm', styles.tableBody)}>
                    {paginatedTasks?.map(task => {
                        if (!task) return null;

                        return(
                            <TableRow key={`task-${task.taskId}`}>
                                <TableCell className="typography-content-body-sm">{task.status}</TableCell>
                                <TableCell className="typography-content-body-sm">{task.taskId}</TableCell>
                                <TableCell className="typography-content-body-sm">{task.statusDuration}</TableCell>
                                <TableCell className="typography-content-body-sm">{task.taskDate}</TableCell>
                                <TableCell className="typography-content-body-sm">{task.userId}</TableCell>
                                <TableCell className="typography-content-body-sm">
                                    <ActionCellRenderer data={task} actionParams={config.actionCellParams} />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            {tasks && tasks.length > limit && (
                <div className="mx-auto p-2 float-right">
                  <Pagination total={tasks.length} offset={offset} limit={limit} goToPage={goToPage} />
                </div>
            )}
        </div>
    </>
  );
};
