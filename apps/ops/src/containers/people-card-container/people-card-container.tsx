import { useContext } from 'react';

import CardPeople from '@deps/components/card/card-people/card-people';
import { ChipEnterContext } from '@deps/contexts/ChipEnterContext';
import { goTo } from '@deps/helpers/routing.helper';
import { safeString, toTitleCase } from '@deps/helpers/string.helper';
import { PartyType } from '@deps/models/policy/sor-policy';
import { TagKey } from '@deps/types/components';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { BeneficiaryType, PeopleCardContainerProps, PeopleCardData } from './people-card-container.types';
import { NameTag } from '../people-sub-page/people-sub-page.helpers';

interface MapDataToPeopleProps {
    chipEntered: boolean;
    index: number;
    party: NameTag;
    peopleCard: PeopleCardData;
    isRereg?: boolean;
}

const tagsToBeneficiaryType = (tags: TagKey[]) => {
    const isPrimary = tags.filter(tag => tag.text?.toLocaleLowerCase().indexOf('primary') !== -1)?.length;
    const isContigent = tags.filter(tag => tag.text?.toLocaleLowerCase().indexOf('contigent') !== -1)?.length;

    if (isPrimary) {
        return BeneficiaryType.PRIMARY;
    }

    if (isContigent) {
        return BeneficiaryType.CONTIGENT;
    }

    return BeneficiaryType.NONE;
};

const mapDataToPeopleCard = ({ chipEntered, index, party, peopleCard, isRereg }: MapDataToPeopleProps) => {
    const { partyType, firstName, lastName, fullName, tags, beneficiaryPercentage, partyId } = party;
    const { selectedTagList, accessibilityText, accessibilityClickText, planCode, policyNumber, isBeneficiarySelected, router } =
        peopleCard;

    let name = '';
    switch (partyType) {
        case PartyType.INDIVIDUAL:
            name = toTitleCase(`${firstName ?? DEFAULT_ERROR_STRING} ${lastName ?? DEFAULT_ERROR_STRING}`);
            break;
        case PartyType.ORGANIZATION:
            name = toTitleCase(safeString(fullName)); // DEPU-3511 -> old code used to be safeString(organizationCode);
            break;
        case PartyType.TRUST:
            name = toTitleCase(safeString(fullName));
            break;
    }

    return (
        <CardPeople
            key={index}
            index={index}
            tags={tags}
            name={name}
            selectedTags={selectedTagList}
            beneficiaryType={tagsToBeneficiaryType(tags)}
            allocation={isBeneficiarySelected ? beneficiaryPercentage?.toString() : ''}
            accessibilityText={accessibilityText}
            accessibilityClickText={accessibilityClickText}
            onClick={() => !isRereg && goTo(`/policies/${planCode}/${policyNumber}/people/${partyId}`, router)}
            shouldFocus={index === 0 && chipEntered}
            partyStatus={party.partyStatus}
        />
    );
};

const PeopleCardContainer = ({ filteredData, peopleCardData, classNames, isRereg }: PeopleCardContainerProps) => {
    const { chipEntered } = useContext(ChipEnterContext);
    return (
        <div className={`grid h-fit w-full grid-cols-1 gap-2 md:grid-cols-2 ${classNames}`}>
            {filteredData.map((nameTag, index) =>
                mapDataToPeopleCard({ chipEntered, index, party: nameTag, peopleCard: peopleCardData, isRereg })
            )}
        </div>
    );
};

export default PeopleCardContainer;
