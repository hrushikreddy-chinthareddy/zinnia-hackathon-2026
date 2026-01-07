import {
    ContactSearchResponse,
    ContactSearchResult,
    PersonalInfo,
} from '@zinnia/api-types/types/contact-management';

import { maskContactManagementSearch } from './contact-management';

jest.mock('../server-logging', () => ({
    logErrorWithoutContext: jest.fn(),
    parseErrorInformation: jest.fn(() => ({})),
}));

describe('contact-management sanitizers', () => {
    describe('maskContactManagementSearch', () => {
        it('should mask personal info fields with asterisks', () => {
            const input: ContactSearchResult = {
                data: [
                    {
                        id: '123',
                        personalInfo: {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john@example.com',
                            phoneNumber: '123-456-7890',
                            dateOfBirth: '1990-01-01',
                        },
                        address: {
                            street1: '123 Main St',
                            city: 'Springfield',
                            state: 'IL',
                            zipCode: '62701',
                        },
                    },
                ],
                total: 1,
                offset: 0,
                limit: 10,
            };

            const result = maskContactManagementSearch(input);

            expect(result.data?.[0]?.personalInfo?.firstName).toBe('****');
            expect(result.data?.[0]?.personalInfo?.lastName).toBe('***');
            expect(result.data?.[0]?.personalInfo?.email).toBe(
                '****************'
            );
            expect(result.data?.[0]?.personalInfo?.phoneNumber).toBe(
                '************'
            );
            expect(result.data?.[0]?.personalInfo?.dateOfBirth).toBe(
                '**********'
            );
        });

        it('should mask address fields with asterisks', () => {
            const input: ContactSearchResult = {
                data: [
                    {
                        id: '123',
                        personalInfo: {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john@example.com',
                            phoneNumber: '123-456-7890',
                        },
                        address: {
                            street1: '123 Main St',
                            street2: 'Apt 4',
                            city: 'Springfield',
                            state: 'IL',
                            zipCode: '62701',
                        },
                    },
                ],
            };

            const result = maskContactManagementSearch(input);

            expect(result.data?.[0].address?.street1).toBe('***********');
            expect(result.data?.[0].address?.street2).toBe('*****');
            expect(result.data?.[0].address?.city).toBe('***********');
            expect(result.data?.[0].address?.state).toBe('**');
            expect(result.data?.[0].address?.zipCode).toBe('*****');
        });

        it('should return empty string for undefined required personal info fields', () => {
            const input: ContactSearchResult = {
                data: [
                    {
                        id: '123',
                        personalInfo: {} as any,
                        address: {},
                    },
                ],
            };

            const result = maskContactManagementSearch(input);

            expect(result.data?.[0].personalInfo?.firstName).toBe('');
            expect(result.data?.[0].personalInfo?.lastName).toBe('');
            expect(result.data?.[0].personalInfo?.email).toBe('');
            expect(result.data?.[0].personalInfo?.phoneNumber).toBe('');
        });

        it('should return undefined for optional fields when not present', () => {
            const input: ContactSearchResult = {
                data: [
                    {
                        id: '123',
                        personalInfo: {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john@example.com',
                            phoneNumber: '123-456-7890',
                        },
                        address: {},
                    },
                ],
            };

            const result = maskContactManagementSearch(input);

            expect(result.data?.[0].personalInfo?.dateOfBirth).toBeUndefined();
            expect(result.data?.[0].address?.street1).toBeUndefined();
            expect(result.data?.[0].address?.street2).toBeUndefined();
            expect(result.data?.[0].address?.city).toBeUndefined();
            expect(result.data?.[0].address?.state).toBeUndefined();
            expect(result.data?.[0].address?.zipCode).toBeUndefined();
        });

        it('should handle empty data array', () => {
            const input: ContactSearchResult = {
                data: [],
                total: 0,
                offset: 0,
                limit: 10,
            };

            const result = maskContactManagementSearch(input);

            expect(result.data).toEqual([]);
            expect(result.total).toBe(0);
        });

        it('should handle undefined data', () => {
            const input: ContactSearchResult = {
                total: 0,
                offset: 0,
                limit: 10,
            };

            const result = maskContactManagementSearch(input);

            expect(result.data).toBeUndefined();
        });

        it('should preserve non-masked fields', () => {
            const input: ContactSearchResult = {
                data: [
                    {
                        id: '123',
                        partyId: 'party-456',
                        personalInfo: {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john@example.com',
                            phoneNumber: '123-456-7890',
                            gender: PersonalInfo.gender.MALE,
                            maritalStatus: PersonalInfo.maritalStatus.YES,
                        },
                        address: {
                            street1: '123 Main St',
                        },
                        status: ContactSearchResponse.status.ACTIVE,
                        createdAt: '2023-01-01T00:00:00Z',
                        updatedAt: '2023-06-01T00:00:00Z',
                    },
                ],
                total: 1,
                offset: 0,
                limit: 10,
            };

            const result = maskContactManagementSearch(input);

            expect(result.data?.[0].id).toBe('123');
            expect(result.data?.[0].partyId).toBe('party-456');
            expect(result.data?.[0].status).toBe(
                ContactSearchResponse.status.ACTIVE
            );
            expect(result.data?.[0].createdAt).toBe('2023-01-01T00:00:00Z');
            expect(result.data?.[0].updatedAt).toBe('2023-06-01T00:00:00Z');
            expect(result.data?.[0].personalInfo?.gender).toBe(
                PersonalInfo.gender.MALE
            );
            expect(result.data?.[0].personalInfo?.maritalStatus).toBe(
                PersonalInfo.maritalStatus.YES
            );
            expect(result.total).toBe(1);
            expect(result.offset).toBe(0);
            expect(result.limit).toBe(10);
        });

        it('should handle multiple contacts', () => {
            const input: ContactSearchResult = {
                data: [
                    {
                        id: '1',
                        personalInfo: {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john@example.com',
                            phoneNumber: '111-111-1111',
                        },
                    },
                    {
                        id: '2',
                        personalInfo: {
                            firstName: 'Jane',
                            lastName: 'Smith',
                            email: 'jane@example.com',
                            phoneNumber: '222-222-2222',
                        },
                    },
                ],
                total: 2,
            };

            const result = maskContactManagementSearch(input);

            expect(result.data?.length).toBe(2);
            expect(result.data?.[0].personalInfo?.firstName).toBe('****');
            expect(result.data?.[1].personalInfo?.firstName).toBe('****');
            expect(result.data?.[0].personalInfo?.lastName).toBe('***');
            expect(result.data?.[1].personalInfo?.lastName).toBe('*****');
        });
    });
});
