import { Skeleton } from '@radix-ui/themes';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { HTMLAttributes } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import IconButton from '@deps/components/icon-button/icon-button';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import PopoverOnTruncate from '@deps/components/popover-on-truncate/popover-on-truncate';
import PendingTag from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/pending-tag';
import { AddressWithPending } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/types';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { SideSheetPeopleHeaderProps } from '@deps/containers/people-data-cards/side-sheet-people-header/side-sheet-people-header';
import { formatCityStateZip } from '@deps/helpers/address.helpers';
import { isEndDated } from '@deps/helpers/date.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { mapAddressTypeToTranslation } from '@deps/helpers/translation.helpers';
import { Address, AddressType, PolicyAllOfPartiesItem } from '@deps/models/policy/sor-policy';
import { NonFinancialTransactionActions, NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';

interface AddressesProps {
    addresses: Address[];
    editable?: boolean;
    infoOnly?: boolean;
    onEditClick: (params: { address?: Address; header: SideSheetPeopleHeaderProps }) => void;
    preferredAddressIndicator?: string;
    showAdditional?: boolean;
}

interface FormattedAddressProps {
    address: Address;
    isLoading?: boolean;
}

type SortAddressesByType = Pick<PolicyAllOfPartiesItem, 'addresses' | 'preferredAddressIndicator'>;

export const Addresses = ({ addresses, editable, infoOnly, onEditClick, preferredAddressIndicator, showAdditional }: AddressesProps) => {
    const { t } = useTranslation();

    if (!addresses.length) return null;

    return (
        <>
            {addresses.map((address, index) => {
                const { addressId, addressType, isPending } = address as AddressWithPending;

                const showPreferredAddressMessage = addresses.length > 1 && address.addressId === preferredAddressIndicator && !infoOnly;

                return (
                    <div className={clsx('flex flex-col items-start', { hidden: !showAdditional && index > 3 })} key={addressId}>
                        <div className="flex items-center gap-1">
                            <Label
                                id={`people-address-card-${addressId}`}
                                label={t(mapAddressTypeToTranslation({ addressType, t }))}
                                sentenceCase={false}
                                variant={LabelVariant.FieldLabel}
                            />

                            {isPending && <PendingTag />}
                            {editable && !isPending && (
                                <IconButton
                                    aria-describedby={`people-address-card-${addressId}`}
                                    onClick={() =>
                                        onEditClick({
                                            address,
                                            header: {
                                                action: NonFinancialTransactionActions.Edit,
                                                transaction: NonFinancialTransactions.Address,
                                                typeTranslation: t(mapAddressTypeToTranslation({ addressType, t })) as string,
                                            },
                                        })
                                    }
                                >
                                    <EditIcon height={16} width={16} />
                                    <span className="sr-only">{t('people.card.general.edit')}</span>
                                </IconButton>
                            )}
                        </div>

                        <FormattedAddress address={address} />

                        {showPreferredAddressMessage && (
                            <AssistiveText
                                className="mt-1"
                                text={t('people.card.address.general.mailingAddress')}
                                variant={AssistiveTextVariant.Success}
                            />
                        )}
                    </div>
                );
            })}
        </>
    );
};

export const FormattedAddress = ({ address, isLoading = false, ...rest }: FormattedAddressProps & HTMLAttributes<HTMLDivElement>) => {
    const classes = 'line-clamp-2';

    const { addressLine1, addressLine2, addressLine3, country } = address;

    return (
        <div {...rest}>
            <PopoverOnTruncate title={toTitleCase(addressLine1)}>
                <Skeleton loading={isLoading}>
                    <PiiWrapper className={classes}>
                        <Typography variant={TypographyVariant.BodySm}>{toTitleCase(addressLine1)}</Typography>
                    </PiiWrapper>
                </Skeleton>
            </PopoverOnTruncate>
            {addressLine2 && (
                <PopoverOnTruncate title={toTitleCase(addressLine2)}>
                    <Skeleton loading={isLoading}>
                        <PiiWrapper className={classes}>
                            <Typography variant={TypographyVariant.BodySm}>{toTitleCase(addressLine2)}</Typography>
                        </PiiWrapper>
                    </Skeleton>
                </PopoverOnTruncate>
            )}
            {addressLine3 && (
                <PopoverOnTruncate title={toTitleCase(addressLine3)}>
                    <Skeleton loading={isLoading}>
                        <PiiWrapper className={classes}>
                            <Typography variant={TypographyVariant.BodySm}>{toTitleCase(addressLine3)}</Typography>
                        </PiiWrapper>
                    </Skeleton>
                </PopoverOnTruncate>
            )}
            <PopoverOnTruncate title={toTitleCase(formatCityStateZip(address))}>
                <Skeleton loading={isLoading}>
                    <PiiWrapper className={classes}>
                        <Typography variant={TypographyVariant.BodySm}>{formatCityStateZip(address)}</Typography>
                    </PiiWrapper>
                </Skeleton>
            </PopoverOnTruncate>
            <PopoverOnTruncate title={country}>
                <Skeleton loading={isLoading}>
                    <PiiWrapper className={classes}>
                        <Typography variant={TypographyVariant.BodySm}>{country}</Typography>
                    </PiiWrapper>
                </Skeleton>
            </PopoverOnTruncate>
        </div>
    );
};

export const sortAddressesByType = ({ addresses, preferredAddressIndicator }: SortAddressesByType): Address[] => {
    if (!addresses) return [];

    const validAddresses = addresses?.filter(address => !isEndDated(address.endDate)) ?? [];

    const businessAddresses: Address[] = [];
    const poBoxAddresses: Address[] = [];
    const preferredAddresses: Address[] = [];
    const residenceAddresses: Address[] = [];
    const seasonalAddresses: Address[] = [];
    const unknownAddresses: Address[] = [];

    validAddresses.forEach(address => {
        if (address.addressId === preferredAddressIndicator) {
            preferredAddresses.push(address);
        } else {
            switch (address.addressType) {
                case AddressType.BUSINESS:
                    businessAddresses.push(address);
                    break;
                case AddressType.POBOX:
                    poBoxAddresses.push(address);
                    break;
                case AddressType.RESIDENCE:
                    residenceAddresses.push(address);
                    break;
                case AddressType.SEASONAL:
                    seasonalAddresses.push(address);
                    break;
                default:
                    unknownAddresses.push(address);
                    break;
            }
        }
    });

    return [
        ...preferredAddresses,
        ...residenceAddresses,
        ...poBoxAddresses,
        ...businessAddresses,
        ...seasonalAddresses,
        ...unknownAddresses,
    ];
};
