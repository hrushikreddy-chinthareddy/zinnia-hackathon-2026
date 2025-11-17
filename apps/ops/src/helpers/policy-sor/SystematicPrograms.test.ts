import { cleanup } from '@testing-library/react';
import {
    ArrangementType,
    SystematicProgram as SysProg,
} from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import {
    SystematicPrograms,
    TempAnnuityArrangementTypes,
} from './SystematicPrograms';

describe('helpers/policy-sor/SystematicPrograms', () => {
    afterEach(() => cleanup());

    const mkProg = (overrides: Partial<SysProg> = {}): SysProg =>
        ({
            arrangementId: 'A1',
            arrangementType: ArrangementType.PAYMENT,
            reason: 'PREMIUM' as any,
            status: 'ACTIVE' as any,
            nextProgramDate: undefined,
            ...overrides,
        } as any);

    describe('constructor indexing and getters', () => {
        it('indexes only ACTIVE programs by type, reason, and id', () => {
            const active = mkProg({
                arrangementId: 'ID1',
                reason: 'ALLOCATIONS' as any,
                arrangementType: ArrangementType.WITHDRAWAL,
            });
            const inactive = mkProg({
                arrangementId: 'ID2',
                reason: 'EMAIL' as any,
                status: 'INACTIVE' as any,
            });
            const s = new SystematicPrograms([active, inactive]);

            // all getter returns all provided programs
            expect(s.all).toHaveLength(2);

            // active is indexed
            expect(s.getProgramsById('ID1')).toBe(active);
            expect(s.getProgramsByReason('ALLOCATIONS' as any)).toBe(active);
            expect(s.getProgramsByType(ArrangementType.WITHDRAWAL)).toEqual([
                active,
            ]);

            // inactive should not be indexed
            expect(s.getProgramsById('ID2')).toBeUndefined();
            expect(s.getProgramsByReason('EMAIL' as any)).toBeUndefined();
        });

        it('returns undefined/empty for falsy inputs', () => {
            const s = new SystematicPrograms([]);
            expect(s.getProgramsById('')).toBeUndefined();
            expect(s.getProgramsByReason('' as any)).toBeUndefined();
            expect(s.getProgramsByType('' as any)).toEqual([]);
        });

        it('supports temp annuity arrangement types in type lookup', () => {
            const annuity = mkProg({
                arrangementType: TempAnnuityArrangementTypes.WITHDRAWAL as any,
            });
            const s = new SystematicPrograms([annuity]);
            expect(
                s.getProgramsByType(TempAnnuityArrangementTypes.WITHDRAWAL)
            ).toEqual([annuity]);
        });
    });

    describe('getNextProgramByType', () => {
        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-15T00:00:00.000Z'));
        });
        afterAll(() => jest.useRealTimers());

        it('returns the first program when no future dates exist (current reducer behavior)', () => {
            const past = mkProg({
                nextProgramDate: dayjs('2024-12-01').format(
                    ZAHARA_API_DATE_FORMAT
                ),
            });
            const s = new SystematicPrograms([past]);

            expect(s.getNextProgramByType('' as any)).toBeUndefined();
            expect(s.getNextProgramByType(ArrangementType.PAYMENT)).toEqual(
                past
            );
        });

        it('keeps the first program when comparing past vs future dates (current reducer behavior)', () => {
            const past = mkProg({
                arrangementType: ArrangementType.PAYMENT,
                nextProgramDate: dayjs('2024-12-30').format(
                    ZAHARA_API_DATE_FORMAT
                ),
            });
            const farther = mkProg({
                arrangementType: ArrangementType.PAYMENT,
                arrangementId: 'FUT2',
                nextProgramDate: dayjs('2025-03-01').format(
                    ZAHARA_API_DATE_FORMAT
                ),
            });
            const nearer = mkProg({
                arrangementType: ArrangementType.PAYMENT,
                arrangementId: 'FUT1',
                nextProgramDate: dayjs('2025-02-01').format(
                    ZAHARA_API_DATE_FORMAT
                ),
            });

            const s = new SystematicPrograms([past, farther, nearer]);
            const next = s.getNextProgramByType(ArrangementType.PAYMENT);
            expect(next?.arrangementId).toBe('A1');
        });

        it('falls back correctly when some programs lack nextProgramDate', () => {
            const noDate = mkProg({
                arrangementType: ArrangementType.LOANREPAYMENT,
                arrangementId: 'NODATE',
            });
            const future = mkProg({
                arrangementType: ArrangementType.LOANREPAYMENT,
                arrangementId: 'DATE',
                nextProgramDate: dayjs('2025-06-01').format(
                    ZAHARA_API_DATE_FORMAT
                ),
            });

            const s = new SystematicPrograms([noDate, future]);
            const next = s.getNextProgramByType(ArrangementType.LOANREPAYMENT);
            expect(next?.arrangementId).toBe('DATE');
        });
    });
});
