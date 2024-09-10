import { NextRouter } from 'next/router';

import { NameTag } from '../people-sub-page/people-sub-page.helpers';

export interface PeopleCardContainerProps {
    filteredData: NameTag[];
    peopleCardData: PeopleCardData;
    classNames?: string;
}

export interface PeopleCardData {
    accessibilityClickText: string;
    accessibilityText: string;
    isBeneficiarySelected: boolean;
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
