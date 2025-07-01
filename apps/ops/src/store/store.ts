import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { CarrierListItem } from '@deps/components/dashboard/types';

interface DashboardStoreTypes {
    selectedCarriers: CarrierListItem;
    selectedBrokerDealers: CarrierListItem;
    updateSelectedCarriers: (value: CarrierListItem) => void;
    updateSelectedBrokerDealers: (value: CarrierListItem) => void;
}

export const useDashboardStore = create(
    devtools<DashboardStoreTypes>((set) => ({
        selectedCarriers: {},
        selectedBrokerDealers: {},
        updateSelectedCarriers: (val: CarrierListItem) =>
            set(
                { selectedCarriers: val },
                undefined,
                'dashboard/updateSelectedCarrier'
            ),
        updateSelectedBrokerDealers: (val: CarrierListItem) =>
            set(
                { selectedBrokerDealers: val },
                undefined,
                'dashboard/updateSelectedBroker'
            ),
    }))
);
