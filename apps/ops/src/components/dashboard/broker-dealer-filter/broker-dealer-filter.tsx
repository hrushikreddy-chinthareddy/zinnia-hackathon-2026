import { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { MultiselectOption } from '@deps/components/select/select.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { toTitleCase } from '@deps/helpers/string.helper';
import { CarrierListItem } from '@deps/pages/dashboard';
import { DashboardResponseData, fetchAgents } from '@deps/queries/api/dashboard';
type BrokerDealerFilterProps = {
    brokerDealers: DashboardResponseData[];
    selectedCarriers: string[];
    setSelectedBrokerDealers: Dispatch<SetStateAction<DashboardResponseData[]>>;
    updateBrokerDealerFilters: (value: string, displayText: string) => void;
    selectedBrokerDealers: CarrierListItem;
};

export const BrokerDealerFilter = ({
    brokerDealers,
    updateBrokerDealerFilters,
    selectedBrokerDealers,
    selectedCarriers,
    setSelectedBrokerDealers,
}: BrokerDealerFilterProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const getBrokerDealerOptions = useCallback((): MultiselectOption[] => {
        return brokerDealers.map(agent => {
            const formattedName = toTitleCase(agent.name);
            return { label: <span>{formattedName}</span>, value: agent.name, displayText: `${formattedName}` };
        });
    }, [brokerDealers]);

    useEffect(() => {
        const fetchBrokerDealersClient = async () => {
            const brokerDealerArray = await fetchAgents();

            setSelectedBrokerDealers(brokerDealerArray);
        };

        if (!brokerDealers) {
            fetchBrokerDealersClient();
        }
    }, [selectedCarriers, brokerDealers, setSelectedBrokerDealers]);

    return (
        <Select
            isMultiselect
            options={getBrokerDealerOptions()}
            value={selectedBrokerDealers}
            onChange={updateBrokerDealerFilters}
            size={FieldSize.Small}
            placeholder={t('allAgents') || ''}
            disabled={brokerDealers.length < 2}
            name="agent-dropdown-btn"
        />
    );
};
