import * as ReactPopover from '@radix-ui/react-popover';
import { DatePicker, DatePickerTypes, Icon, IconType } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { FC, useState } from 'react';

import { getDateRangeText } from '@deps/components/dashboard/utils';
import fieldStyles from '@deps/components/field/Field.module.css';
import { zIndexOrder } from '@deps/utils/zIndexOrder';

import styles from './custom-date-range.module.css';
interface CustomDateRangeProps {
    timerange?: { from: string; to: string };
    handleTimerangeChange?: (value: { from: string; to: string }) => void;
}

export const CustomDateRange: FC<CustomDateRangeProps> = ({ timerange, handleTimerangeChange }) => {
    const [open, setOpen] = useState(false);

    if (!timerange) {
        return null;
    }

    const handleSelect = (dateRange: DatePickerTypes.DateRange | undefined) => {
        if (dateRange && dateRange.from && dateRange.to && handleTimerangeChange) {
            handleTimerangeChange({ from: dateRange.from.toISOString(), to: dateRange.to.toISOString() });
        }
    };

    const selected = {
        from: dayjs(timerange?.from || dayjs()).toDate(),
        to: dayjs(timerange?.to || dayjs()).toDate(),
    };

    const rangeText = getDateRangeText(timerange?.to, timerange?.from);

    return (
        <ReactPopover.Root open={open} onOpenChange={setOpen}>
            <ReactPopover.Trigger disabled={!handleTimerangeChange} className={styles.trigger}>
                {handleTimerangeChange && <Icon className={styles.calendarIcon} width={16} height={16} type={IconType.CALENDAR} />}

                <p className="typography-labels-field-label">{rangeText}</p>
            </ReactPopover.Trigger>
            <ReactPopover.Portal>
                <ReactPopover.Content align="end" side="bottom" style={{ zIndex: zIndexOrder.DatePickerDialog }}>
                    <div className={fieldStyles.datePickerContainer}>
                        <DatePicker
                            mode="range"
                            timeZone="UTC"
                            selected={selected}
                            onSelect={handleSelect}
                            defaultMonth={dayjs(timerange?.from || dayjs()).toDate()}
                        />
                    </div>
                </ReactPopover.Content>
            </ReactPopover.Portal>
        </ReactPopover.Root>
    );
};
