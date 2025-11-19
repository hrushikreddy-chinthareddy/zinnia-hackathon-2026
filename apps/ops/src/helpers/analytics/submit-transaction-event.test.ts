import { cleanup } from '@testing-library/react';
import { ArrangementType, LineOfBusiness } from '@zinnia/api-types/types/sor';

import {
    DOC_CONTEXT,
    TransactionSubmittedEventType,
} from '@deps/types/segment-analytics';

import {
    buildFullSurrenderSubmittedEvent,
    buildNonFinancialTransactionsSubmittedEvent,
    buildOneTimeFinancialTransactionSubmittedEvent,
    buildSystematicProgramSubmittedEvent,
    deriveDocContextFromQuery,
    getAmountFromQuery,
    getCarrierFromPolicy,
    getProductKindFromPolicy,
} from './submit-transaction-event';
import { EventConfig } from './submit-transaction-event-constants';

describe('analytics/submit-transaction-event', () => {
    afterEach(() => cleanup());

    const baseIds = {
        caseId: undefined as unknown as string | undefined,
        sessionId: 'sid-123',
        userId: 'user-789',
    };

    const lifePolicy = {
        carrierId: 'CARR-1',
        product: { lineOfBusiness: LineOfBusiness.LIFE },
    } as any;

    const nonLifePolicy = {
        carrierId: 'CARR-2',
        product: { lineOfBusiness: 999 }, // not LIFE
    } as any;

    describe('helper: getCarrierFromPolicy', () => {
        it('returns carrierId when present', () => {
            expect(getCarrierFromPolicy(lifePolicy)).toBe('CARR-1');
        });

        it('returns undefined when policy is undefined', () => {
            expect(getCarrierFromPolicy(undefined as any)).toBeUndefined();
        });
    });

    describe('helper: getProductKindFromPolicy', () => {
        it('returns policy for LIFE', () => {
            expect(getProductKindFromPolicy(lifePolicy)).toBe('policy');
        });

        it('returns contract for non-LIFE or undefined', () => {
            expect(getProductKindFromPolicy(nonLifePolicy)).toBe('contract');
            expect(getProductKindFromPolicy(undefined as any)).toBe('contract');
        });
    });

    describe('helper: deriveDocContextFromQuery', () => {
        it('marks NEW_CASE when caseId missing', () => {
            expect(deriveDocContextFromQuery({})).toEqual({
                doc_context: DOC_CONTEXT.NEW_CASE,
            });
        });

        it('marks EXISTING_CASE when caseId present', () => {
            expect(deriveDocContextFromQuery({ caseId: 'abc' })).toEqual({
                doc_context: DOC_CONTEXT.EXISTING_CASE,
            });
        });
    });

    describe('helper: getAmountFromQuery', () => {
        it('returns amount when requestedAmount is present', () => {
            expect(
                getAmountFromQuery({
                    transactionAmounts: { requestedAmount: 123 },
                })
            ).toEqual({ amount: 123 });
        });

        it('returns empty object when requestedAmount missing', () => {
            expect(
                getAmountFromQuery({ transactionAmounts: {} as any })
            ).toEqual({});
            expect(getAmountFromQuery({} as any)).toEqual({});
        });
    });

    describe('buildNonFinancialTransactionsSubmittedEvent', () => {
        it('builds event with defaults and policy-derived fields', () => {
            const event = buildNonFinancialTransactionsSubmittedEvent({
                transactionSubmittedEventType:
                    TransactionSubmittedEventType.DEATH_CLAIM,
                query: {},
                policy: lifePolicy,
                ...baseIds,
            });

            expect(event).toMatchObject({
                ...EventConfig[TransactionSubmittedEventType.DEATH_CLAIM],
                carrier: 'CARR-1',
                case_id: '',
                product_kind: 'policy',
                authSessionId: 'sid-123',
                user_id: 'user-789',
                userId: 'user-789',
                doc_context: DOC_CONTEXT.NEW_CASE,
            });
        });

        it('handles undefined policy and caseId gracefully', () => {
            const event = buildNonFinancialTransactionsSubmittedEvent({
                transactionSubmittedEventType:
                    TransactionSubmittedEventType.EDIT_ALLOCATIONS,
                query: { caseId: 'case-1' },
                policy: undefined as any,
                ...baseIds,
            });

            expect(event.carrier).toBe('');
            // case_id is derived from the function param, not query.caseId
            expect(event.case_id).toBe('');
            expect(event.product_kind).toBe('contract');
            expect(event.doc_context).toBe(DOC_CONTEXT.EXISTING_CASE);
        });
    });

    describe('buildOneTimeFinancialTransactionSubmittedEvent', () => {
        it('includes amount, doc_context, and policy-derived fields', () => {
            const event = buildOneTimeFinancialTransactionSubmittedEvent({
                transactionSubmittedEventType:
                    TransactionSubmittedEventType.ONE_TIME_PREMIUM,
                query: { transactionAmounts: { requestedAmount: 50 } } as any,
                policy: nonLifePolicy,
                ...baseIds,
            });

            expect(event).toMatchObject({
                ...EventConfig[TransactionSubmittedEventType.ONE_TIME_PREMIUM],
                amount: 50,
                carrier: 'CARR-2',
                case_id: '',
                product_kind: 'contract',
                doc_context: DOC_CONTEXT.NEW_CASE,
            });
        });

        it('omits amount when missing and uses existing case context', () => {
            const event = buildOneTimeFinancialTransactionSubmittedEvent({
                transactionSubmittedEventType:
                    TransactionSubmittedEventType.ONE_TIME_LOAN,
                query: { caseId: 'c-22', transactionAmounts: {} } as any,
                policy: undefined as any,
                ...baseIds,
            });

            expect(event.amount).toBeUndefined();
            // case_id is derived from the function param, not query.caseId
            expect(event.case_id).toBe('');
            expect(event.carrier).toBe('');
            expect(event.product_kind).toBe('contract');
            expect(event.doc_context).toBe(DOC_CONTEXT.EXISTING_CASE);
        });
    });

    describe('buildFullSurrenderSubmittedEvent', () => {
        it('returns expected shape with surrender event config', () => {
            const event = buildFullSurrenderSubmittedEvent({
                query: {},
                policy: lifePolicy,
                ...baseIds,
            });

            expect(event).toMatchObject({
                ...EventConfig[TransactionSubmittedEventType.SURRENDER],
                carrier: 'CARR-1',
                product_kind: 'policy',
                case_id: '',
                doc_context: DOC_CONTEXT.NEW_CASE,
            });
        });
    });

    describe('buildSystematicProgramSubmittedEvent', () => {
        const common = {
            policy: nonLifePolicy,
            ...baseIds,
        };

        const mkQuery = (arrangementType: ArrangementType, extras: any = {}) =>
            ({
                caseId: 'case-xyz',
                systematicProgram: {
                    arrangementType,
                    amount: 10,
                    frequency: 'M',
                    ...extras,
                },
            } as any);

        it('maps PAYMENT arrangement actions add/update/cancel', () => {
            const addEvent = buildSystematicProgramSubmittedEvent({
                query: mkQuery(ArrangementType.PAYMENT),
                action: 'add',
                ...common,
            });
            const updateEvent = buildSystematicProgramSubmittedEvent({
                query: mkQuery(ArrangementType.PAYMENT),
                action: 'update',
                ...common,
            });
            const cancelEvent = buildSystematicProgramSubmittedEvent({
                query: mkQuery(ArrangementType.PAYMENT),
                action: 'cancel',
                ...common,
            });

            expect(addEvent).toMatchObject({
                ...EventConfig[
                    TransactionSubmittedEventType.SYSTEMATIC_PAYMENT_SETUP
                ],
                autopay_frequency: 'M',
                amount: 10,
            });
            expect(updateEvent).toMatchObject({
                ...EventConfig[
                    TransactionSubmittedEventType.SYSTEMATIC_PAYMENT_UPDATE
                ],
            });
            expect(cancelEvent).toMatchObject({
                ...EventConfig[
                    TransactionSubmittedEventType.SYSTEMATIC_PAYMENT_CANCEL
                ],
            });
        });

        it('maps WITHDRAWAL arrangement actions add/update/cancel', () => {
            const addEvent = buildSystematicProgramSubmittedEvent({
                query: mkQuery(ArrangementType.WITHDRAWAL),
                action: 'add',
                ...common,
            });
            const updateEvent = buildSystematicProgramSubmittedEvent({
                query: mkQuery(ArrangementType.WITHDRAWAL),
                action: 'update',
                ...common,
            });
            const cancelEvent = buildSystematicProgramSubmittedEvent({
                query: mkQuery(ArrangementType.WITHDRAWAL),
                action: 'cancel',
                ...common,
            });

            expect(addEvent).toMatchObject({
                ...EventConfig[
                    TransactionSubmittedEventType.SYSTEMATIC_WITHDRAWAL_SETUP
                ],
            });
            expect(updateEvent).toMatchObject({
                ...EventConfig[
                    TransactionSubmittedEventType.SYSTEMATIC_WITHDRAWAL_UPDATE
                ],
            });
            expect(cancelEvent).toMatchObject({
                ...EventConfig[
                    TransactionSubmittedEventType.SYSTEMATIC_WITHDRAWAL_CANCEL
                ],
            });
        });

        it('maps RMD arrangement actions add/update/cancel', () => {
            const addEvent = buildSystematicProgramSubmittedEvent({
                query: mkQuery(ArrangementType.REQUIREDMINIMUMDISTRIBUTION),
                action: 'add',
                ...common,
            });
            const updateEvent = buildSystematicProgramSubmittedEvent({
                query: mkQuery(ArrangementType.REQUIREDMINIMUMDISTRIBUTION),
                action: 'update',
                ...common,
            });
            const cancelEvent = buildSystematicProgramSubmittedEvent({
                query: mkQuery(ArrangementType.REQUIREDMINIMUMDISTRIBUTION),
                action: 'cancel',
                ...common,
            });

            expect(addEvent).toMatchObject({
                ...EventConfig[
                    TransactionSubmittedEventType.SYSTEMATIC_RMD_SETUP
                ],
            });
            expect(updateEvent).toMatchObject({
                ...EventConfig[
                    TransactionSubmittedEventType.SYSTEMATIC_RMD_UPDATE
                ],
            });
            expect(cancelEvent).toMatchObject({
                ...EventConfig[
                    TransactionSubmittedEventType.SYSTEMATIC_RMD_CANCEL
                ],
            });
        });
    });
});
