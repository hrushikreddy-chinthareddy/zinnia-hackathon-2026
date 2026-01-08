import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    POM_QUERY_PREFIXES,
    useGetProducerByIdQuery,
} from '@deps/components/illustrations/helpers/hooks/pom';
import { AGENT_SEARCH_QUERY_PREFIXES } from '@deps/components/illustrations/helpers/queries/agent-search/constants';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { CombinedQueryResult } from '@deps/hooks/combined-query';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { AgentFieldContextProvider } from './agent-field-context';
import { GenericAgentField } from './generic-agent-field';
import { AgentOption } from './types';
import { useLegacyAgentSearchResults } from './use-agent-options-from-selling-codes';
import { useAgentSearchResults } from './use-agent-search-results';
import { useAgentSearchResultsForSuperIllustrator } from './use-agent-search-results-for-super-illustrator';

const useAgentOptions = (
    searchQuery: string
): CombinedQueryResult<AgentOption[] | undefined> => {
    const { featureFlags } = useOptimizely();
    const improvedAgentSearchEnabled =
        featureFlags[FEATURE_FLAGS.ILLUSTRATIONS_IMPROVED_AGENT_SEARCH];
    const { isSuperIllustrator } = usePermissionsContext();

    const legacyAgentSearchResults = useLegacyAgentSearchResults(searchQuery);

    const agentSearchResults = useAgentSearchResults(searchQuery);
    const agentSearchResultsForSuperIllustrator =
        useAgentSearchResultsForSuperIllustrator(searchQuery);

    if (isSuperIllustrator) {
        return agentSearchResultsForSuperIllustrator;
    }

    if (improvedAgentSearchEnabled) {
        return agentSearchResults;
    }

    return legacyAgentSearchResults;
};

/**
 * Effect that fetches the missing selling codes for the selected agent
 */
const useSubscribeToProducerData = (
    selectedAgent: AgentOption | undefined,
    onSelectAgent: (agentOption: AgentOption) => void
) => {
    const selectedAgentLookupId = selectedAgent?.lookupId || selectedAgent?.npn;

    const { data: agentData } = useGetProducerByIdQuery(
        selectedAgentLookupId,
        selectedAgent?.carrierShortName
    );

    useEffect(() => {
        if (!selectedAgent) {
            // Do nothing if there's no selected agent
            return;
        }

        const newSellingCodes = Object.values(
            agentData?.carrierSellingCodeRoles ?? {}
        )
            .flat()
            .map(({ sellingCode }) => sellingCode);

        const { npn, lookupId } = selectedAgent;

        if (
            selectedAgentLookupId &&
            ![npn, lookupId].includes(selectedAgentLookupId)
        ) {
            // Sanity check, this code should never execute
            console.error(`${lookupId} is not in ${[npn, lookupId]}`);
            return;
        }

        const oldSellingcodeSet = new Set(selectedAgent?.sellingCodes);
        const newSellingCodeSet = new Set(newSellingCodes);

        const hasNewSellingCodes =
            newSellingCodeSet.symmetricDifference(oldSellingcodeSet).size;

        onSelectAgent({
            ...selectedAgent,
            // Update agent details
            ...(agentData
                ? {
                      firstName:
                          agentData?.firstName ?? selectedAgent?.firstName,
                      lastName: agentData?.lastName ?? selectedAgent?.lastName,
                      npn:
                          agentData?.nationalProducerNumber ??
                          selectedAgent?.npn,
                  }
                : {}),
            // Combine both sellingCode sets
            ...(hasNewSellingCodes
                ? {
                      sellingCodes: Array.from(
                          oldSellingcodeSet.union(newSellingCodeSet)
                      ),
                  }
                : {}),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAgent, agentData, onSelectAgent]);
};

type AgentFieldProps = {
    value: AgentOption | undefined;
    onSelectAgent: (option: AgentOption) => void;
    editable: boolean;
};

export const AgentField = ({
    value,
    editable,
    onSelectAgent,
}: AgentFieldProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();
    useSubscribeToProducerData(value, onSelectAgent);

    const { data, isLoading, isFetching } = useAgentOptions(searchQuery);

    const handleSearch = useCallback((query: string) => {
        [
            POM_QUERY_PREFIXES.GET_DOWNLINE_BY_SELLING_CODE,
            POM_QUERY_PREFIXES.GET_PRODUCERS_BY_NAME_AND_CARRIER,
            AGENT_SEARCH_QUERY_PREFIXES.AGENT_SEARCH_PREFIX,
        ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));

        setSearchQuery(query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const contextValue = useMemo(
        () => ({
            agentDetails: value,
            agentOptions: data,
            selectAgent: onSelectAgent,
            search: handleSearch,
            searchQuery: searchQuery,
            isLoading,
            isFetching,
            error: undefined, // TODO: handle errors
        }),
        [
            value,
            searchQuery,
            data,
            isLoading,
            isFetching,
            onSelectAgent,
            handleSearch,
        ]
    );

    return (
        <AgentFieldContextProvider value={contextValue}>
            <GenericAgentField editable={editable} />
        </AgentFieldContextProvider>
    );
};
