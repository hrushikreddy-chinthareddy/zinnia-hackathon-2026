import { useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { FC, useCallback, useEffect, useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { Processes, Statuses } from '@deps/models/case/case';
import { useDashboardStore } from '@deps/store/store';
import { CaseCountGroupByEnum } from '@zinnia/api-types/types/analytics';

import { createBaseQuery, formatProcessListOptions } from '../utils';

interface CaseTypeFilterProps {
    className?: string;
    onValueChange: (value: Processes | ExtendedProcesses) => void;
    defaultProcess: Processes | ExtendedProcesses;
    caseStatus: Statuses[];
    value?: Processes | ExtendedProcesses;
}

export enum ExtendedProcesses {
    ALL = 'all',
}

export const CaseTypeFilter: FC<CaseTypeFilterProps> = ({
    className,
    onValueChange,
    defaultProcess,
    caseStatus,
    value,
}) => {
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(
        (state) => state
    );
    const [selectedProcess, setSelectedProcess] = useState<
        Processes | ExtendedProcesses
    >(defaultProcess);

    const processFilter = {
        caseStatus,
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
    };

    const { data: processListOptions } = useQuery({
        queryKey: ['processListOptions', processFilter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            createBaseQuery(processFilter, [CaseCountGroupByEnum.PROCESS]),
        select: ({ data }) => {
            const options = formatProcessListOptions(data);
            options.unshift({
                value: ExtendedProcesses.ALL,
                label: 'All',
            });
            return options;
        },
        enabled: Object.keys(processFilter).length > 0,
    });

    const isProcesses = (value: string): value is Processes => {
        return Object.values(Processes).map(String).includes(value);
    };

    const handleChange = useCallback(
        (value: string) => {
            const process = isProcesses(value) ? value : ExtendedProcesses.ALL;
            setSelectedProcess(process);
            onValueChange(process);
        },
        [setSelectedProcess, onValueChange]
    );

    useEffect(() => {
        if (!value || value === ExtendedProcesses.ALL || !processListOptions)
            return;

        const isPrevOptionValid = processListOptions?.some(
            (o) => o.value === value
        );

        if (!isPrevOptionValid) {
            handleChange(ExtendedProcesses.ALL);
        }
    }, [handleChange, value, processListOptions]);

    return (
        <Select
            className={className}
            maxContentWidth
            label="Case type"
            options={processListOptions || []}
            size={FieldSize.XS}
            name="process-type-dropdown-btn"
            placeholder={t('selectProcessType') || ''}
            onChange={handleChange}
            value={value || selectedProcess}
            defaultValue={defaultProcess}
        />
    );
};
