import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Select from '@deps/components/select/select';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helpers';
import { Statuses } from '@deps/models/case/case';
import {
    DropdownClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';

export default function StatusFilter({
    caseTotals = {},
    onChange,
    sessionId,
    userId,
    values = [],
}: {
    caseTotals?: { [key: string]: number };
    values?: Statuses[];
    onChange: (values: Statuses[]) => void;
    sessionId: string;
    userId: string;
}) {
    const { t } = useTranslation();
    const statusOptions = useMemo(
        () => [
            {
                label: `${t('status.notStarted')} (${wholeNumberFormatify(
                    caseTotals[Statuses.NotStarted] ?? 0
                )})`,
                displayText: t('status.notStarted'),
                value: Statuses.NotStarted,
            },
            {
                label: `${t('status.inProgress')} (${wholeNumberFormatify(
                    caseTotals[Statuses.InProgress] ?? 0
                )})`,
                displayText: t('status.inProgress'),
                value: Statuses.InProgress,
            },
            {
                label: `${t('status.exception')} (${wholeNumberFormatify(
                    caseTotals[Statuses.Exception] ?? 0
                )})`,
                displayText: t('status.exception'),
                value: Statuses.Exception,
            },
            {
                label: `${t('status.completed')} (${wholeNumberFormatify(
                    caseTotals[Statuses.Completed] ?? 0
                )})`,
                displayText: t('status.completed'),
                value: Statuses.Completed,
            },
            {
                label: `${t('status.canceled')} (${wholeNumberFormatify(
                    caseTotals[Statuses.Canceled] ?? 0
                )})`,
                displayText: t('status.canceled'),
                value: Statuses.Canceled,
            },
        ],
        [caseTotals, t]
    );

    const [selected, setSelected] = useState<{ [key: string]: string }>(
        statusOptions.reduce((acc, option) => {
            if (values.includes(option.value as Statuses)) {
                return { ...acc, [option.value]: option.displayText };
            } else return acc;
        }, {})
    );

    useEffect(() => {
        const newSelected = statusOptions.reduce((acc, option) => {
            if (values.includes(option.value as Statuses)) {
                return { ...acc, [option.value]: option.displayText };
            } else return acc;
        }, {});

        const prevSelected = new Set(Object.keys(selected));
        const newSelectedSet = new Set(Object.keys(newSelected));
        newSelectedSet.forEach((val) => {
            if (prevSelected.has(val)) {
                prevSelected.delete(val);
                newSelectedSet.delete(val);
            }
        });
        // only need to update selected if there is a change
        if (prevSelected.size !== 0 || newSelectedSet.size !== 0) {
            setSelected(newSelected);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values]);

    const handleSelection = (selectedValue: string, displayText: string) => {
        setSelected((prev) => {
            const newSelections = { ...prev };
            if (newSelections[selectedValue]) {
                delete newSelections[selectedValue];
            } else {
                newSelections[selectedValue] = displayText;
            }
            return newSelections;
        });
    };

    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                segmentAnalyticsTrackEvent<DropdownClickedEvent>(
                    SegmentTrackedEventName.DropdownClicked,
                    {
                        dropdownName: 'Case Status Filter',
                        selectedItemName:
                            statusOptions.reduce((acc, option) => {
                                if (selected[option.value]) {
                                    return `${acc}${acc.length ? ', ' : ''}${
                                        option.value
                                    }`;
                                } else return acc;
                            }, '') ?? 'All',
                        authSessionId: sessionId,
                        userId,
                    }
                );
            }
        },
        [selected, statusOptions, sessionId, userId]
    );

    useEffect(() => {
        onChange(
            Object.keys(selected).filter((key) => selected[key]) as Statuses[]
        );
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    return (
        <div className="w-[214px] sm:w-[234px]">
            <Select
                id="status-select"
                isMultiselect
                options={statusOptions}
                value={selected}
                onChange={handleSelection}
                onOpenChange={handleOpenChange}
                placeholder={
                    t('caseManagementDashboard.selectStatus') as string
                }
            />
        </div>
    );
}
