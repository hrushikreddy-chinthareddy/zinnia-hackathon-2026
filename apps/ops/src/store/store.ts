import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DashboardStoreSelectFilterTypes {
    selectedCarriers: string[];
    selectedBrokerDealers: string[];
    updateSelectedCarriers: (value: string[]) => void;
    updateSelectedBrokerDealers: (value: string[]) => void;
}

export const useDashboardStore = create(
    devtools<DashboardStoreSelectFilterTypes>((set) => ({
        selectedCarriers: [],
        selectedBrokerDealers: [],

        updateSelectedCarriers: (val: string[]) => {
            // values can be comma separated ["PRUD, ALLS", "DLIC"] and API expects uppercase values
            const transformedVal = val
                .flatMap((carrierString) =>
                    carrierString.split(',').map((string) => string.trim())
                )
                .map((val) => val.toUpperCase());
            return set(
                { selectedCarriers: transformedVal },
                undefined,
                'dashboard/updateSelectedCarrier'
            );
        },

        updateSelectedBrokerDealers: (val: string[]) => {
            const transformedVal = val.map((val) => val.toUpperCase());
            return set(
                { selectedBrokerDealers: transformedVal },
                undefined,
                'dashboard/updateSelectedBroker'
            );
        },
    }))
);
