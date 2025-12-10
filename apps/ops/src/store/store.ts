import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { CarrierListItem } from '@deps/components/dashboard/types';

interface DashboardStoreTypes {
    selectedCarriers: CarrierListItem;
    selectedBrokerDealers: CarrierListItem;
    updateSelectedCarriers: (value: CarrierListItem) => void;
    updateSelectedBrokerDealers: (value: CarrierListItem) => void;
}

interface DashboardStoreSelectFilterTypes {
    selectedCarriers: string[];
    selectedBrokerDealers: string[];
    updateSelectedCarriers: (value: string[]) => void;
    updateSelectedBrokerDealers: (value: string[]) => void;
}
//Split comma-joined carrierId keys (e.g. {"1,2": "Carrier Name"}) into separate entries ({"1":"Carrier Name","2":"Carrier Name"})
const transformObject = (
    inputObj: Record<string, string>
): Record<string, string> => {
    const outputObj: Record<string, string> = {};

    for (const [key, value] of Object.entries(inputObj)) {
        const keys = key.split(',');
        keys.forEach((singleKey) => {
            outputObj[singleKey.trim()] = value;
        });
    }

    return outputObj;
};

export const useDashboardStore = create(
    devtools<DashboardStoreTypes>((set) => ({
        selectedCarriers: {},
        selectedBrokerDealers: {},
        updateSelectedCarriers: (val: CarrierListItem) => {
            const transformedVal = transformObject(val);
            return set(
                { selectedCarriers: transformedVal },
                undefined,
                'dashboard/updateSelectedCarrier'
            );
        },

        updateSelectedBrokerDealers: (val: CarrierListItem) =>
            set(
                { selectedBrokerDealers: val },
                undefined,
                'dashboard/updateSelectedBroker'
            ),
    }))
);

export const useDashboardStoreSelectFilter = create(
    devtools<DashboardStoreSelectFilterTypes>((set) => ({
        selectedCarriers: [],
        selectedBrokerDealers: [],

        updateSelectedCarriers: (val: string[]) => {
            return set(
                { selectedCarriers: val },
                undefined,
                'dashboard/updateSelectedCarrier'
            );
        },

        updateSelectedBrokerDealers: (val: string[]) =>
            set(
                { selectedBrokerDealers: val },
                undefined,
                'dashboard/updateSelectedBroker'
            ),
    }))
);
