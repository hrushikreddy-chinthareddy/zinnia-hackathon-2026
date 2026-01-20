import { useTranslation } from 'next-i18next';
import { useState, useCallback, useContext } from 'react';

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
import SideSheetPeopleHeader, {
    SideSheetPeopleHeaderProps,
} from '@deps/containers/people-data-cards/side-sheet-people-header/side-sheet-people-header';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import useAddOrEditPhoneOrEmailClick from '@deps/hooks/user-carrier-specific/useOnEditClick';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import { Email } from '@zinnia/api-types/types/sor';

import { Emails, sortEmailsByType } from './email-card.helpers';
import { PersonCardProps } from '../people-data-card-props';
import { filterPastEndDate } from '../people-data-cards.utils';
import SideSheetEmail from './side-sheet/side-sheet-email';

interface OpenSideSheet {
    email?: Email;
    header: SideSheetPeopleHeaderProps;
}

const EmailCard = ({
    editable = false,
    isUserPermissionedToEditCards = false,
    infoOnly,
    party,
    planCode,
    policyNumber,
}: PersonCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.card.email',
    });
    const { t: tAllFields } = useTranslation();
    const { policyDetails } = useContext(PolicyData);

    const sideSheet = useSideSheetContext();

    const [showAdditional, setShowAdditional] = useState(false);

    const { emails } = party ?? {};
    const [currentEmails, setCurrentEmails] = useState<Email[]>(
        sortEmailsByType({ emails: filterPastEndDate(emails) })
    );

    const showAdditionalToggle = currentEmails.length > 4;

    const openSideSheet = useCallback(
        ({
            email,
            header: { action, transaction, typeTranslation },
        }: OpenSideSheet) => {
            sideSheet.changeSideSheetContent(
                <SideSheetPeopleHeader
                    action={action}
                    transaction={transaction}
                    typeTranslation={typeTranslation}
                />,
                <SideSheetEmail
                    isOnlyEmail={currentEmails.length === 1}
                    onCancel={() => sideSheet.handleOpen(false)}
                    party={party}
                    planCode={planCode}
                    policyNumber={policyNumber}
                    setCurrentEmails={setCurrentEmails}
                    updateEmail={email}
                />
            );
            sideSheet.handleOpen(true);
        },
        [sideSheet, currentEmails.length, party, planCode, policyNumber]
    );

    const onEditClick = useAddOrEditPhoneOrEmailClick<OpenSideSheet>({
        defaultCallback: openSideSheet,
        party,
    });

    const EmailsBody = (
        <div className="grid grid-cols-auto-2 gap-x-8 gap-y-4 md:grid-cols-auto-4">
            <Emails
                editable={editable}
                emails={currentEmails}
                onEditClick={onEditClick}
                showAdditional={showAdditional}
            />
        </div>
    );

    if (infoOnly) return EmailsBody;

    const isUserPermissionedToEditEmail =
        isUserPermissionedToEditCards ?? false;
    return (
        <CardContainer classNames="flex w-full flex-col items-start">
            <div className="flex w-full flex-col md:flex-row md:justify-between">
                <div className="mb-4 flex items-center">
                    <Typography className="mr-5" variant={TypographyVariant.H2}>
                        {t('label')}
                    </Typography>
                    {editable && isUserPermissionedToEditEmail ? (
                        <NavElement
                            onClick={() =>
                                onEditClick({
                                    header: {
                                        action: NonFinancialTransactionActions.Add,
                                        transaction:
                                            NonFinancialTransactions.Email,
                                        typeTranslation: t(
                                            'general.new'
                                        ) as string,
                                    },
                                })
                            }
                            size={NavElementSize.Small}
                            startIcon={<AddIcon width={20} height={20} />}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                            aria-label={`${tAllFields(
                                'allFields.add'
                            )} ${tAllFields('allFields.email')}`}
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

                {showAdditionalToggle && (
                    <div className="mb-5 flex flex-row items-center">
                        <Toggle
                            ariaLabel={
                                t('emailOptions.showAdditional') as string
                            }
                            handleToggle={setShowAdditional}
                            size={ToggleSize.Default}
                            text={t('emailOptions.showAdditional') as string}
                            value={showAdditional}
                            variant={ToggleVariant.Default}
                        />
                    </div>
                )}
            </div>
            {currentEmails.length ? (
                EmailsBody
            ) : (
                <EmptyCard text={t('general.empty') as string} />
            )}
        </CardContainer>
    );
};

export default EmailCard;
