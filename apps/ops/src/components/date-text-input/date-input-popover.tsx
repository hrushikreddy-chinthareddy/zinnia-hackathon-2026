import { DatePicker, Icon, IconType, Popover } from '@zinnia/bloom/components';
import { useCallback, useState } from 'react';

import styles from './date-input-popover.module.css';

type DateInputPopoverProps = {
    title: string;
    value: Date | undefined;
    onSelect: (value: Date) => void;
};

export const DateInputPopover = ({
    title,
    value,
    onSelect,
}: DateInputPopoverProps) => {
    const [open, setOpen] = useState(false);

    const handleSelect = useCallback(
        (newValue: Date) => {
            onSelect(newValue);
            setOpen(false);
        },
        [onSelect]
    );

    return (
        <Popover
            popoverClassName={styles.popoverContainer}
            trigger={<Icon type={IconType.CALENDAR} />}
            onOpenChange={setOpen}
            {...{ title, open }}
        >
            <DatePicker
                required
                mode="single"
                timeZone="UTC"
                defaultMonth={value}
                selected={value}
                onSelect={handleSelect}
            />
        </Popover>
    );
};
