import * as ReactPopover from '@radix-ui/react-popover';
import {
    DatePicker,
    DatePickerTypes,
    Icon,
    IconType,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { FC, useState } from 'react';

import { getDateRangeText } from '@deps/components/dashboard/utils';
import fieldStyles from '@deps/components/field/Field.module.css';
import { zIndexOrder } from '@deps/utils/zIndexOrder';

import styles from './custom-date-range.module.css';
interface CustomDateRangeProps {
    timerange?: { from: string; to: string };
    handleTimerangeChange?: (value: { from: string; to: string }) => void;
    showIcon?: boolean;
}

export const CustomDateRange: FC<CustomDateRangeProps> = ({
    timerange,
    handleTimerangeChange,
    showIcon = true,
}) => {
    const [open, setOpen] = useState(false);

    if (!timerange) {
        return null;
    }

    const handleSelect = (dateRange: DatePickerTypes.DateRange | undefined) => {
        if (
            dateRange &&
            dateRange.from &&
            dateRange.to &&
            handleTimerangeChange
        ) {
            handleTimerangeChange({
                from: dateRange.from.toISOString(),
                to: dateRange.to.toISOString(),
            });
        }
    };

    const selected = {
        from: dayjs(timerange?.from || dayjs()).toDate(),
        to: dayjs(timerange?.to || dayjs()).toDate(),
    };

    const rangeText = getDateRangeText(timerange?.to, timerange?.from);

    return (
        <ReactPopover.Root open={open} onOpenChange={setOpen}>
            <ReactPopover.Trigger
                disabled={!handleTimerangeChange}
                className={styles.trigger}
            >
                {handleTimerangeChange && showIcon && (
                    <Icon
                        className={styles.calendarIcon}
                        width={16}
                        height={16}
                        type={IconType.CALENDAR}
                    />
                )}

                <p
                    className={clsx(
                        'typography-labels-field-label mb-1 ',
                        handleTimerangeChange &&
                            'text-[var(--color-base-text-text-link)] cursor-pointer'
                    )}
                >
                    {rangeText}
                </p>
            </ReactPopover.Trigger>
            <ReactPopover.Portal>
                <ReactPopover.Content
                    align="end"
                    side="bottom"
                    style={{ zIndex: zIndexOrder.DatePickerDialog }}
                >
                    <div className={fieldStyles.datePickerContainer}>
                        <DatePicker
                            mode="range"
                            selected={selected}
                            onSelect={handleSelect}
                            endMonth={dayjs().toDate()}
                            disabled={{ after: new Date() }}
                            defaultMonth={dayjs(
                                timerange?.to || dayjs()
                            ).toDate()}
                        />
                    </div>
                </ReactPopover.Content>
            </ReactPopover.Portal>
        </ReactPopover.Root>
    );
};
