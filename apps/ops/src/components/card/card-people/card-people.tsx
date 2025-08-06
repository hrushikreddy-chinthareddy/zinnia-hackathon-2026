import { PartyStatus } from '@zinnia/api-types/types/sor';
import { useEffect, useRef } from 'react';

import ClickContainer from '@deps/components/click-container/click-container';
import PartyTag from '@deps/components/party/party-tag';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Title, { TitleVariant } from '@deps/components/title/title';
import {
    getBeneficiaryColor,
    getContigentColor,
} from '@deps/containers/people-card-container/people-card-container.helpers';
import {
    BeneficiaryType,
    AgentType,
} from '@deps/containers/people-card-container/people-card-container.types';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { TagKey } from '@deps/types/components';

export interface CardPeopleProps {
    name: string;
    tags?: TagKey[];
    selectedTags?: string[];
    allocation?: string;
    onClick?: () => void;
    accessibilityText: string;
    accessibilityClickText: string;
    beneficiaryType?: BeneficiaryType | AgentType;
    index: number;
    shouldFocus?: boolean;
    isSelected?: boolean;
    //TODO: remove the optional for testId, but for now we'll keep it optional for backwards compatibility
    testId?: string;
    partyStatus?: PartyStatus;
    disabled?: boolean;
    cardDisableTooltip?: string;
}

const PREFERRED_TAG_ORDER = {
    Owner: 1,
    Annuitant: 2,
    Insured: 3,
    Payor: 4,
    'Primary Beneficiary': 5,
    'Contingent Beneficiary': 6,
    Agent: 7,
    Payee: 8,
    'Third Party Designee': 9,
} as { [key: string]: number };

const getBeneficiaryColorByType = (
    type: BeneficiaryType | AgentType,
    index: number
) => {
    return type === BeneficiaryType.PRIMARY || type === AgentType.PRIMARY
        ? getBeneficiaryColor(index)
        : getContigentColor(index);
};

const sortTags = (tags?: TagKey[]) => {
    if (!tags?.length) return null;

    // sort by preferred tag order retaining any unlisted tags at the end
    const sortedArray = [...tags].sort((a, b) => {
        const indexA =
            PREFERRED_TAG_ORDER[a.text ?? ''] ?? Number.MAX_SAFE_INTEGER;
        const indexB =
            PREFERRED_TAG_ORDER[b.text ?? ''] ?? Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
    });

    return sortedArray;
};

const CardPeople = ({
    name,
    allocation,
    onClick,
    selectedTags = [],
    tags,
    accessibilityText = '',
    index,
    accessibilityClickText,
    beneficiaryType = BeneficiaryType.NONE,
    shouldFocus = false,
    isSelected = false,
    testId,
    partyStatus,
    disabled,
    cardDisableTooltip,
}: CardPeopleProps) => {
    const hasAllocation = !isNullEmptyOrUndefined(allocation || '');
    const allocationBgClasses = hasAllocation
        ? getBeneficiaryColorByType(beneficiaryType, index)
        : '';

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (shouldFocus && ref.current) {
            ref.current.focus();
        }
    }, [shouldFocus]);

    const sortedTags = sortTags(tags as TagKey[]);

    return (
        <ClickContainer
            ariaLabel={`${accessibilityClickText}, ${sortedTags
                ?.map((tag) => tag.text)
                .join(', ')}`}
            classes="h-fit"
            divRef={ref}
            isSelected={isSelected}
            onClick={onClick}
            testId={testId}
            disabled={disabled}
            cardDisableTooltip={cardDisableTooltip}
        >
            {sortedTags && (
                <div className="flex flex-wrap gap-1">
                    {sortedTags.map((tag, index) => {
                        const isSelected =
                            selectedTags?.length > 0 &&
                            selectedTags.indexOf(
                                tag.text?.toLocaleLowerCase() ?? ''
                            ) > -1;

                        return (
                            <PartyTag
                                partyStatus={partyStatus}
                                key={tag.text ?? '' + index}
                                isSelected={isSelected}
                                text={tag.text ?? ''}
                            />
                        );
                    })}
                </div>
            )}
            <div className="prose flex content-center justify-between">
                <Title
                    variant={TitleVariant.SubTitleAlt}
                    className="mt-2 text-start leading-[27px]"
                >
                    <PiiWrapper>{name}</PiiWrapper>
                </Title>

                {hasAllocation && (
                    <div className="flex gap-2" data-testid="allocation">
                        <div
                            className={`${allocationBgClasses} h-[16px] w-[16px] self-center rounded`}
                        ></div>
                        <p className="front-bold self-center text-[18px] leading-8">
                            {allocation}%
                            <span className="sr-only">{accessibilityText}</span>
                        </p>
                    </div>
                )}
            </div>
        </ClickContainer>
    );
};

export default CardPeople;
