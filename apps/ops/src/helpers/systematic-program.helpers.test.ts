import { cleanup } from '@testing-library/react';
import { Frequency } from '@zinnia/api-types/types/sor';

import { getFrequency, getPaymentType } from './systematic-program.helpers';

describe('helpers/systematic-program.helpers', () => {
    const t = jest.fn((key: any) => {
        if (Array.isArray(key)) {
            return `translated:${key[0]}`;
        }
        return `translated:${key}`;
    }) as any;

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    describe('getPaymentType', () => {
        it('returns null when paymentType is null', () => {
            expect(getPaymentType(null as any, t)).toBeNull();
            expect(t).not.toHaveBeenCalled();
        });

        it('uses lowercased key with fallback array and returns translation (e.g., ACH)', () => {
            const out = getPaymentType('ACH' as any, t);
            expect(out).toBe('translated:payeeSummaryCard.paymentType.ach');
            expect(t).toHaveBeenCalledWith([
                'payeeSummaryCard.paymentType.ach',
                'ACH',
            ]);
        });

        it('works with other values and preserves original as fallback (e.g., CHECK)', () => {
            const out = getPaymentType('CHECK' as any, t);
            expect(out).toBe('translated:payeeSummaryCard.paymentType.check');
            expect(t).toHaveBeenCalledWith([
                'payeeSummaryCard.paymentType.check',
                'CHECK',
            ]);
        });
    });

    describe('getFrequency', () => {
        it('returns translated annual', () => {
            const out = getFrequency(Frequency.ANNUAL, t as any);
            expect(out).toBe('translated:systematicProgram.frequency.annual');
            expect(t).toHaveBeenCalledWith(
                'systematicProgram.frequency.annual'
            );
        });

        it('returns translated daily', () => {
            const out = getFrequency(Frequency.DAILY, t as any);
            expect(out).toBe('translated:systematicProgram.frequency.daily');
            expect(t).toHaveBeenCalledWith('systematicProgram.frequency.daily');
        });

        it('returns translated everyTwoWeeks for EVERYTWOWEEKS', () => {
            expect(t).toHaveBeenCalledWith(
                'systematicProgram.frequency.everyTwoWeeks'
            );
        });

        it('returns translated monthly', () => {
            const out = getFrequency(Frequency.MONTHLY, t as any);
            expect(out).toBe('translated:systematicProgram.frequency.monthly');
            expect(t).toHaveBeenCalledWith(
                'systematicProgram.frequency.monthly'
            );
        });

        it('returns translated semiAnnual', () => {
            const out = getFrequency(Frequency.SEMIANNUAL, t as any);
            expect(out).toBe(
                'translated:systematicProgram.frequency.semiAnnual'
            );
            expect(t).toHaveBeenCalledWith(
                'systematicProgram.frequency.semiAnnual'
            );
        });

        it('returns translated oneTime for SINGLEPAYMENT', () => {
            const out = getFrequency(Frequency.SINGLEPAYMENT, t as any);
            expect(out).toBe('translated:systematicProgram.frequency.oneTime');
            expect(t).toHaveBeenCalledWith(
                'systematicProgram.frequency.oneTime'
            );
        });

        it('returns translated quarterly', () => {
            const out = getFrequency(Frequency.QUARTERLY, t as any);
            expect(out).toBe(
                'translated:systematicProgram.frequency.quarterly'
            );
            expect(t).toHaveBeenCalledWith(
                'systematicProgram.frequency.quarterly'
            );
        });

        it('returns empty string on unknown frequency', () => {
            const out = getFrequency(999 as any, t as any);
            expect(out).toBe('');
        });
    });
});
