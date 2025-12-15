import {
    TableHeaderCell,
    TableRow,
    TableHeader,
    Icon,
    IconType,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { TranslationFiles } from '@deps/config/translations';

type TaskQueueTableHeaderProps = {
    isOpsManagerView?: boolean;
    sortDirection?: string;
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
    sortDirection,
    handleSort,
}: TaskQueueTableHeaderProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagementQueue',
    });

    const ARIA_SORT_MAP: Record<
        SortingTypeValues | SortingTypes.NONE,
        SortingTypes.ASCENDING | SortingTypes.DESCENDING | SortingTypes.NONE
    > = {
        [SortingTypeValues.ASCENDING]: SortingTypes.ASCENDING,
        [SortingTypeValues.DESCENDING]: SortingTypes.DESCENDING,
        [SortingTypeValues.NONE]: SortingTypes.NONE,
    };

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
                <TableHeaderCell
                    scope="col"
                    aria-sort={
                        ARIA_SORT_MAP[sortDirection as SortingTypeValues]
                    }
                    sortable={isOpsManagerView}
                    onClick={isOpsManagerView ? handleSort : undefined}
                >
                    <div className="flex">
                        <Content
                            details={t('created') as string}
                            variant={ContentVariant.BodySmBold}
                        />
                        {isOpsManagerView && sortDirection && (
                            <Icon
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
                </TableHeaderCell>
                {isOpsManagerView ? (
                    <>
                        <TableHeaderCell>
                            <Content
                                details={t('lastUpdated') as string}
                                variant={ContentVariant.BodySmBold}
                            />
                        </TableHeaderCell>
                    </>
                ) : (
                    <></>
                )}
            </TableRow>
        </TableHeader>
    );
};

export default TaskQueueTableHeader;
