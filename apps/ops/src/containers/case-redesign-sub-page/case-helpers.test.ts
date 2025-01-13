// portal-frontend/src/containers/case-redesign-sub-page/case-helpers.test.ts
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { TFunction } from 'next-i18next';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { PartyRole, PolicyParties } from '@deps/models/policy/sor-policy';
import { mockCaseDetails } from '@deps/services/mocks/case-details';

import { getPartiesFromCase, getPartiesFromPolicy } from './case-helpers';

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

describe('getPartiesFromPolicy', () => {
    it('should get parties from policy correctly', () => {
        const { owners, agents, brokers } = getPartiesFromPolicy(new PolicyDetails(mockPolicy), mockT);
        expect(owners).toEqual([
            {
                id: '123',
                fields: {
                    address: {
                        label: 'colDefs:owner.mailingAddress',
                        value: {
                            addressId: '123',
                            startDate: '2023-03-28',
                            endDate: '',
                            addressType: 'RESIDENCE',
                            addressLine1: '78 BOWERS STREET',
                            addressLine2: '',
                            addressLine3: '',
                            city: 'BELLEMEAD',
                            state: 'NJ',
                            zipCode: '08502',
                            zipCodeExtension: '',
                            country: 'US',
                        },
                    },
                    dob: {
                        label: 'colDefs:owner.birthDate',
                        value: '10/5/2004',
                    },
                    email: {
                        label: 'colDefs:owner.email',
                        value: 'secben585+0502v1@gmail.com',
                    },
                    phone: {
                        label: 'people.card.phone.phoneOptions.mobile',
                        value: '+1 (318) 987-3960',
                    },
                    ssn: {
                        label: 'colDefs:owner.ssnAbbreviated',
                        value: '650-21-4576',
                    },
                },
                fullName: 'Naela Safi Number 1',
                roles: ['chipFilter.partyRole.owner'],
            },
        ]);
        expect(agents).toEqual([
            {
                id: 'Party_Org',
                fullName: '',
                roles: ['chipFilter.partyRole.agent'],
            },
        ]);
        expect(brokers).toEqual([]);
    });

    it('should handle policy with no parties correctly', () => {
        const result = getPartiesFromPolicy(new PolicyDetails({ ...mockPolicy, parties: [] }), mockT);
        expect(result).toEqual({
            agents: [],
            owners: [],
            brokers: [],
        });
    });

    it('should handle policy with no party roles correctly', () => {
        const result = getPartiesFromPolicy(new PolicyDetails({ ...mockPolicy, partyRoles: [] }), mockT);
        expect(result).toEqual({
            agents: [],
            owners: [],
            brokers: [],
        });
    });

    it('should handle policy with multiple parties correctly', () => {
        const multipleOwners = [...(mockPolicy.partyRoles as PolicyParties[])];
        multipleOwners[1].partyRole = PartyRole.JOINTOWNER;
        multipleOwners[5].partyRole = PartyRole.PRIMARYWRITINGAGENT;
        const result = getPartiesFromPolicy(new PolicyDetails({ ...mockPolicy, partyRoles: multipleOwners }), mockT);
        expect(result).toEqual({
            owners: [
                {
                    id: '123',
                    fields: {
                        address: {
                            label: 'colDefs:owner.mailingAddress',
                            value: {
                                addressId: '123',
                                startDate: '2023-03-28',
                                endDate: '',
                                addressType: 'RESIDENCE',
                                addressLine1: '78 BOWERS STREET',
                                addressLine2: '',
                                addressLine3: '',
                                city: 'BELLEMEAD',
                                state: 'NJ',
                                zipCode: '08502',
                                zipCodeExtension: '',
                                country: 'US',
                            },
                        },
                        dob: {
                            label: 'colDefs:owner.birthDate',
                            value: '10/5/2004',
                        },
                        email: {
                            label: 'colDefs:owner.email',
                            value: 'secben585+0502v1@gmail.com',
                        },
                        phone: {
                            label: 'people.card.phone.phoneOptions.mobile',
                            value: '+1 (318) 987-3960',
                        },
                        ssn: {
                            label: 'colDefs:owner.ssnAbbreviated',
                            value: '650-21-4576',
                        },
                    },
                    fullName: 'Naela Safi Number 1',
                    roles: ['chipFilter.partyRole.owner'],
                },
                {
                    id: '456',
                    fields: {
                        address: {
                            label: 'colDefs:owner.mailingAddress',
                            value: {
                                addressId: '234',
                                startDate: '2023-03-28',
                                endDate: '',
                                addressType: 'RESIDENCE',
                                addressLine1: '234 BOWERS STREET',
                                addressLine2: '',
                                addressLine3: '',
                                city: 'BELLEMEAD',
                                state: 'NJ',
                                zipCode: '08502',
                                zipCodeExtension: '',
                                country: 'US',
                            },
                        },
                        dob: {
                            label: 'colDefs:owner.birthDate',
                            value: '10/5/2004',
                        },
                        email: {
                            label: 'colDefs:owner.email',
                            value: 'secben585+0502v1@gmail.com',
                        },
                        phone: {
                            label: 'people.card.phone.phoneOptions.mobile',
                            value: '+1 (318) 987-3960',
                        },
                        ssn: {
                            label: 'colDefs:owner.ssnAbbreviated',
                            value: '650-21-4576',
                        },
                    },
                    fullName: 'Naela Safi Number 2',
                    roles: ['chipFilter.partyRole.jointOwner'],
                },
            ],
            agents: [
                {
                    id: 'Party_Org',
                    fullName: '',
                    roles: ['chipFilter.partyRole.agent'],
                },
                {
                    id: 'Party_Trust',
                    fullName: 'Example Trust',
                    roles: ['chipFilter.partyRole.primaryWritingAgent'],
                },
            ],
            brokers: [],
        });
    });
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
