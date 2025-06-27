import { Email } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
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
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';

import { Emails, sortEmailsByType } from './email-card.helpers';
import { PersonCardProps } from '../people-data-card-props';
import SideSheetEmail from './side-sheet/side-sheet-email';

interface OpenSideSheet {
    email?: Email;
    header: SideSheetPeopleHeaderProps;
}

const EmailCard = ({
    editable = false,
    infoOnly,
    party,
    planCode,
    policyNumber,
}: PersonCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.card.email',
    });

    const sideSheet = useSideSheetContext();

    const [showAdditional, setShowAdditional] = useState(false);

    const { emails } = party ?? {};
    const [currentEmails, setCurrentEmails] = useState<Email[]>(
        sortEmailsByType({ emails })
    );

    const showAdditionalToggle = currentEmails.length > 4;

    const openSideSheet = ({
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
    };

    const EmailsBody = (
        <div className="grid grid-cols-auto-2 gap-x-8 gap-y-4 md:grid-cols-auto-4">
            <Emails
                editable={editable}
                emails={currentEmails}
                onEditClick={openSideSheet}
                showAdditional={showAdditional}
            />
        </div>
    );

    if (infoOnly) return EmailsBody;

    return (
        <CardContainer classNames="flex w-full flex-col items-start">
            <div className="flex w-full flex-col md:flex-row md:justify-between">
                <div className="mb-4 flex items-center">
                    <Typography className="mr-5" variant={TypographyVariant.H2}>
                        {t('label')}
                    </Typography>
                    {editable && (
                        <NavElement
                            onClick={() =>
                                openSideSheet({
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
                        >
                            {t('general.add')}
                        </NavElement>
                    )}
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
