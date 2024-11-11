import { ChipX, PopoverPlacement } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import xss from 'xss';

import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import Popover from '@deps/components/popover/popover';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import { validateEmail } from '../correspondence';

type AdditionalRecipientProps = {
    classNames?: string;
    emails: string[];
    setEmails: React.Dispatch<React.SetStateAction<string[]>>;
    setError: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
};
const AdditionalRecipient = ({ classNames, emails, setEmails, setError }: AdditionalRecipientProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });
    const [email, setEmail] = useState('');

    const addEmail = (val: string) => {
        const emailError = validateEmail(val);

        if (emails.length >= 5) {
            setError(error => ({ ...error, submit: t('correspondence.maxEmails') as string }));
            return;
        }
        if (emailError) {
            setError(error => ({ ...error, submit: t(emailError) as string }));
            return;
        }

        if (emails.includes(val)) {
            setError(error => ({ ...error, submit: t('correspondence.duplicateEmail') as string }));
            return;
        }

        setEmails([...emails, val]);
        setError(error => ({ ...error, submit: '' }));
        setEmail('');
    };

    const deleteEmail = (val: string) => {
        setError(error => ({ ...error, submit: '' }));
        setEmails(emails.filter(email => email !== val));
    };

    return (
        <div className={classNames}>
            <Typography variant={TypographyVariant.Label} className="w-full">
                {t(`correspondence.email`)}
                {'  '}
                <Popover
                    placement={PopoverPlacement.TopRight}
                    title={t('correspondence.additionalRecipientTooltipTitle') as string}
                    body={t('correspondence.additionalRecipientTooltipBody') as string}
                >
                    <CircleInfoIcon height={'16px'} width={'16px'} className="text-primary" />
                </Popover>
            </Typography>

            <div className={`border-2 border-gray-200 px-2 pt-1 rounded-lg`}>
                {emails.map(email => (
                    <ChipX label={email as string} key={email} onDelete={() => deleteEmail(email)} className="my-1" />
                ))}
                <Field
                    onChange={e => {
                        setEmail(xss(e?.target?.value.trim()));
                    }}
                    handleEnterKey={() => {
                        addEmail(email);
                    }}
                    onKeyPress={e => {
                        if (e.key === ',' || e.key === ';') {
                            e.preventDefault();
                            addEmail(email);
                        }
                    }}
                    onBlur={e => {
                        e.preventDefault();
                        addEmail(email);
                    }}
                    value={email as string}
                    size={FieldSize.Default}
                    type={FieldType.BaseActive}
                    className="!border-0 max-w-xs"
                />
            </div>
        </div>
    );
};

export default AdditionalRecipient;
