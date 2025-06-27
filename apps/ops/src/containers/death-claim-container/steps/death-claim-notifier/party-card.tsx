import { Tag } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ClickContainer from '@deps/components/click-container/click-container';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';

import { NotifierParty } from '../../death-claim.types';

export interface IPartyCardProps {
    parties: NotifierParty[] | undefined;
    selectedItem: any;
    onCardClick: (value: NotifierParty) => void;
    isNewBene?: boolean;
}

export const PartyCard = ({
    parties,
    selectedItem,
    onCardClick,
    isNewBene,
}: IPartyCardProps) => {
    const { t } = useTranslation();
    const [isSelected, setIsSelcted] = useState<number | null>(
        selectedItem?.party?.partyRoleId || null
    );

    const handleClick = (partyRoleId: number | null, value: NotifierParty) => {
        if (isSelected === partyRoleId) {
            setIsSelcted(null);
            onCardClick({
                ...value,
                party: {
                    partyRole: undefined,
                    partyRoleId: undefined,
                    partyType: undefined,
                    partyId: '',
                    prefix: '',
                    suffix: null,
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    fullName: '',
                    gender: '',
                    dateOfBirth: '',
                    relationshipToInsured: '',
                    phone: {
                        ...value.party.phone,
                    },
                },
            });
        } else {
            setIsSelcted(partyRoleId);
            onCardClick(value);
        }
    };

    useEffect(() => {
        if (isNullEmptyOrUndefined(selectedItem?.party?.partyRoleId)) {
            setIsSelcted(null);
        } else {
            setIsSelcted(selectedItem?.party?.partyRoleId);
        }
    }, [selectedItem]);

    useEffect(() => {
        if (isNewBene) {
            setIsSelcted(null);
        }
    }, [isNewBene]);

    return (
        <>
            {parties?.map((item, index) => (
                <ClickContainer
                    classes={clsx(
                        'flex w-min py-4',
                        {
                            'border-primary hover:border-primary ':
                                item.party.partyRoleId === isSelected,
                        },
                        'min-h-[80px] min-w-[300px]'
                    )}
                    ariaLabel={item.party?.partyRole ?? ''}
                    onClick={() =>
                        handleClick(item?.party?.partyRoleId ?? null, item)
                    }
                    key={`container-${index}`}
                    isSelected={item.party.partyRoleId === isSelected}
                >
                    <div key={index}>
                        <div className="flex flex-wrap gap-1">
                            <Tag
                                key={item.party?.partyRole ?? '' + index}
                                text={
                                    convertToChipText(
                                        item.party?.partyRole,
                                        t
                                    ) ?? ''
                                }
                            />
                        </div>
                        <div>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="py-2"
                            >
                                <PiiWrapper>
                                    {toTitleCase(
                                        [
                                            item.party.firstName,
                                            item.party.lastName,
                                        ]
                                            .filter(Boolean)
                                            .join(' ')
                                    )}
                                </PiiWrapper>
                            </Typography>
                        </div>
                    </div>
                </ClickContainer>
            ))}
        </>
    );
};
