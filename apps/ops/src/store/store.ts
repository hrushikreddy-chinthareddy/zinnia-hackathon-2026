import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { Processes } from '@deps/models/case/case';
import { CarrierListItem } from '@deps/pages/dashboard';

interface DashboardStoreTypes {
    selectedCarriers: CarrierListItem;
    selectedBrokerDealers: CarrierListItem;
    selectedProcess: Processes;
    selectedSubProcess: string[];
    updateSelectedCarriers: (value: CarrierListItem) => void;
    updateSelectedBrokerDealers: (value: CarrierListItem) => void;
    updateSelectedProcess: (value: Processes) => void;
    updateSelectedSubprocess: (value: string[]) => void;
}

export const useDashboardStore = create(
    devtools<DashboardStoreTypes>(set => ({
        selectedCarriers: {},
        selectedBrokerDealers: {},
        selectedProcess: Processes.NewBusiness,
        selectedSubProcess: [],
        updateSelectedCarriers: (val: CarrierListItem) => set({ selectedCarriers: val }, undefined, 'dashboard/updateSelectedCarrier'),
        updateSelectedBrokerDealers: (val: CarrierListItem) =>
            set({ selectedBrokerDealers: val }, undefined, 'dashboard/updateSelectedBroker'),
        updateSelectedProcess: (val: Processes) => set({ selectedProcess: val }, undefined, 'dashboard/updateSelectedProcess'),
        updateSelectedSubprocess: (val: string[]) => set({ selectedSubProcess: val }, undefined, 'dashboard/updateSelectedSubprocess'),
    }))
);
