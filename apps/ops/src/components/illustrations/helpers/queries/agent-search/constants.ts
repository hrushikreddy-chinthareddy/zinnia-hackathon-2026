const AGENT_SEARCH_PREFIX = ['POM', 'agentSearch'] as const;

export const AGENT_SEARCH_QUERY_PREFIXES = {
    AGENT_SEARCH_PREFIX,

    FOR_SINGLE_PRODUCER: [...AGENT_SEARCH_PREFIX, 'forSingleProducer'],
    FOR_AGENCY: [...AGENT_SEARCH_PREFIX, 'forNearestAgency'],
    FOR_DISTRICT: [...AGENT_SEARCH_PREFIX, 'forNearestDistrict'],

    FOR_AGENT: [...AGENT_SEARCH_PREFIX, 'forAgent'],
    FOR_AGENCY_OWNER: [...AGENT_SEARCH_PREFIX, 'forAgencyOwner'],
    FOR_DISTRICT_MANAGER: [...AGENT_SEARCH_PREFIX, 'forDistrictManager'],
    FOR_DISTRICT_STAFF: [...AGENT_SEARCH_PREFIX, 'forDistrictStaff'],

    BY_SELLING_CODE: [...AGENT_SEARCH_PREFIX, 'bySellingCode'],
    SELF_ASSIGN: [...AGENT_SEARCH_PREFIX, 'selfAssign'],
} as const;
