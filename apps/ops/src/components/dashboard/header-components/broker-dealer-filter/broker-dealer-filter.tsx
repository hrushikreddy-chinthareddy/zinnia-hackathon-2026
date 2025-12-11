import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';

import { CarrierListItem } from '@deps/components/dashboard/types';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { MultiselectOption } from '@deps/components/select/select.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { toTitleCase } from '@deps/helpers/string.helpers';
import {
    DashboardResponseData,
    fetchAgents,
} from '@deps/queries/api/dashboard';
type BrokerDealerFilterProps = {
    brokerDealers: DashboardResponseData[];
    selectedCarriers: string[];
    setSelectedBrokerDealers: Dispatch<SetStateAction<DashboardResponseData[]>>;
    updateBrokerDealerFilters: (value: string, displayText: string) => void;
    selectedBrokerDealers: CarrierListItem;
    disabled?: boolean;
    handleOnOpenChangeBroker?: (open: boolean) => void;
};

const getBrokerDealerOptions = (
    brokerDealers: DashboardResponseData[]
): MultiselectOption[] => {
    return brokerDealers.map((agent) => {
        const formattedName = toTitleCase(agent.name);
        return {
            label: <span>{formattedName}</span>,
            value: agent.name,
            displayText: `${formattedName}`,
        };
    });
};

export const BrokerDealerFilter = ({
    brokerDealers,
    updateBrokerDealerFilters,
    selectedBrokerDealers,
    setSelectedBrokerDealers,
    disabled,
    handleOnOpenChangeBroker,
}: BrokerDealerFilterProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const brokerDealerOptions = useMemo(() => {
        return getBrokerDealerOptions(brokerDealers);
    }, [brokerDealers]);

    useEffect(() => {
        const fetchBrokerDealersClient = async () => {
            const brokerDealerArray = await fetchAgents();

            setSelectedBrokerDealers(brokerDealerArray);
        };

        if (!brokerDealers) {
            fetchBrokerDealersClient();
        }
    }, [brokerDealers, setSelectedBrokerDealers]);

    return (
        <Select
            isMultiselect
            options={brokerDealerOptions}
            value={selectedBrokerDealers}
            onChange={updateBrokerDealerFilters}
            size={FieldSize.Small}
            placeholder={t('allDistributors') || ''}
            disabled={
                disabled !== undefined ? disabled : brokerDealers.length === 0
            }
            name="agent-dropdown-btn"
            onOpenChange={handleOnOpenChangeBroker}
        />
    );
};
