import { KeysOfUnion } from 'type-fest';

import {
    IndexUniversalLifeScenario,
    RiderOutputCoverageValues,
    TermLifeScenario,
} from '@deps/queries/api/v3/illustrations/types';

import { riderNamesMap } from './rider-names-map';

export const getRiderNames = ({
    assumed,
}: {
    assumed: TermLifeScenario | IndexUniversalLifeScenario;
}) => {
    const hasRiders = Object.keys(assumed.coverages).length > 1;
    if (!hasRiders) {
        return [];
    }

    const riders = (
        Object.keys(assumed.coverages) as KeysOfUnion<
            typeof assumed.coverages
        >[]
    )
        .filter(
            (
                coverageName
            ): coverageName is Exclude<typeof coverageName, 'base'> =>
                coverageName !== 'base'
        )
        .filter(
            (riderName) =>
                (
                    assumed.coverages as unknown as Record<
                        string,
                        RiderOutputCoverageValues | undefined
                    >
                )[riderName]?.isIncludedInQuote ?? false
        )
        .map((riderName) => riderNamesMap?.[riderName] ?? riderName);

    return riders;
};
