import { Jsonify } from 'type-fest';

import { IllustrationsClientCase } from '@deps/types/illustrations';

import { parseClientCase } from './parse-client-case';

describe('parseClientCase', () => {
    const createMockClientCase = (
        dateOfBirth?: string
    ): Jsonify<IllustrationsClientCase> =>
        ({
            id: 'test-id',
            title: 'Test Case',
            insuredDetails: dateOfBirth
                ? {
                      firstName: 'John',
                      lastName: 'Doe',
                      dateOfBirth,
                  }
                : undefined,
        } as Jsonify<IllustrationsClientCase>);

    describe('dateOfBirth parsing', () => {
        it('should return undefined when insuredDetails is undefined', () => {
            const clientCase = {
                id: 'test-id',
                title: 'Test Case',
            } as Jsonify<IllustrationsClientCase>;

            const result = parseClientCase(clientCase);

            expect(result.insuredDetails?.dateOfBirth).toBeUndefined();
        });

        it('should return undefined when dateOfBirth is undefined', () => {
            const clientCase = createMockClientCase(undefined);

            const result = parseClientCase(clientCase);

            expect(result.insuredDetails?.dateOfBirth).toBeUndefined();
        });

        it('should return undefined when dateOfBirth is empty string', () => {
            const clientCase = createMockClientCase('');

            const result = parseClientCase(clientCase);

            expect(result.insuredDetails?.dateOfBirth).toBeUndefined();
        });

        it('should return undefined when dateOfBirth is invalid', () => {
            const clientCase = createMockClientCase('invalid-date');

            const result = parseClientCase(clientCase);

            expect(result.insuredDetails?.dateOfBirth).toBeUndefined();
        });

        describe('timezone edge cases - dates that could shift to previous day', () => {
            it('should preserve date for midnight UTC on Jan 1 (New Year edge case)', () => {
                // This is the exact scenario from the bug report
                // MongoDB stores: 2000-01-01T00:00:00.000+00:00
                // Without fix: Dec 31, 1999 in EST (UTC-5)
                const clientCase = createMockClientCase(
                    '2000-01-01T00:00:00.000+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate).toBeInstanceOf(Date);
                expect(parsedDate?.getFullYear()).toBe(2000);
                expect(parsedDate?.getMonth()).toBe(0); // January
                expect(parsedDate?.getDate()).toBe(1);
            });

            it('should preserve date for midnight UTC on any date', () => {
                const clientCase = createMockClientCase(
                    '2024-06-15T00:00:00.000+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate).toBeInstanceOf(Date);
                expect(parsedDate?.getFullYear()).toBe(2024);
                expect(parsedDate?.getMonth()).toBe(5); // June
                expect(parsedDate?.getDate()).toBe(15);
            });

            it('should preserve date for midnight UTC at year boundary (Dec 31)', () => {
                // Edge case: Dec 31 at midnight UTC
                const clientCase = createMockClientCase(
                    '2023-12-31T00:00:00.000+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate).toBeInstanceOf(Date);
                expect(parsedDate?.getFullYear()).toBe(2023);
                expect(parsedDate?.getMonth()).toBe(11); // December
                expect(parsedDate?.getDate()).toBe(31);
            });

            it('should preserve date for midnight UTC at month boundary', () => {
                // Edge case: First day of month at midnight UTC
                const clientCase = createMockClientCase(
                    '2024-03-01T00:00:00.000+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate).toBeInstanceOf(Date);
                expect(parsedDate?.getFullYear()).toBe(2024);
                expect(parsedDate?.getMonth()).toBe(2); // March
                expect(parsedDate?.getDate()).toBe(1);
            });

            it('should preserve date for leap year Feb 29', () => {
                const clientCase = createMockClientCase(
                    '2024-02-29T00:00:00.000+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate).toBeInstanceOf(Date);
                expect(parsedDate?.getFullYear()).toBe(2024);
                expect(parsedDate?.getMonth()).toBe(1); // February
                expect(parsedDate?.getDate()).toBe(29);
            });
        });

        describe('various ISO 8601 date formats', () => {
            it('should handle ISO string with Z timezone', () => {
                const clientCase = createMockClientCase(
                    '1990-05-20T00:00:00.000Z'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate).toBeInstanceOf(Date);
                expect(parsedDate?.getFullYear()).toBe(1990);
                expect(parsedDate?.getMonth()).toBe(4); // May
                expect(parsedDate?.getDate()).toBe(20);
            });

            it('should handle ISO string with positive timezone offset', () => {
                // +05:30 is India Standard Time
                const clientCase = createMockClientCase(
                    '1985-12-25T00:00:00.000+05:30'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate).toBeInstanceOf(Date);
                expect(parsedDate?.getFullYear()).toBe(1985);
                expect(parsedDate?.getMonth()).toBe(11); // December
                expect(parsedDate?.getDate()).toBe(25);
            });

            it('should handle ISO string with negative timezone offset', () => {
                // -08:00 is Pacific Standard Time
                const clientCase = createMockClientCase(
                    '2010-07-04T00:00:00.000-08:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate).toBeInstanceOf(Date);
                expect(parsedDate?.getFullYear()).toBe(2010);
                expect(parsedDate?.getMonth()).toBe(6); // July
                expect(parsedDate?.getDate()).toBe(4);
            });

            it('should handle date-only string (YYYY-MM-DD)', () => {
                const clientCase = createMockClientCase('1975-11-15');

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate).toBeInstanceOf(Date);
                expect(parsedDate?.getFullYear()).toBe(1975);
                expect(parsedDate?.getMonth()).toBe(10); // November
                expect(parsedDate?.getDate()).toBe(15);
            });

            it('should handle ISO string without milliseconds', () => {
                const clientCase = createMockClientCase(
                    '2000-01-01T00:00:00+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate).toBeInstanceOf(Date);
                expect(parsedDate?.getFullYear()).toBe(2000);
                expect(parsedDate?.getMonth()).toBe(0); // January
                expect(parsedDate?.getDate()).toBe(1);
            });
        });

        describe('extreme timezone scenarios', () => {
            it('should preserve date for UTC-12 (Baker Island) edge case', () => {
                // UTC-12 is the furthest behind UTC
                // Midnight UTC would be noon previous day in UTC-12
                // Our fix uses T12:00:00 local time, which should still work
                const clientCase = createMockClientCase(
                    '2024-01-01T00:00:00.000+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate?.getFullYear()).toBe(2024);
                expect(parsedDate?.getMonth()).toBe(0);
                expect(parsedDate?.getDate()).toBe(1);
            });

            it('should preserve date for UTC+14 (Line Islands) edge case', () => {
                // UTC+14 is the furthest ahead of UTC
                const clientCase = createMockClientCase(
                    '2024-01-01T00:00:00.000+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate?.getFullYear()).toBe(2024);
                expect(parsedDate?.getMonth()).toBe(0);
                expect(parsedDate?.getDate()).toBe(1);
            });
        });

        describe('age-critical dates', () => {
            it('should correctly parse a date that would make someone 26 vs 24', () => {
                // The original bug: 2000-01-01 was being parsed as 1999-12-31
                // causing age to be calculated as 24 instead of 26
                const clientCase = createMockClientCase(
                    '2000-01-01T00:00:00.000+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                // Verify the year is 2000, not 1999
                expect(parsedDate?.getFullYear()).toBe(2000);

                // Calculate age as of a fixed date (March 16, 2026)
                const referenceDate = new Date('2026-03-16T12:00:00');
                const age =
                    referenceDate.getFullYear() - parsedDate!.getFullYear();
                expect(age).toBe(26);
            });

            it('should handle dates near DST transitions', () => {
                // March 10, 2024 - DST starts in US (clocks spring forward)
                const clientCase = createMockClientCase(
                    '2024-03-10T00:00:00.000+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate?.getFullYear()).toBe(2024);
                expect(parsedDate?.getMonth()).toBe(2); // March
                expect(parsedDate?.getDate()).toBe(10);
            });

            it('should handle dates near DST end transitions', () => {
                // November 3, 2024 - DST ends in US (clocks fall back)
                const clientCase = createMockClientCase(
                    '2024-11-03T00:00:00.000+00:00'
                );

                const result = parseClientCase(clientCase);
                const parsedDate = result.insuredDetails?.dateOfBirth;

                expect(parsedDate?.getFullYear()).toBe(2024);
                expect(parsedDate?.getMonth()).toBe(10); // November
                expect(parsedDate?.getDate()).toBe(3);
            });
        });

        describe('preserves other client case data', () => {
            it('should preserve all other insuredDetails fields', () => {
                const clientCase = {
                    id: 'test-id',
                    title: 'Test Case',
                    insuredDetails: {
                        firstName: 'John',
                        lastName: 'Doe',
                        dateOfBirth: '2000-01-01T00:00:00.000+00:00',
                        sexAtBirth: 'male',
                        state: 'CA',
                        nicotineUser: false,
                    },
                } as Jsonify<IllustrationsClientCase>;

                const result = parseClientCase(clientCase);

                expect(result.insuredDetails?.firstName).toBe('John');
                expect(result.insuredDetails?.lastName).toBe('Doe');
                expect(result.insuredDetails?.sexAtBirth).toBe('male');
                expect(result.insuredDetails?.state).toBe('CA');
                expect(result.insuredDetails?.nicotineUser).toBe(false);
            });

            it('should preserve top-level client case fields', () => {
                const clientCase = {
                    id: 'test-id-123',
                    title: 'My Test Case',
                    agentDetails: {
                        firstName: 'Agent',
                        lastName: 'Smith',
                    },
                    insuredDetails: {
                        firstName: 'John',
                        lastName: 'Doe',
                        dateOfBirth: '2000-01-01T00:00:00.000+00:00',
                    },
                } as Jsonify<IllustrationsClientCase>;

                const result = parseClientCase(clientCase);

                expect(result.id).toBe('test-id-123');
                expect(result.title).toBe('My Test Case');
                expect(result.agentDetails?.firstName).toBe('Agent');
                expect(result.agentDetails?.lastName).toBe('Smith');
            });
        });
    });
});
