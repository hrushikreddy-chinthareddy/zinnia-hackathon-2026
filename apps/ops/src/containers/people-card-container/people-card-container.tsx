import { PartyType } from '@zinnia/api-types/types/sor';
import { useContext } from 'react';

import CardPeople from '@deps/components/card/card-people/card-people';
import { ChipEnterContext } from '@deps/contexts/ChipEnterContext';
import { goTo } from '@deps/helpers/routing.helpers';
import { safeString, toTitleCase } from '@deps/helpers/string.helpers';
import { TagKey } from '@deps/types/components';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import {
    BeneficiaryType,
    PeopleCardContainerProps,
    PeopleCardData,
    AgentType,
} from './people-card-container.types';
import { NameTag } from '../people-sub-page/people-sub-page.helpers';

interface MapDataToPeopleProps {
    chipEntered: boolean;
    index: number;
    party: NameTag;
    peopleCard: PeopleCardData;
    isRereg?: boolean;
    disabled?: boolean;
    cardDisableTooltip?: string;
    type?: BeneficiaryType | AgentType;
}

const tagsToBeneficiaryType = (tags: TagKey[]) => {
    const isPrimary = tags.filter(
        (tag) => tag.text?.toLocaleLowerCase().indexOf('primary') !== -1
    )?.length;
    const isContigent = tags.filter(
        (tag) => tag.text?.toLocaleLowerCase().indexOf('contigent') !== -1
    )?.length;
    const isPrimaryAgent = tags.filter(
        (tag) => tag.text?.toLocaleLowerCase().indexOf('agent of record') !== -1
    )?.length;
    const isAgent = tags.filter(
        (tag) =>
            tag.text?.toLocaleLowerCase().indexOf('agent') ||
            tag.text?.toLocaleLowerCase().indexOf('servicing agent') !== -1
    )?.length;

    if (isPrimary) {
        return BeneficiaryType.PRIMARY;
    }
    if (isContigent) {
        return BeneficiaryType.CONTIGENT;
    }
    if (isPrimaryAgent) {
        return AgentType.PRIMARY;
    }
    if (isAgent) {
        return AgentType.AGENT;
    }

    return BeneficiaryType.NONE;
};

const mapDataToPeopleCard = ({
    chipEntered,
    index,
    party,
    peopleCard,
    isRereg,
    type,
}: MapDataToPeopleProps) => {
    const {
        partyType,
        firstName,
        lastName,
        fullName,
        tags,
        beneficiaryPercentage,
        partyId,
        agentPercentage,
    } = party;
    const {
        selectedTagList,
        accessibilityText,
        accessibilityClickText,
        planCode,
        policyNumber,
        isBeneficiarySelected,
        isAgentSelected,
        router,
    } = peopleCard;

    let name = '';
    switch (partyType) {
        case PartyType.INDIVIDUAL:
            if (!firstName && !!fullName) {
                name = toTitleCase(safeString(fullName));
            } else {
                name = toTitleCase(
                    `${firstName ?? DEFAULT_ERROR_STRING} ${
                        lastName ?? DEFAULT_ERROR_STRING
                    }`
                );
            }
            break;
        case PartyType.ORGANIZATION:
            name = toTitleCase(safeString(fullName)); // DEPU-3511 -> old code used to be safeString(organizationCode);
            break;
        case PartyType.TRUST:
            name = toTitleCase(safeString(fullName));
            break;
    }

    let allocationValue: string = '';
    if (isBeneficiarySelected) {
        allocationValue = beneficiaryPercentage?.toString() ?? '0';
    } else if (isAgentSelected) {
        if (type === AgentType.PRIMARY) {
            allocationValue = agentPercentage?.toString() ?? '0';
        } else if (type === AgentType.AGENT) {
            allocationValue = '';
        }
    }

    const convertedTags = tags.map((tag) => ({
        ...tag,
        text: toTitleCase(tag.text),
    }));

    return (
        <CardPeople
            key={index}
            index={index}
            tags={convertedTags}
            name={name}
            selectedTags={selectedTagList}
            beneficiaryType={tagsToBeneficiaryType(tags)}
            allocation={allocationValue}
            accessibilityText={accessibilityText}
            accessibilityClickText={accessibilityClickText}
            onClick={() =>
                !isRereg &&
                goTo(
                    `/policies/${planCode}/${policyNumber}/people/${partyId}`,
                    router
                )
            }
            shouldFocus={index === 0 && chipEntered}
            partyStatus={party.partyStatus}
        />
    );
};

const PeopleCardContainer = ({
    filteredData,
    peopleCardData,
    classNames,
    isRereg,
    type,
}: PeopleCardContainerProps) => {
    const { chipEntered } = useContext(ChipEnterContext);
    return (
        <div
            className={`grid h-fit w-full grid-cols-1 gap-2 md:grid-cols-2 ${classNames}`}
        >
            {filteredData.map((nameTag, index) =>
                mapDataToPeopleCard({
                    chipEntered,
                    index,
                    party: nameTag,
                    peopleCard: peopleCardData,
                    isRereg,
                    type,
                })
            )}
        </div>
    );
};

export default PeopleCardContainer;
