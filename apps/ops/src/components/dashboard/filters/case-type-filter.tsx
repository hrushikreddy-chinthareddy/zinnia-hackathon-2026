import { useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { FC } from 'react';

import styles from '@deps/components/dashboard/dashboard-shared.module.css';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

import { createBaseQuery, formatProcessListOptions } from '../utils';

interface CaseTypeFilterProps {
    onValueChange: (value: Processes | ExtendedProcesses) => void;
    defaultProcess: Processes;
    caseStatus: Statuses[];
    value?: Processes | ExtendedProcesses;
}

export enum ExtendedProcesses {
    ALL = 'all',
}

export const CaseTypeFilter: FC<CaseTypeFilterProps> = ({ onValueChange, defaultProcess, caseStatus, value }) => {
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);

    const processFilter: DashboardSearchFilter = {
        caseStatus,
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
    };

    const { data: processListOptions } = useQuery({
        queryKey: ['processListOptions', processFilter],
        placeholderData: previousData => previousData,
        queryFn: () => createBaseQuery(processFilter, [GroupByOptions.Process]),
        select: ({ data }) => {
            const options = formatProcessListOptions(data);
            options.unshift({
                value: ExtendedProcesses.ALL,
                label: 'All case types',
            });
            return options;
        },
        enabled: Object.keys(processFilter).length > 0,
    });

    const handleChange = (value: string) => {
        onValueChange(value as Processes | ExtendedProcesses);
    };

    return (
        <Select
            maxContentWidth
            label="Case type"
            className={styles.selectDropdowns}
            options={processListOptions || []}
            size={FieldSize.XS}
            name="process-type-dropdown-btn"
            placeholder={t('selectProcessType') || ''}
            onChange={handleChange}
            value={value || defaultProcess}
            defaultValue={defaultProcess}
        />
    );
};
