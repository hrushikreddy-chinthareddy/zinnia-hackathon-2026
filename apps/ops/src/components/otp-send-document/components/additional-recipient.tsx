import { PartyRole, PartyType, Policy } from '@zinnia/api-types/types/sor';
import {
    ChipX,
    Label,
    AssistiveText,
    AssistiveTextVariant,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React, { useState, useMemo, useEffect } from 'react';
import xss from 'xss';

import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { RoleAddressCard } from '@deps/containers/address-change-container/components/roles-contract/components/role-address-cards';
import { partyCardsEmail } from '@deps/containers/address-change-container/components/roles-contract/utils/roles-contract-helpers';
import { PartyAddressCard } from '@deps/containers/address-change-container/components/roles-contract/utils/roles-contract-types';
import { AllowedRoleTypesEmail } from '@deps/models/case/send-document';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { browserLogWarn } from '@deps/utils/browser-logging';

import { validateEmail } from '../correspondence';

type AdditionalRecipientProps = {
    classNames?: string;
    emails: string[];
    setEmails: React.Dispatch<React.SetStateAction<string[]>>;
    setError: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
    policy: Policy;
};

const AdditionalRecipient = ({
    classNames,
    emails,
    setEmails,
    setError,
    policy,
}: AdditionalRecipientProps) => {
    const { t: addressChangeT } = useTranslation(undefined, {
        keyPrefix: 'addressChange',
    });
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });

    const [email, setEmail] = useState<string>('');
    const [selectedEmailIndex, setSelectedEmailIndex] = useState<number>(-1);

    const extractedParties = useMemo(() => policy?.parties || [], [policy]);
    const checkCustodialContract = policy?.parties?.find(
        (party) => party.partyType === PartyType.ORGANIZATION
    );
    const roleTypes = useMemo(
        () =>
            checkCustodialContract
                ? [PartyRole.INSURED]
                : AllowedRoleTypesEmail,
        [checkCustodialContract]
    );

    const extractedPartyRoles = useMemo(
        () =>
            policy?.partyRoles?.filter((role) =>
                roleTypes.includes(role?.partyRole ?? '')
            ) || [],
        [policy?.partyRoles, roleTypes]
    );
    const qualificationType = React.useMemo(
        () => policy?.qualificationType ?? '',
        [policy]
    );

    const partyCardsData: PartyAddressCard[] = useMemo(
        () =>
            partyCardsEmail(
                extractedPartyRoles,
                extractedParties,
                qualificationType,
                addressChangeT
            ),
        [
            extractedPartyRoles,
            extractedParties,
            qualificationType,
            addressChangeT,
        ]
    );

    function handleClick(id: number): void {
        setSelectedEmailIndex(id);

        const selectedEmailId = partyCardsData[id]?.email;

        if (selectedEmailId) {
            addEmail(selectedEmailId.trim());
        }
    }

    const addEmail = (val: string) => {
        if (!val) {
            return;
        }
        const emailError = validateEmail(val);

        if (emails.length >= 5) {
            setError((error) => ({
                ...error,
                submit: t('errors.maxEmails') as string,
            }));
            return;
        }
        if (emailError) {
            browserLogWarn('contactCenterRecipientsEmailValidation', {
                payload: val,
                error: t(emailError) as string,
                function: 'correspondence.recipients.validateEmail',
            });
            setError((error) => ({
                ...error,
                submit: t(emailError) as string,
            }));
            return;
        }

        const duplicateEmail = emails
            .map((email) => email.toLowerCase())
            .includes(val.toLowerCase());
        if (duplicateEmail) {
            setError((error) => ({
                ...error,
                submit: t('errors.duplicateRecipientEmail') as string,
            }));
            return;
        }

        setEmails([...emails, val]);
        setError({});
        setEmail('');
    };

    const deleteEmail = (val: string) => {
        setError((error) => ({ ...error, submit: '' }));
        setEmails(emails.filter((email) => email !== val));
    };

    useEffect(() => {
        if (emails.length == 1 && validateEmail(emails[0])) {
            setEmail(emails[0]);
            addEmail(emails[0]);
            setEmails([]);
        }
    }, []);

    const emailBox = (
        <div className={classNames}>
            <Label labelFor={'additional-recipient'}>
                {t('correspondence.emailAddress')}
            </Label>
            <div
                className={`border-2 border-gray-200 px-2 pt-2 mt-1 rounded-lg`}
            >
                {emails.map((email) => (
                    <ChipX
                        label={email as string}
                        key={email}
                        onDelete={() => deleteEmail(email)}
                        className="my-1 break-all"
                    />
                ))}
                <Field
                    onChange={(e) => {
                        setEmail(xss(e?.target?.value?.trim()) ?? '');
                    }}
                    handleEnterKey={() => {
                        addEmail(email);
                    }}
                    onKeyPress={(e) => {
                        if (e.key === ',' || e.key === ';') {
                            e.preventDefault();
                            addEmail(email);
                        }
                    }}
                    onBlur={(e) => {
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

    return (
        <>
            <div className="mt-4 ">
                <Label labelFor={'email-heading'}>
                    {partyCardsData?.length
                        ? t('correspondence.emailLabel')
                        : t('correspondence.noEmails')}
                </Label>
            </div>
            <RoleAddressCard
                partyCardsLits={partyCardsData}
                title={''}
                handleClick={handleClick}
                selectedIds={[selectedEmailIndex]}
                isAddressChange={false}
                isAddressCard={false}
                addEmail={addEmail}
            ></RoleAddressCard>
            <div className="max-w-sm">
                {emailBox}
                <Typography
                    variant={TypographyVariant.Body}
                    className={`whitespace-normal mb-2 break-words`}
                >
                    {t('correspondence.emailMessage')}
                </Typography>
                <AssistiveText
                    text={t('correspondence.emailWarning')}
                    variant={AssistiveTextVariant.Info}
                />
            </div>
        </>
    );
};

export default AdditionalRecipient;
