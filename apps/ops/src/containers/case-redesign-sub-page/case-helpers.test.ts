// portal-frontend/src/containers/case-redesign-sub-page/case-helpers.test.ts
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { TFunction } from 'next-i18next';

import { mockCaseDetails } from '@deps/services/mocks/case-details';

import { getPartiesFromCase } from './case-helpers';

dayjs.extend(utc);
dayjs.extend(timezone);

jest.mock('@deps/utils/server-logging');

jest.mock('./case-helpers', () => ({
    ...jest.requireActual('./case-helpers'),
}));

const mockT: TFunction = jest.fn().mockImplementation((key: string, values?: Record<string, string>) => {
    if (key === 'colDefs:people.orderedRoles') {
        return ['OWNER', 'PAYEE', 'AGENT'];
    }
    if (values) {
        return `${key} ${Object.values(values).join(', ')}`;
    }
    return key;
});

describe('getPartiesFromCase', () => {
    it('should handle case with no parties correctly', () => {
        const result = getPartiesFromCase({ ...mockCaseDetails, parties: [] }, mockT);
        expect(result).toEqual({
            agents: [],
            owners: [],
        });
    });

    it('should get parties from a case correctly', () => {
        const result = getPartiesFromCase(mockCaseDetails, mockT);
        expect(result).toEqual({
            owners: [
                {
                    id: 'NACHAEL-VIENEK-NACHAEL  VIENEK-5117',
                    fullName: 'Nachael  Vienek',
                    roles: ['chipFilter.partyRole.owner'],
                },
            ],
            agents: [
                {
                    id: 'GREGORY-LARGE-GREGORY KARL LARGE-9194',
                    fullName: 'Gregory Karl Large',
                    roles: ['Servicing Agent', 'chipFilter.partyRole.agentOfRecord'],
                },
            ],
        });
    });
});

// describe('dateToString', () => {
//     it('should format date correctly', () => {
//         const date = new Date(2022, 0, 1); // January 1, 2022
//         const result = dateToString(date);
//         expect(result).toBe('01012022');
//     });

//     it('should format single digit month and day correctly', () => {
//         const date = new Date(2022, 8, 9); // September 9, 2022
//         const result = dateToString(date);
//         expect(result).toBe('09092022');
//     });
// });

// describe('getDateWithDaysOffset', () => {
//     it('should return date with correct days offset', () => {
//         const today = new Date();
//         const offsetDays = 5;
//         const expectedDate = new Date();
//         expectedDate.setDate(today.getDate() - offsetDays);
//         const result = getDateWithDaysOffset(offsetDays);
//         expect(result.toDateString()).toBe(expectedDate.toDateString());
//     });

//     it('should handle negative offset correctly', () => {
//         const today = new Date();
//         const offsetDays = -5;
//         const expectedDate = new Date();
//         expectedDate.setDate(today.getDate() - offsetDays);
//         const result = getDateWithDaysOffset(offsetDays);
//         expect(result.toDateString()).toBe(expectedDate.toDateString());
//     });
// });

// describe('formatDateToApi', () => {
//     it('should format start date correctly', () => {
//         const date = '01012022'; // January 1, 2022
//         const result = formatDateToApi(date, true);
//         expect(result).toBe(dayjs('2022-01-01').startOf('day').tz(dayjs.tz.guess()).format());
//     });

//     it('should format end date correctly', () => {
//         const date = '01012022'; // January 1, 2022
//         const result = formatDateToApi(date, false);
//         expect(result).toBe(dayjs('2022-01-01').endOf('day').tz(dayjs.tz.guess()).format());
//     });
// });
