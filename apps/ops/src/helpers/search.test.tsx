import { ReactComponent as FinanceIcon } from '@deps/styles/elements/icons/icons_outlined/finance.svg';
import { ReactComponent as NewspaperIcon } from '@deps/styles/elements/icons/icons_outlined/newspaper.svg';
import { DataDefinition } from '@deps/types/data';

import {
    filterOnSearchHandler,
    groupValues,
    mapGroupToIcon,
} from './search.helpers';

const array: DataDefinition<any>[] = [
    {
        value: 'Zebra',
        key: 'mammal',
        label: 'Hoofed Animal',
        group: 'hoofed',
    },
    {
        value: 'Buffalo',
        key: 'mammal',
        label: 'Hoofed Animal',
        group: 'hoofed',
    },
    {
        value: 'Arachnid',
        key: 'spider',
        label: 'Spider',
        group: 'creepy',
    },
];

describe('Search Helper', () => {
    describe('> filterOnSearchHandler', () => {
        it('should filter by partial search', () => {
            const params = { searchValue: 'hoof' };
            const filteredData = filterOnSearchHandler(array, params);

            expect(filteredData).toHaveLength(2);
        });

        it('should filter by exact search', () => {
            const params = { searchValue: 'spider' };
            const filteredData = filterOnSearchHandler(array, params);

            expect(filteredData).toHaveLength(1);
        });
    });

    describe('> groupValues', () => {
        it('should group data by species', () => {
            const groupKey = 'group';
            const groupedData = groupValues(array, groupKey);

            const expectedGroup = {
                creepy: [
                    {
                        group: 'creepy',
                        key: 'spider',
                        label: 'Spider',
                        value: 'Arachnid',
                    },
                ],
                hoofed: [
                    {
                        value: 'Zebra',
                        key: 'mammal',
                        label: 'Hoofed Animal',
                        group: 'hoofed',
                    },
                    {
                        value: 'Buffalo',
                        key: 'mammal',
                        label: 'Hoofed Animal',
                        group: 'hoofed',
                    },
                ],
            };

            expect(groupedData).toStrictEqual(expectedGroup);
        });
    });

    describe('> mapGroupToIcon', () => {
        it('should map default to newspaper icon', () => {
            const group = '';
            const icon = mapGroupToIcon(group);

            expect(icon).toBe(NewspaperIcon);
        });
        it('should map loans to a finance icon', () => {
            const group = 'loans';
            const icon = mapGroupToIcon(group);

            expect(icon).toBe(FinanceIcon);
        });
    });
});
