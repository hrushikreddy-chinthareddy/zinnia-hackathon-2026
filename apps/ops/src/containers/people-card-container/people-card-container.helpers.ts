import { TagKey } from '@deps/types/components';

import { BeneficiaryType, AgentType } from './people-card-container.types';

export const getBeneficiaryColor = (index: number) => {
    if (index === 9) {
        return 'bg-lime-300';
    } else if (index === 8) {
        return 'bg-aqua-800';
    } else if (index === 7) {
        return 'bg-gray-500';
    } else if (index === 6) {
        return 'bg-yellow-800';
    } else if (index === 5) {
        return 'bg-cerulean-600';
    } else if (index === 4) {
        return 'bg-orange-500';
    } else if (index === 3) {
        return 'bg-aqua-400';
    } else if (index === 2) {
        return 'bg-red-600';
    } else if (index === 1) {
        return 'bg-yellow-400';
    } else {
        return 'bg-fuchsia-600';
    }
};

export const getContigentColor = (index: number) => {
    if (index === 5) {
        return 'bg-fuchsia-400';
    } else if (index === 4) {
        return 'bg-cerulean-400';
    } else if (index === 3) {
        return 'bg-primary';
    } else if (index === 2) {
        return 'bg-lime-400';
    } else if (index === 1) {
        return 'bg-red-400';
    } else {
        return 'bg-yellow-300';
    }
};

export const tagsToBeneficiaryType = (tags: TagKey[]) => {
    const tagHasText = (query: string) =>
        tags.some((tag) => tag.text?.toLowerCase().includes(query));
    const queries = [
        'agent of record',
        'servicing agent',
        'contingent',
        'primary',
        'agent',
    ];
    const [
        hasAgentOfRecord,
        hasServicingAgent,
        hasContingent,
        hasPrimary,
        hasAgent,
    ] = queries.map(tagHasText);

    // Check in order of specificity to avoid false matches
    if (hasAgentOfRecord) {
        return AgentType.PRIMARY;
    }
    if (hasServicingAgent || (hasAgent && !hasPrimary && !hasContingent)) {
        return AgentType.AGENT;
    }
    if (hasContingent) {
        return BeneficiaryType.CONTINGENT;
    }
    if (hasPrimary) {
        return BeneficiaryType.PRIMARY;
    }

    return BeneficiaryType.NONE;
};
