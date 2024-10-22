import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import xss from 'xss';

import ChipX from '@deps/components/chip/chip-x';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

type EmailAddressProps = {
    email: string;
    error?: FormValidationErrors;
    setEmail: (val: string) => void;
};
const EmailAddress = ({ email, setEmail, error }: EmailAddressProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });

    const [tags, setTags] = useState<string[]>([]);
    const addEmail = (val: string) => {
        if (val) {
            setTags([...tags, val]);
        }
    };
    return (
        <div className="border-2 border-gray-200 px-4 pt-2 max-w-xs ">
            <Field
                label="Email"
                isMultiple={true}
                onChange={e => {
                    setEmail(xss(e?.target?.value));
                }}
                handleEnterKey={() => {
                    addEmail(email);
                    setEmail('');
                }}
                value={email as string}
                size={FieldSize.Default}
                type={FieldType.BaseActive}
                className="!border-0 max-w-xs "
                message={error?.email}
                variant={error?.email ? FieldVariant.Error : FieldVariant.Default}
            >
                {tags.map(tag => (
                    <ChipX label={tag as string} key={tag} onDelete={() => setTags(tags.filter(t => t !== tag))} />
                ))}
            </Field>
        </div>
    );
};

export default EmailAddress;
