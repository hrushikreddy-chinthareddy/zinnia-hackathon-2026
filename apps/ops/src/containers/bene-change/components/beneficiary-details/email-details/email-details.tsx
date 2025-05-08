import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { TranslationFiles } from '@deps/config/translations';
import { Email } from '@deps/models/policy/sor-policy';

import { INITIAL_EMAIL } from './email-details.helpers';

export interface EmailDetailsProps {
    setCurrentEmails: Dispatch<SetStateAction<Email[]>>;
    updateEmail?: Email;
    index: number;
    isReadOnly?: boolean;
}

export default function EmailDetails({ setCurrentEmails, updateEmail, index, isReadOnly }: EmailDetailsProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange.beneDetails.email' });

    //const [action, setAction] = useState(updateEmail ? NonFinancialTransactionActions.Edit : NonFinancialTransactionActions.Add);
    const [email, setEmail] = useState<Email>(updateEmail ?? INITIAL_EMAIL);
    const [currentErrors] = useState<any>();

    useEffect(() => {
        setCurrentEmails(prevState => {
            prevState.splice(index, 1, { ...prevState[index], ...email });
            return prevState;
        });
    }, [email, index, setCurrentEmails]);

    return (
        <div>
            <div className="mb-3 grid w-full grid-cols-3">
                <Field
                    aria-label={t('labels.email') as string}
                    label={t('labels.email') as string}
                    message={currentErrors?.emailAddress}
                    onChange={event => {
                        setEmail(prevState => ({ ...prevState, emailAddress: event.target.value }));
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={email.emailAddress || ''}
                    maxLength={48}
                    variant={isReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                />
            </div>
        </div>
    );
}
