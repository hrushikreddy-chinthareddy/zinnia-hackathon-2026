import { ChipX, Label, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import xss from 'xss';

import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
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
        if (!val) {
            return;
        }
        const emailError = validateEmail(val);

        if (emails.length >= 5) {
            setError(error => ({ ...error, submit: t('correspondence.errors.maxEmails') as string }));
            return;
        }
        if (emailError) {
            setError(error => ({ ...error, submit: t(emailError) as string }));
            return;
        }

        if (emails.includes(val)) {
            setError(error => ({ ...error, submit: t('correspondence.errors.duplicateEmailInCC') as string }));
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

    const helpInformation = (
        <Tooltip
            placement={TooltipPlacement.TopRight}
            trigger={<CircleInfoIcon onClick={e => e.preventDefault()} height={'16px'} width={'16px'} className="text-primary" />}
        >
            {t('correspondence.additionalRecipientTooltip') as string}
        </Tooltip>
    );
    return (
        <div className={classNames}>
            <Label labelFor={'additional-recipient'} interactiveElements={[helpInformation]}>
                {t(`correspondence.ccEmail`)}
            </Label>

            <div className={`border-2 border-gray-200 px-2 pt-2 mt-1 rounded-lg`}>
                {emails.map(email => (
                    <ChipX label={email as string} key={email} onDelete={() => deleteEmail(email)} className="my-1" />
                ))}
                <Field
                    onChange={e => {
                        setEmail(xss(e?.target?.value?.trim()) ?? '');
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
