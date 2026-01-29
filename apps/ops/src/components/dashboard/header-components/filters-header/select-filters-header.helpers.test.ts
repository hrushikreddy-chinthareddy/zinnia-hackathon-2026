import { DashboardResponseData } from '@deps/queries/api/dashboard';

import {
    combineDuplicateLabels,
    getBrokerDealerOptions,
} from './select-filters-header.helpers';

jest.mock('@deps/utils/strings', () => ({
    ...jest.requireActual('@deps/utils/strings'),
}));

describe('select-filters-header helpers', () => {
    describe('getBrokerDealerOptions', () => {
        it('returns an empty array when given no broker dealers', () => {
            const result = getBrokerDealerOptions([]);

            expect(result).toEqual([]);
        });

        it('maps broker dealers to SelectFilterOption using title-cased label and original value', () => {
            const brokerDealers = [
                { name: 'acme broker' },
                { name: 'another broker' },
            ] as DashboardResponseData[];

            const result = getBrokerDealerOptions(brokerDealers);

            expect(result).toEqual([
                { label: 'Acme Broker', value: 'acme broker' },
                { label: 'Another Broker', value: 'another broker' },
            ]);
        });
    });

    describe('combineDuplicateLabels', () => {
        it('returns an empty array when given no data', () => {
            const result = combineDuplicateLabels([]);

            expect(result).toEqual([]);
        });

        it('returns the same data when there are no duplicate labels', () => {
            const data = [
                { label: 'Label A', value: 'value-1' },
                { label: 'Label B', value: 'value-2' },
            ];

            const result = combineDuplicateLabels(data);

            expect(result).toEqual(data);
        });

        it('combines values for duplicate labels into a comma-separated list', () => {
            const data = [
                { label: 'Label A', value: 'value-1' },
                { label: 'Label B', value: 'value-2' },
                { label: 'Label A', value: 'value-3' },
                { label: 'Label A', value: 'value-4' },
            ];

            const result = combineDuplicateLabels(data);

            expect(result).toContainEqual({
                label: 'Label A',
                value: 'value-1, value-3, value-4',
            });
            expect(result).toContainEqual({
                label: 'Label B',
                value: 'value-2',
            });
            expect(result.length).toBe(2);
        });
    });
});
