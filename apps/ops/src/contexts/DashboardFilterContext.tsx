import { toTitleCase } from '@zinnia/utils';
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from 'react';

import { MultiselectOption } from '@deps/components/autocomplete/autocomplete.types';
import { CarrierListItem } from '@deps/pages/dashboard';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { getCarrierListItem, getCarrierNameByClientId, getClientIdsByCarrierName } from '@deps/utils/carriers';

type DashboardFilterContextType = {
    brokerDealerItems: MultiselectOption[];
    carrierFilterItems: MultiselectOption[];
    selectedCarriers: CarrierListItem;
    setSelectedCarriers: Dispatch<SetStateAction<CarrierListItem>>;
    selectedBrokerDealers: CarrierListItem;
    setSelectedBrokerDealers: Dispatch<SetStateAction<CarrierListItem>>;
    uniqueCarrierFilterItems: MultiselectOption[];
    uniqueBrokerDealerFilterItems: MultiselectOption[];
};

const initialState: DashboardFilterContextType = {
    brokerDealerItems: [],
    carrierFilterItems: [],
    selectedCarriers: {},
    setSelectedCarriers: () => {},
    selectedBrokerDealers: {},
    setSelectedBrokerDealers: () => {},
    uniqueCarrierFilterItems: [],
    uniqueBrokerDealerFilterItems: [],
};

const DashboardFilterContext = createContext<DashboardFilterContextType>(initialState);

type DashboardFilterProviderProps = {
    authorizedCarriers: string[];
    brokerDealers?: DashboardResponseData[];
} & PropsWithChildren;

export const DashboardFilterProvider = ({ children, authorizedCarriers, brokerDealers }: DashboardFilterProviderProps) => {
    const carrierFilterItems = useMemo(
        () =>
            authorizedCarriers.map((carrierCode: string) => {
                const valueAndDisplay = getCarrierNameByClientId(carrierCode) || carrierCode.toUpperCase();

                return {
                    value: getClientIdsByCarrierName(authorizedCarriers, valueAndDisplay) || carrierCode.toUpperCase(),
                    displayText: valueAndDisplay,
                    label: getCarrierListItem(carrierCode),
                };
            }),
        [authorizedCarriers]
    );

    const brokerDealerItems = useMemo(
        () =>
            (brokerDealers?.map(brokerDealer => {
                const formattedName = toTitleCase(brokerDealer.name);
                return { label: <span>{formattedName}</span>, value: brokerDealer.name, displayText: `${formattedName}` };
            }) || []) as MultiselectOption[],
        [brokerDealers]
    );

    const carrierLabels = new Set();
    const uniqueCarrierFilterItems = (
        carrierFilterItems.filter(item => {
            if (carrierLabels.has(item.displayText)) {
                return false;
            }

            carrierLabels.add(item.displayText);
            return true;
        }) as typeof carrierFilterItems
    ).sort((item1, item2) => item1.displayText.localeCompare(item2.displayText));

    const uniqueBrokerDealerFilterItems = brokerDealerItems.filter(item => {
        if (carrierLabels.has(item.displayText)) {
            return false;
        }

        carrierLabels.add(item.displayText);
        return true;
    }) as typeof brokerDealerItems;
    const [selectedCarriers, setSelectedCarriers] = useState<CarrierListItem>(
        carrierFilterItems.length === 1 ? { [carrierFilterItems[0].value]: carrierFilterItems[0].displayText } : {}
    );

    const [selectedBrokerDealers, setSelectedBrokerDealers] = useState<CarrierListItem>(
        brokerDealers?.length === 1 ? { [brokerDealers[0].key]: brokerDealers[0].name } : {}
    );

    return (
        <DashboardFilterContext.Provider
            value={{
                brokerDealerItems,
                carrierFilterItems,
                selectedCarriers,
                setSelectedCarriers,
                selectedBrokerDealers,
                setSelectedBrokerDealers,
                uniqueCarrierFilterItems,
                uniqueBrokerDealerFilterItems,
            }}
        >
            {children}
        </DashboardFilterContext.Provider>
    );
};
export const useDashboardFiltersContext = () => {
    const context = useContext(DashboardFilterContext);

    if (!context) {
        throw new Error('useDashboardFilters must be used within a DashboardFilterProvider');
    }

    return context;
};
