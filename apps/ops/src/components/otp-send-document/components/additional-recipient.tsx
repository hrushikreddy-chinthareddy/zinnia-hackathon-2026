import { AssistiveText, AssistiveTextVariant, ChipX } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import xss from 'xss';

import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';

import { validateEmail } from '../correspondence';

type AdditionalRecipientProps = {
    classNames?: string;
    emails: string[];
    setEmails: React.Dispatch<React.SetStateAction<string[]>>;
};
const AdditionalRecipient = ({ classNames, emails, setEmails }: AdditionalRecipientProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string>('');

    const addEmail = (val: string) => {
        const emailError = validateEmail(val);

        if (emails.length >= 5) {
            setError(t('correspondence.maxEmails') as string);
            return;
        }
        if (emailError) {
            setError(t(emailError) as string);
            return;
        }

        setEmails([...emails, val]);
        setError('');
        setEmail('');
    };

    const deleteEmail = (val: string) => {
        setError('');
        setEmails(emails.filter(email => email !== val));
    };

    return (
        <div className={classNames}>
            <Typography variant={TypographyVariant.Label} className="w-full">
                {t(`correspondence.email`)}
            </Typography>
            <div className={`border-2 border-gray-200 px-4 pt-2 rounded-lg`}>
                {emails.map(email => (
                    <ChipX label={email as string} key={email} onDelete={() => deleteEmail(email)} className="my-1" />
                ))}
                <Field
                    onChange={e => {
                        setEmail(xss(e?.target?.value));
                    }}
                    handleEnterKey={() => {
                        addEmail(email);
                    }}
                    value={email as string}
                    size={FieldSize.Default}
                    type={FieldType.BaseActive}
                    className="!border-0 max-w-xs"
                />
            </div>
            {error && <AssistiveText text={error} variant={AssistiveTextVariant.Error} className="mt-2" />}
        </div>
    );
};

export default AdditionalRecipient;
