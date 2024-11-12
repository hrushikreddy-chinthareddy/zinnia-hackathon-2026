import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { v4 as uuid4 } from 'uuid';

import Content, { ContentVariant } from '@deps/components/content/content';
import IconButton from '@deps/components/icon-button/icon-button';
import Label, { LabelVariant } from '@deps/components/label/label';
import { EmailWithPending } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/non-financial-transactions.helper';
import PendingTag from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/pending-tag';
import { SideSheetPeopleHeaderProps } from '@deps/containers/people-data-cards/side-sheet-people-header/side-sheet-people-header';
import { isEndDated } from '@deps/helpers/date.helper';
import { Email, EmailType } from '@deps/models/policy/sor-policy';
import { NonFinancialTransactionActions, NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';

export interface SortEmailsByType {
    emails?: Email[];
}

interface EmailsProps {
    editable?: boolean;
    emails: Email[];
    onEditClick: (params: { email: Email; header: SideSheetPeopleHeaderProps }) => void;
    showAdditional: boolean;
}

export const Emails = ({ editable, emails, onEditClick, showAdditional }: EmailsProps) => {
    const { t } = useTranslation();

    if (!emails.length) return null;

    const filteredEmails = emails.filter(email => !!email.emailAddress);
    const sortedEmails = sortEmailsByType({ emails: filteredEmails });

    return (
        <>
            {sortedEmails.map((email, index) => {
                const { emailId, emailType = EmailType.PERSONAL, isPending } = email as EmailWithPending;
                const emailIdKey = emailId ?? uuid4();
                const emailTypeKey = emailType?.toLocaleLowerCase() ?? EmailType.PERSONAL.toLocaleLowerCase();

                return (
                    <div className={clsx('flex flex-col', { hidden: !showAdditional && index > 3 })} key={emailIdKey}>
                        <div className="flex items-center gap-1">
                            <Label
                                id={`people-email-card-${emailIdKey}`}
                                label={t(`people.card.email.emailOptions.${emailTypeKey}`)}
                                variant={LabelVariant.FieldLabel}
                            />
                            {isPending && <PendingTag />}
                            {editable && !isPending && (
                                <IconButton
                                    aria-describedby={`people-email-card-${emailIdKey}`}
                                    onClick={() =>
                                        onEditClick({
                                            email,
                                            header: {
                                                action: NonFinancialTransactionActions.Edit,
                                                transaction: NonFinancialTransactions.Email,
                                                typeTranslation: t(`people.card.email.emailOptions.${emailTypeKey}`) as string,
                                            },
                                        })
                                    }
                                >
                                    <EditIcon height={16} width={16} />
                                    <span className="sr-only">{t('people.card.general.edit')}</span>
                                </IconButton>
                            )}
                        </div>
                        <Content pii={true} details={email.emailAddress} truncate={true} variant={ContentVariant.BodySm} />
                    </div>
                );
            })}
        </>
    );
};

export const sortEmailsByType = ({ emails }: SortEmailsByType): Email[] => {
    if (!emails) return [];

    const validEmails = emails?.filter(email => !isEndDated(email.endDate)) ?? [];

    const businessEmails: Email[] = [];
    const otherEmails: Email[] = [];
    const personalEmails: Email[] = [];
    const unknownEmails: Email[] = [];

    validEmails.forEach(validEmail => {
        switch (validEmail.emailType) {
            case EmailType.BUSINESS:
                businessEmails.push(validEmail);
                break;
            case EmailType.OTHER:
                otherEmails.push(validEmail);
                break;
            case EmailType.PERSONAL:
                personalEmails.push(validEmail);
                break;
            default:
                unknownEmails.push(validEmail);
                break;
        }
    });

    return [...personalEmails, ...businessEmails, ...otherEmails, ...unknownEmails];
};
