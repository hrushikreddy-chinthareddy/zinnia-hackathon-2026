import { NextRouter } from 'next/router';

import { NameTag } from '../people-sub-page/people-sub-page.helpers';

export interface PeopleCardContainerProps {
    filteredData: NameTag[];
    peopleCardData: PeopleCardData;
    classNames?: string;
    isRereg?: boolean;
    disabled?: boolean;
    cardDisableTooltip?: string;
    type?: BeneficiaryType | AgentType;
}

export interface PeopleCardData {
    accessibilityClickText: string;
    accessibilityText: string;
    isBeneficiarySelected: boolean;
    isAgentSelected?: boolean;
    planCode?: string;
    policyNumber?: string;
    router: NextRouter;
    selectedTagList: string[];
}

export enum BeneficiaryType {
    NONE = '',
    PRIMARY = 'BENEFICIARY',
    CONTIGENT = 'CONTINGENTBENEFICIARY',
}

export enum AgentType {
    NONE = '',
    PRIMARY = 'AGENTOFRECORD',
    AGENT = 'AGENT',
}
