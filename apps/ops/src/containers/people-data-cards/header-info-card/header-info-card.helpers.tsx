import { Email, EmailType } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { v4 as uuid4 } from 'uuid';

import Content, { ContentVariant } from '@deps/components/content/content';
import IconButton from '@deps/components/icon-button/icon-button';
import Label, { LabelVariant } from '@deps/components/label/label';
import PendingTag from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/pending-tag';
import { EmailWithPending } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/types';
import { SideSheetPeopleHeaderProps } from '@deps/containers/people-data-cards/side-sheet-people-header/side-sheet-people-header';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';

import { sortEmailsByType } from '../email-card/email-card.helpers';

export interface SortEmailsByType {
    emails?: Email[];
}

interface EmailsProps {
    editable?: boolean;
    emails: Email[];
    onEditClick: (params: {
        email: Email;
        header: SideSheetPeopleHeaderProps;
    }) => void;
    showAdditional: boolean;
}

export const Emails = ({
    editable,
    emails,
    onEditClick,
    showAdditional,
}: EmailsProps) => {
    const { t } = useTranslation();

    if (!emails.length) return null;

    const filteredEmails = emails.filter((email) => !!email.emailAddress);
    const sortedEmails = sortEmailsByType({ emails: filteredEmails });

    return (
        <>
            {sortedEmails.map((email, index) => {
                const {
                    emailId,
                    emailType = EmailType.PERSONAL,
                    isPending,
                } = email as EmailWithPending;
                const emailIdKey = emailId ?? uuid4();
                const emailTypeKey =
                    emailType?.toLocaleLowerCase() ??
                    EmailType.PERSONAL.toLocaleLowerCase();

                return (
                    <div
                        className={clsx('flex flex-col', {
                            hidden: !showAdditional && index > 3,
                        })}
                        key={emailIdKey}
                    >
                        <div className="flex items-center gap-1">
                            <Label
                                id={`people-email-card-${emailIdKey}`}
                                label={t(
                                    `people.card.email.emailOptions.${emailTypeKey}`
                                )}
                                variant={LabelVariant.FieldLabel}
                            />
                            <PendingTag />
                            {isPending && <PendingTag />}
                            {editable && !isPending && (
                                <IconButton
                                    disabled
                                    aria-describedby={`people-email-card-${emailIdKey}`}
                                    onClick={() =>
                                        onEditClick({
                                            email,
                                            header: {
                                                action: NonFinancialTransactionActions.Edit,
                                                transaction:
                                                    NonFinancialTransactions.Email,
                                                typeTranslation: t(
                                                    `people.card.email.emailOptions.${emailTypeKey}`
                                                ) as string,
                                            },
                                        })
                                    }
                                >
                                    <EditIcon height={16} width={16} />
                                    <span className="sr-only">
                                        {t('people.card.general.edit')}
                                    </span>
                                </IconButton>
                            )}
                        </div>
                        <Content
                            pii={true}
                            details={email.emailAddress?.toLocaleLowerCase()}
                            truncate={true}
                            variant={ContentVariant.BodySm}
                        />
                    </div>
                );
            })}
        </>
    );
};
