import { Address } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import NavElement, { NavElementType, NavElementVariant, NavElementSize } from '@deps/components/nav-element/nav-element';
import Toggle, { ToggleSize, ToggleVariant } from '@deps/components/toggle/toggle';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import SideSheetAddress from '@deps/containers/people-data-cards/address-card//side-sheet/side-sheet-address';
import { Addresses, sortAddressesByType } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import EmptyCard from '@deps/containers/people-data-cards/empty-card/empty-card';
import { PersonCardProps } from '@deps/containers/people-data-cards/people-data-card-props';
import SideSheetPeopleHeader, {
    SideSheetPeopleHeaderProps,
} from '@deps/containers/people-data-cards/side-sheet-people-header/side-sheet-people-header';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { NonFinancialTransactionActions, NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';

interface OpenSideSheet {
    address?: Address;
    header: SideSheetPeopleHeaderProps;
}

const AddressCard = ({ editable = false, infoOnly, party, planCode, policyNumber }: PersonCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'people.card.address' });

    const sideSheet = useSideSheetContext();

    const [showAdditional, setShowAdditional] = useState(false);

    const { addresses, preferredAddressIndicator } = party ?? {};
    const [currentAddresses, setCurrentAddresses] = useState<Address[]>(sortAddressesByType({ addresses, preferredAddressIndicator }));

    const showToggle = currentAddresses.length > 4;

    const openSideSheet = ({ address, header: { action, transaction, typeTranslation } }: OpenSideSheet) => {
        sideSheet.changeSideSheetContent(
            <SideSheetPeopleHeader action={action} transaction={transaction} typeTranslation={typeTranslation} />,
            <SideSheetAddress
                isCurrentMailingAddress={party?.preferredAddressIndicator === address?.addressId}
                isOnlyAddress={currentAddresses?.length === 1}
                onCancel={() => sideSheet.handleOpen(false)}
                party={party}
                planCode={planCode}
                policyNumber={policyNumber}
                setCurrentAddresses={setCurrentAddresses}
                updateAddress={address ?? undefined}
            />
        );
        sideSheet.handleOpen(true);
    };

    const AddressesBody = (
        <div className="grid grid-cols-auto-2 gap-x-8 gap-y-4 md:grid-cols-auto-4">
            <Addresses
                addresses={currentAddresses}
                editable={editable}
                infoOnly={infoOnly}
                onEditClick={openSideSheet}
                preferredAddressIndicator={party?.preferredAddressIndicator}
                showAdditional={showAdditional}
            />
        </div>
    );

    if (infoOnly) return AddressesBody;

    return (
        <CardContainer classNames="flex w-full flex-col items-start">
            <div className="flex w-full flex-col md:flex-row md:justify-between">
                <div className="mb-4 flex flex-row items-center">
                    <Typography className="mr-5" variant={TypographyVariant.H2}>
                        {t('label')}
                    </Typography>

                    {editable && (
                        <NavElement
                            onClick={() =>
                                openSideSheet({
                                    header: {
                                        action: NonFinancialTransactionActions.Add,
                                        transaction: NonFinancialTransactions.Address,
                                        typeTranslation: t('general.new') as string,
                                    },
                                })
                            }
                            size={NavElementSize.Small}
                            startIcon={<AddIcon height={20} width={20} />}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                        >
                            {t('general.add')}
                        </NavElement>
                    )}
                </div>

                {showToggle && (
                    <div className="mb-5 flex flex-row items-center">
                        <Toggle
                            ariaLabel={t('general.showAdditional') as string}
                            handleToggle={setShowAdditional}
                            size={ToggleSize.Default}
                            text={t('general.showAdditional') as string}
                            value={showAdditional}
                            variant={ToggleVariant.Default}
                        />
                    </div>
                )}
            </div>

            {currentAddresses.length ? AddressesBody : <EmptyCard text={t('general.empty') as string} />}
        </CardContainer>
    );
};

export default AddressCard;
