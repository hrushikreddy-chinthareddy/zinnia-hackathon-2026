import { useContext } from 'react';

import CardPeople from '@deps/components/card/card-people/card-people';
import { ChipEnterContext } from '@deps/contexts/ChipEnterContext';
import { goTo } from '@deps/helpers/routing.helpers';
import { safeString, toTitleCase } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { POM_Models_ProducerType } from '@zinnia/api-types/types/pom';
import { PartyType } from '@zinnia/api-types/types/sor';

import { tagsToBeneficiaryType } from './people-card-container.helpers';
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
        producerType,
        producerName,
        isIrrevocable,
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

    const correlationIdFromRoute =
        typeof router?.query?.correlationId === 'string'
            ? router?.query?.correlationId
            : undefined;

    let name = '';
    switch (partyType) {
        case PartyType.INDIVIDUAL:
            if (producerType === POM_Models_ProducerType.INDIVIDUAL) {
                name = `${toTitleCase(firstName)} ${toTitleCase(lastName)}`;
            } else if (
                producerType === POM_Models_ProducerType.CORPORATION &&
                producerName
            ) {
                name = toTitleCase(producerName);
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
            onClick={() => {
                if (!isRereg) {
                    const query = correlationIdFromRoute
                        ? `?correlationId=${correlationIdFromRoute}`
                        : '';
                    goTo(
                        `/policies/${planCode}/${policyNumber}/people/${partyId}${query}`,
                        router
                    );
                }
            }}
            shouldFocus={index === 0 && chipEntered}
            partyStatus={party.partyStatus}
            isIrrevocable={isIrrevocable}
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
