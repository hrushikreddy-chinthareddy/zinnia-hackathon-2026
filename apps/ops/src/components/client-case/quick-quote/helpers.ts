import dayjs from 'dayjs';
import { PartialDeep } from 'type-fest';
import { v4 as uuid4 } from 'uuid';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    CreateNewTermLineIllustrationPayload,
    TermFixedCostPeriod,
} from '@deps/queries/api/v3/illustrations';
import {
    NO_PARAM_RIDERS,
    PREMIUM_FREE_RIDERS,
    RIDER_CODE_MAP,
    RIDERS_WITH_FACE_AMOUNT,
    NumberOrRange,
    NumberRange,
    QuickQuoteParams,
    SerializedQuickQuoteParams,
    QuickQuoteFormState,
} from '@deps/types/quickQuote';
import { NotAvailabilityReasonField } from '@deps/utils/quick-quotes-rules/types';

/**
 *
 * The data required to build the payload for a single Product
 * Quick quote API call
 */
export type SingleTermProductQuickQuoteParams = {
    planCode: 'TR0101' | 'TL0101';
    termLength: TermFixedCostPeriod;
    classCode: string;
    available: boolean;
    notAvailabilityReasonField: NotAvailabilityReasonField;
};

export const asNumberOrRange = (values: (number | undefined)[]) => {
    const filtered = values.filter((v) => v != null);

    if (!filtered.length) {
        return undefined;
    }

    if (filtered.length == 1) {
        return values[0];
    }

    const finiteValues = filtered.filter((value) => Number.isFinite(value));

    const min = Math.min(...finiteValues);
    const max = Math.max(...finiteValues);

    if (max - min < 0.005) {
        return min;
    }

    return [min, max] as NumberRange;
};

const withPeriodText = (formatted: string, period: string | undefined) => {
    if (!period) {
        return formatted;
    }

    return `${formatted}/${period}`;
};

export const buildRangeText = (
    value: NumberOrRange,
    period: string | undefined
) => {
    if (typeof value === 'number') {
        const formatted = numberFormatify(value);
        return withPeriodText(formatted, period);
    }

    const formatted = value.map((x) => numberFormatify(x));
    return withPeriodText(formatted.join(' — '), period);
};

export const buildQuickQuoteParams = (
    data: QuickQuoteFormState
): QuickQuoteParams => {
    const { riders } = data;

    return {
        ...data,
        riders: Object.fromEntries(
            Object.entries(riders).map(([riderName, riderField]) => {
                if (!riderField.enabled) {
                    return [riderName, false];
                }

                if (riderField.type === 'WITH_FACE_AMOUNT') {
                    return [riderName, riderField.faceAmount];
                }
                return [riderName, true];
            })
        ),
    };
};

export const serializeQuickQuoteParams = ({
    insuredAge,
    sexAtBirth,
    nicotineUser,
    state,
    faceAmount,
    riders,
    premiumFreeRiders,
}: QuickQuoteParams): SerializedQuickQuoteParams => {
    const ridersEntries = [
        ...RIDERS_WITH_FACE_AMOUNT.map(
            (riderName) =>
                [`riders.${riderName}`, riders[riderName]?.toString()] as const
        ),
        ...NO_PARAM_RIDERS.map(
            (riderName) =>
                [`riders.${riderName}`, riders[riderName]?.toString()] as const
        ),
        ...PREMIUM_FREE_RIDERS.map(
            (riderName) =>
                [
                    `premiumFreeRiders.${riderName}`,
                    premiumFreeRiders[riderName]?.toString(),
                ] as const
        ),
    ].filter(([, value]) => value && value !== 'false');

    return {
        sexAtBirth,
        state,
        insuredAge: insuredAge.toString(),
        nicotineUser: nicotineUser ? 'true' : 'false',
        faceAmount: faceAmount.toString(),
        ...Object.fromEntries(ridersEntries),
    };
};

export const buildDefaultFormStateValues = (
    params: QuickQuoteParams
): PartialDeep<QuickQuoteFormState> => {
    const { riders, premiumFreeRiders } = params;

    return {
        ...params,
        premiumFreeRiders: Object.fromEntries(
            PREMIUM_FREE_RIDERS.map((riderName) => [
                riderName,
                riderName in premiumFreeRiders
                    ? premiumFreeRiders[riderName] ?? false
                    : false,
            ])
        ),
        riders: Object.fromEntries([
            ...RIDERS_WITH_FACE_AMOUNT.map(
                (riderName) => [
                    riderName,
                    {
                        type: 'WITH_FACE_AMOUNT',
                        enabled:
                            riderName in riders ? !!riders[riderName] : false,
                        faceAmount:
                            typeof riders[riderName] !== 'number'
                                ? undefined
                                : riders[riderName] || undefined,
                    },
                ],
                ...NO_PARAM_RIDERS.map((riderName) => [
                    riderName,
                    {
                        type: 'NO_PARAMS',
                        enabled:
                            riderName in riders ? !!riders[riderName] : false,
                    },
                ])
            ),
        ]),
    };
};

export const buildNewTermQuickQuotePayload = (
    params: QuickQuoteParams,
    { classCode, planCode, termLength }: SingleTermProductQuickQuoteParams
) => {
    const participantId = uuid4();

    return {
        calculationType: 'INITIAL_QUOTE',
        source: 'zinnia-live',
        // Hard coded to today
        illustrationRequestDate: dayjs().format('YYYY-MM-DD'),
        jurisdiction: params.state,
        planCode,
        coverages: [
            {
                coverageId: 'BASE_COVERAGE',
                currentAmount: params.faceAmount,
                participants: [
                    {
                        participantId,
                        issueAge: params.insuredAge,
                        underwritingClass: classCode,
                        flatExtra: [],
                    },
                ],
            },

            ...RIDERS_WITH_FACE_AMOUNT.filter(
                (riderName) => params.riders[riderName]
            ).map((riderName) => ({
                coverageId: RIDER_CODE_MAP[riderName],
                currentAmount: params.riders[riderName] as number,
                participants: [
                    {
                        participantId,
                        issueAge: params.insuredAge,
                        subStandardRating: 'NONETABLE',
                    },
                ],
            })),
            ...NO_PARAM_RIDERS.filter(
                (riderName) => params.riders[riderName]
            ).map((riderName) => ({
                coverageId: RIDER_CODE_MAP[riderName],
                participants: [
                    {
                        participantId,
                        issueAge: params.insuredAge,
                        subStandardRating: 'NONETABLE',
                    },
                ],
            })),
            ...PREMIUM_FREE_RIDERS.filter(
                (riderName) => params.premiumFreeRiders[riderName]
            ).map((riderName) => ({
                coverageId: RIDER_CODE_MAP[riderName],
                participants: [
                    {
                        participantId,
                        issueAge: params.insuredAge,
                    },
                ],
            })),
        ],
        parties: [
            {
                partyId: participantId,
                partyTypeCode: 'INDIVIDUAL',
                gender: params.sexAtBirth === 'F' ? 'FEMALE' : 'MALE',
                roleCode: 'INSURED',
            },
        ],
        options: {
            solveFor: 'PREMIUM',
            fixedCostPeriod: termLength,
            paymentMode: 'MONTHLY',
            paymentMethod: 'ACH',
        },
    } satisfies CreateNewTermLineIllustrationPayload;
};
