import { Tag } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import ClickContainer from '@deps/components/click-container/click-container';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { FormattedPhone } from '@deps/containers/people-data-cards/phone-card/phone-card.helpers';
import { AddressTypeAndAddress } from '@deps/containers/small-data-card/address-data/address-data';

import { PartyAddressCard } from '../utils/roles-contract-types';


export interface IRoleAddressCardProps {
    partyCardsLits: PartyAddressCard[];
    title: string;
    selectedIds: number[];
    handleClick: (ids: number) => void;
    isAddressChange?: boolean;
    isAddressCard?: boolean;
    addEmail?: (email: string) => void;
}

export const RoleAddressCard = ({
    partyCardsLits,
    title,
    selectedIds,
    handleClick,
    isAddressChange = true,
    isAddressCard = true,
}: IRoleAddressCardProps) => {

    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });

    return (
        <>
            <Typography variant={TypographyVariant.LabelLg}>{title}</Typography>
            <div className="mb-5 grid auto-rows-fr grid-cols-1 gap-2 lg:grid-cols-3">
                {partyCardsLits.map((card, index) => (
                    card.address && <ClickContainer
                        classes={clsx(
                            ' w-min',
                            {
                                'border-primary hover:border-primary ': selectedIds.includes(index),
                            },
                            'min-w-[300px]'
                        )}
                        ariaLabel={`${card?.address?.addressType}`}
                        onClick={() => handleClick(index)}
                        key={`container-${index}`}
                        isSelected={selectedIds.includes(index)}
                    >
                        <div key={index}>
                            <div className="flex flex-wrap gap-1">
                                {card.tags.map((tag, index) => {
                                    return <Tag key={tag.text ?? '' + index} text={tag.text ?? ''} />;
                                })}
                            </div>
                            {(card?.firstName || card?.lastName) && (
                                <Typography variant={TypographyVariant.BodySm} className="py-2">
                                    <PiiWrapper>{`${card?.firstName} ${card?.lastName}`}</PiiWrapper>
                                </Typography>
                            )}
                            {isAddressCard && card?.address ? (
                                <AddressTypeAndAddress
                                    key={card.address.addressId}
                                    address={card.address}
                                    addressType={card?.address.addressType ?? ''}
                                    isAddressChange={isAddressChange}
                                />
                            ) : null}
                            {!isAddressCard && card?.email && (
                                <div>
                                    <div>
                                        <Label
                                            className="h-6 leading-4.5"
                                            label={t('correspondence.email')}
                                            variant={LabelVariant.FieldLabel}
                                        />
                                    </div>
                                    <Typography variant={TypographyVariant.BodySm} className="py-0 break-all">
                                        <PiiWrapper>{`${card?.email}`}</PiiWrapper>
                                    </Typography>
                                </div>
                            )}
                            {isAddressCard && card?.homePhone ? <FormattedPhone phone={card.homePhone}></FormattedPhone> : null}
                        </div>
                    </ClickContainer>
                ))}
            </div>
        </>
    );
};
