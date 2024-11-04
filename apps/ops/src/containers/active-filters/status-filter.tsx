import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Select from '@deps/components/select/select';
import { Statuses } from '@deps/models/case/case';

export default function StatusFilter({
    values = [Statuses.Exception, Statuses.InProgress, Statuses.NotStarted],
    onChange,
}: {
    values?: Statuses[];
    onChange: (values: Statuses[]) => void;
}) {
    const { t } = useTranslation();
    const statusOptions = [
        { displayText: t('status.notStarted'), label: t('status.notStarted'), value: Statuses.NotStarted },
        { displayText: t('status.inProgress'), label: t('status.inProgress'), value: Statuses.InProgress },
        { displayText: t('status.exception'), label: t('status.exception'), value: Statuses.Exception },
        { displayText: t('status.completed'), label: t('status.completed'), value: Statuses.Completed },
        { displayText: t('status.canceled'), label: t('status.canceled'), value: Statuses.Canceled },
        { displayText: t('status.new'), label: t('status.new'), value: Statuses.New },
    ];

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
        newSelectedSet.forEach(val => {
            if (prevSelected.has(val)) {
                prevSelected.delete(val);
                newSelectedSet.delete(val);
            }
        });
        // only need to update selected if there is a change
        if (prevSelected.size !== 0 || newSelectedSet.size !== 0) {
            setSelected(newSelected);
        }
    }, [values]);

    const handleSelection = (selectedValue: string, displayText: string) => {
        setSelected(prev => {
            const newSelections = { ...prev };
            if (newSelections[selectedValue]) {
                delete newSelections[selectedValue];
            } else {
                newSelections[selectedValue] = displayText;
            }
            return newSelections;
        });
    };

    useEffect(() => {
        onChange(Object.keys(selected).filter(key => selected[key] && key !== 'All') as Statuses[]);
    }, [selected]);

    return (
        <div className="max-w-[234px] mb-4">
            <Select
                isMultiselect
                options={statusOptions}
                value={selected}
                onChange={handleSelection}
                placeholder={t('caseManagementDashboard.selectStatus') as string}
            />
        </div>
    );
}
