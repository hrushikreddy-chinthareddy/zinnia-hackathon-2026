import {
    TableHeaderCell,
    TableRow,
    TableHeader,
    Icon,
    IconType,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { TranslationFiles } from '@deps/config/translations';

import styles from './task-management-queue.module.css';
import { Column, ColumnId, ColumnIds } from './task-queue-columns';

type TaskQueueTableHeaderProps = {
    isOpsManagerView?: boolean;
    sortDirection?: string;
    visibleColumns?: Column<any>[];
    handleSort?: () => void;
};

enum SortingTypes {
    ASCENDING = 'ascending',
    DESCENDING = 'descending',
    NONE = 'none',
}

export enum SortingTypeValues {
    ASCENDING = 'asc',
    DESCENDING = 'desc',
    NONE = 'none',
}

const TaskQueueTableHeader = ({
    isOpsManagerView = false,
    visibleColumns,
    sortDirection,
    handleSort,
}: TaskQueueTableHeaderProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagementQueue',
    });
    const { t: tRaw } = useTranslation(TranslationFiles.COMMON);

    //Dynamic header for ops manager view
    useEffect(() => {
        if (!isOpsManagerView) return;
        if (typeof window === 'undefined') return;

        const selector = `.${styles.opsManagerTaskTable} thead .${styles.stickyTaskCol}`;

        const getHeaderCell = () =>
            document.querySelector(selector) as HTMLElement | null;

        const updateWidth = () => {
            const el = getHeaderCell();
            if (!el) return;

            const width = el.getBoundingClientRect().width;
            if (!width) return;

            const wrapper = el.closest(
                `.${styles.opsManagerTaskTable}`
            ) as HTMLElement | null;

            (wrapper ?? document.documentElement).style.setProperty(
                '--task-col-width',
                `${width}px`
            );
        };

        const el = getHeaderCell();
        if (!el) {
            return;
        }
        updateWidth();
        const RO =
            'ResizeObserver' in window
                ? new ResizeObserver(() => updateWidth())
                : null;

        if (RO) RO.observe(el);

        return () => {
            RO?.disconnect();
        };
    }, [isOpsManagerView]);

    const ARIA_SORT_MAP: Record<
        SortingTypeValues | SortingTypes.NONE,
        SortingTypes.ASCENDING | SortingTypes.DESCENDING | SortingTypes.NONE
    > = {
        [SortingTypeValues.ASCENDING]: SortingTypes.ASCENDING,
        [SortingTypeValues.DESCENDING]: SortingTypes.DESCENDING,
        [SortingTypeValues.NONE]: SortingTypes.NONE,
    };

    if (isOpsManagerView && visibleColumns?.length) {
        return (
            <TableHeader>
                <TableRow>
                    {/* match the overlay cell rendered in tbody: keeps header/body aligned */}
                    <TableHeaderCell className="sr-only">{''}</TableHeaderCell>

                    {visibleColumns.map((col) => {
                        const isCreated = col.id === ColumnIds.CreatedAt;

                        const extraClassMapper: Partial<
                            Record<ColumnId, string>
                        > = {
                            task: styles.stickyTaskCol,
                            status: styles.stickyStatusCol,
                        };

                        const extraClass: string =
                            extraClassMapper[col.id] || '';

                        return (
                            <TableHeaderCell
                                scope="col"
                                key={`hdr-${col.id}`}
                                className={extraClass || undefined}
                                sortable={isCreated}
                                aria-sort={
                                    isCreated && sortDirection
                                        ? ARIA_SORT_MAP[
                                              (sortDirection as SortingTypeValues) ??
                                                  SortingTypeValues.NONE
                                          ]
                                        : undefined
                                }
                                onClick={
                                    isCreated && handleSort
                                        ? handleSort
                                        : undefined
                                }
                            >
                                {extraClass && (
                                    <div className={styles.stickyBgLayer}></div>
                                )}
                                <div
                                    className={
                                        extraClass
                                            ? styles.stickyContent
                                            : undefined
                                    }
                                >
                                    <div className="flex">
                                        <Content
                                            details={
                                                (tRaw(col.label) as string) ||
                                                ''
                                            }
                                            variant={ContentVariant.BodySmBold}
                                        />
                                        {isCreated && sortDirection && (
                                            <Icon
                                                className="ml-1"
                                                type={
                                                    sortDirection ===
                                                    SortingTypeValues.ASCENDING
                                                        ? IconType.ARROW_UP
                                                        : IconType.ARROW_DOWN
                                                }
                                                color="var(--task-queue-sort-icon-color)"
                                            />
                                        )}
                                    </div>
                                </div>
                            </TableHeaderCell>
                        );
                    })}
                </TableRow>
            </TableHeader>
        );
    }

    //static header for non-ops manager view
    return (
        <TableHeader>
            <TableRow>
                {/* This header cell is needed so the link can come first in the Table Row, without it the table body will shift right one column too far */}
                <TableHeaderCell className="sr-only">{''}</TableHeaderCell>
                <TableHeaderCell>
                    <Content
                        details={t('task') as string}
                        variant={ContentVariant.BodySmBold}
                    />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content
                        details={t('status') as string}
                        variant={ContentVariant.BodySmBold}
                    />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content
                        details={t('carrierCase') as string}
                        variant={ContentVariant.BodySmBold}
                    />
                </TableHeaderCell>
                <TableHeaderCell colSpan={2}>
                    <Content
                        details={t('assignee') as string}
                        variant={ContentVariant.BodySmBold}
                    />
                </TableHeaderCell>
                <TableHeaderCell>
                    <div className="flex">
                        <Content
                            details={t('created') as string}
                            variant={ContentVariant.BodySmBold}
                        />
                    </div>
                </TableHeaderCell>
            </TableRow>
        </TableHeader>
    );
};

export default TaskQueueTableHeader;
