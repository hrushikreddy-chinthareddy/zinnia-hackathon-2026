import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Select from '@deps/components/select/select';
import { Statuses } from '@deps/models/case/case';

export default function StatusFilter({
    values = [Statuses.Exception, Statuses.InProgress, Statuses.New, Statuses.NotStarted],
    onChange,
}: {
    values?: Statuses[];
    onChange: (values: Statuses[]) => void;
}) {
    const { t } = useTranslation();
    const statusOptions = [
        { displayText: t('status.all'), label: t('status.all'), value: 'All' },
        { displayText: t('status.canceled'), label: t('status.canceled'), value: Statuses.Canceled },
        { displayText: t('status.completed'), label: t('status.completed'), value: Statuses.Completed },
        { displayText: t('status.exception'), label: t('status.exception'), value: Statuses.Exception },
        { displayText: t('status.inProgress'), label: t('status.inProgress'), value: Statuses.InProgress },
        { displayText: t('status.new'), label: t('status.new'), value: Statuses.New },
        { displayText: t('status.notStarted'), label: t('status.notStarted'), value: Statuses.NotStarted },
    ];
    const [selected, setSelected] = useState<{ [key: string]: string }>(
        statusOptions.reduce((acc, option) => {
            if (values.includes(option.value as Statuses)) {
                return { ...acc, [option.value]: option.displayText };
            } else return acc;
        }, {})
    );

    const handleSelection = (selectedValue: string, displayText: string) => {
        if (selectedValue === 'All') {
            // toggle all options
            setSelected(prevSelected =>
                prevSelected['All'] ? {} : statusOptions.reduce((prev, option) => ({ ...prev, [option.value]: option.displayText }), {})
            );
        } else {
            setSelected(prevSelected => {
                return statusOptions.reduce((acc, { value }) => {
                    if ((value === 'All' && prevSelected[selectedValue]) || (selectedValue === value && prevSelected[value])) {
                        return acc;
                    } else if (selectedValue === value) {
                        return { ...acc, [value]: displayText };
                    } else if (prevSelected[value]) {
                        return { ...acc, [value]: prevSelected[value] };
                    } else return acc;
                }, {});
            });
        }
    };

    useEffect(() => {
        onChange(Object.keys(selected).filter(key => selected[key] && key !== 'All') as Statuses[]);
    }, [selected]);

    return (
        <Select
            isMultiselect
            label={'Case Status Translate Me'}
            options={statusOptions}
            value={selected}
            onChange={handleSelection}
            placeholder={'Case Status Translate Me'}
        />
    );
}
