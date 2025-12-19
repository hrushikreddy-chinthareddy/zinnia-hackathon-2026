import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import { TranslationFiles } from '@deps/config/translations';
import { Email, PreferredCommunicationType } from '@zinnia/api-types/types/sor';

import { INITIAL_EMAIL } from './email-details.helpers';

export interface EmailDetailsProps {
    setCurrentEmails: Dispatch<SetStateAction<Email[]>>;
    updateEmail?: Email;
    index: number;
    isReadOnly?: boolean;
    preferredContactMethod?: string;
}

interface EmailErrors {
    emailAddress?: string;
}

export default function EmailDetails({
    setCurrentEmails,
    updateEmail,
    index,
    isReadOnly,
    preferredContactMethod,
}: EmailDetailsProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.email',
    });
    const { t: t2 } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'allFields',
    });

    //const [action, setAction] = useState(updateEmail ? NonFinancialTransactionActions.Edit : NonFinancialTransactionActions.Add);
    const [email, setEmail] = useState<Email>(updateEmail ?? INITIAL_EMAIL);

    const [currentErrors, setCurrentErrors] = useState<EmailErrors>({});

    useEffect(() => {
        setCurrentEmails((prevState) => {
            prevState.splice(index, 1, { ...prevState[index], ...email });
            return prevState;
        });

        const errors: EmailErrors = {};
        if (preferredContactMethod === PreferredCommunicationType.EMAIL) {
            if (!email.emailAddress || email.emailAddress.trim() === '') {
                errors.emailAddress = t2('formValidationsEmail') as string;
            }
        }
        setCurrentErrors(errors);
    }, [email, index, setCurrentEmails, preferredContactMethod, t2]);

    return (
        <div>
            <div className="mb-3 grid w-full grid-cols-3">
                <Field
                    aria-label={t('labels.email') as string}
                    label={t('labels.email') as string}
                    onChange={(event) => {
                        setCurrentErrors((prevState) => {
                            const { emailAddress, ...errors } = prevState ?? {};
                            return errors;
                        });
                        setEmail((prevState) => ({
                            ...prevState,
                            emailAddress: event.target.value,
                        }));
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={email.emailAddress || ''}
                    maxLength={48}
                    message={currentErrors?.emailAddress}
                    variant={
                        isReadOnly
                            ? FieldVariant.Inactive
                            : currentErrors?.emailAddress
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                    required={
                        preferredContactMethod ===
                        PreferredCommunicationType.EMAIL
                    }
                />
            </div>
        </div>
    );
}
