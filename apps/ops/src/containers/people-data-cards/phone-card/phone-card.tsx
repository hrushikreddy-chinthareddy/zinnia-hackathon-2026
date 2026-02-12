import { SideSheet } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useState } from 'react';

import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import Toggle, {
    ToggleSize,
    ToggleVariant,
} from '@deps/components/toggle/toggle';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import EmptyCard from '@deps/containers/people-data-cards/empty-card/empty-card';
import { PersonCardProps } from '@deps/containers/people-data-cards/people-data-card-props';
import {
    Phones,
    sortPhonesByType,
} from '@deps/containers/people-data-cards/phone-card/phone-card.helpers';
import { SideSheetPhone } from '@deps/containers/people-data-cards/phone-card/side-sheet/side-sheet-phone';
import SideSheetPeopleHeader, {
    SideSheetPeopleHeaderProps,
} from '@deps/containers/people-data-cards/side-sheet-people-header/side-sheet-people-header';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import useAddOrEditPhoneOrEmailClick from '@deps/hooks/user-carrier-specific/useOnEditClick';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import { Phone } from '@zinnia/api-types/types/sor';

import { filterPastEndDate } from '../people-data-cards.utils';
interface OpenSideSheet {
    phone?: Phone;
    header: SideSheetPeopleHeaderProps;
}

const PhoneCard = ({
    editable = false,
    isUserPermissionedToEditCards = false,
    infoOnly,
    party,
    planCode,
    policyNumber,
}: PersonCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.card.phone',
    });
    const { t: tAllFields } = useTranslation();

    const { policyDetails } = useContext(PolicyData);

    const [showAdditional, setShowAdditional] = useState(false);
    const [activeSideSheet, setActiveSideSheet] =
        useState<OpenSideSheet | null>(null);
    const closeSideSheet = () => setActiveSideSheet(null);

    const { phones } = party ?? {};
    const [currentPhones, setCurrentPhones] = useState<Phone[]>(
        sortPhonesByType({ phones: filterPastEndDate(phones) })
    );

    const showToggle = currentPhones.length > 4;

    const openSideSheet = useCallback((params: OpenSideSheet) => {
        setActiveSideSheet(params);
    }, []);

    const onEditClick = useAddOrEditPhoneOrEmailClick<OpenSideSheet>({
        defaultCallback: openSideSheet,
        party,
    });

    const PhonesBody = (
        <div className="grid grid-cols-auto-2 gap-x-8 gap-y-4 md:grid-cols-auto-4">
            <Phones
                onEditClick={onEditClick}
                editable={editable}
                phones={currentPhones}
                showAdditional={showAdditional}
            />
        </div>
    );

    if (infoOnly) return PhonesBody;

    const isUserPermissionedToEditPhone =
        isUserPermissionedToEditCards ?? false;

    return (
        <CardContainer classNames="flex w-full flex-col items-start">
            <div className="flex w-full flex-col md:flex-row md:justify-between">
                <div className="mb-4 flex  items-center">
                    <Typography className="mr-5" variant={TypographyVariant.H2}>
                        {t('label')}
                    </Typography>
                    {editable && isUserPermissionedToEditPhone ? (
                        <NavElement
                            onClick={() =>
                                onEditClick({
                                    header: {
                                        action: NonFinancialTransactionActions.Add,
                                        transaction:
                                            NonFinancialTransactions.Number,
                                        typeTranslation: t(
                                            'general.new'
                                        ) as string,
                                    },
                                })
                            }
                            size={NavElementSize.Small}
                            startIcon={<AddIcon height={20} width={20} />}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                            aria-label={`${tAllFields(
                                'allFields.add'
                            )} ${tAllFields('allFields.phone')}`}
                        >
                            {t('general.add')}
                        </NavElement>
                    ) : editable ? (
                        <TempNavInactive
                            tooltipBody={t(
                                'transactions.permissionDeniedTooltip',
                                {
                                    carrier: policyDetails.carrierName,
                                }
                            )}
                        >
                            {t('general.add')}
                        </TempNavInactive>
                    ) : null}
                </div>

                {showToggle && (
                    <div className="mb-5 flex flex-row items-center">
                        <Toggle
                            size={ToggleSize.Default}
                            variant={ToggleVariant.Default}
                            text={t('general.showAdditional') as string}
                            value={showAdditional}
                            handleToggle={setShowAdditional}
                        />
                    </div>
                )}
            </div>

            {currentPhones.length ? (
                PhonesBody
            ) : (
                <EmptyCard text={t('general.empty') as string} />
            )}
            <SideSheet
                trigger={null}
                open={!!activeSideSheet}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        closeSideSheet();
                    }
                }}
                preventCloseOnOutsideClick={false}
                header={
                    activeSideSheet ? (
                        <SideSheetPeopleHeader
                            action={activeSideSheet.header.action}
                            transaction={activeSideSheet.header.transaction}
                            typeTranslation={
                                activeSideSheet.header.typeTranslation
                            }
                        />
                    ) : undefined
                }
            >
                {activeSideSheet && (
                    <SideSheetPhone
                        onCancel={closeSideSheet}
                        party={party}
                        planCode={planCode}
                        policy={policyDetails.policy}
                        policyNumber={policyNumber}
                        setCurrentPhones={setCurrentPhones}
                        updatePhone={activeSideSheet.phone}
                    />
                )}
            </SideSheet>
        </CardContainer>
    );
};

export default PhoneCard;
