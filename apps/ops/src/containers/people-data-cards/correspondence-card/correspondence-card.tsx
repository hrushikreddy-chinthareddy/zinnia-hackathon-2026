import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import IconButton from '@deps/components/icon-button/icon-button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import AdditionalRecipient from '@deps/components/otp-send-document/components/additional-recipient';
import ContactCenterAddress from '@deps/components/otp-send-document/components/contact-address';
import EmailAddress from '@deps/components/otp-send-document/components/email-field';
import FaxNumber from '@deps/components/otp-send-document/components/fax-field';
import Radio, { RadioItem } from '@deps/components/radio/radio';
import { Correspondence } from '@deps/models/case/correspondence';
import { CommunicationTypes } from '@deps/models/case/send-document';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { PartyRole, PartyType, Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as TrashIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';
const getPrimaryEmail = (policy: Policy) => {
    // TODO MG: `PartyRole.EDELIVERY` isnt in the new spec - this was manually added
    const eDeliveryRoleId = policy.partyRoles?.find(party => party.partyRole === PartyRole.EDELIVERY)?.partyId;
    const primaryEmails =
        policy.parties?.find(policy => policy.partyType === PartyType.INDIVIDUAL && policy.partyId === eDeliveryRoleId)?.emails || [];
    return primaryEmails?.length > 0 ? primaryEmails[0].emailAddress || '' : '';
};
type CorrespondenceProps = {
    communicationOptions?: RadioItem[];
    policy: Policy;
    error: FormValidationErrors;
    showAdditionalRecipient?: boolean;
    correspondenceData?: Correspondence;
    setCorrespondenceData: (val: Correspondence) => void;
    setError: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
};
const CorrespondenceCard = ({
    policy,
    communicationOptions,
    correspondenceData,
    error,
    showAdditionalRecipient,
    setError,
    setCorrespondenceData,
}: CorrespondenceProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });

    const selectedCommunicationType = correspondenceData?.type;
    const recipient = correspondenceData?.recipient;
    const emailId = getPrimaryEmail(policy);
    const [communicationType, setCommunicationType] = useState(selectedCommunicationType || '');
    const [email, setEmail] = useState(selectedCommunicationType === CommunicationTypes.Email ? recipient || emailId : '');
    const [fax, setFax] = useState(selectedCommunicationType === CommunicationTypes.Fax ? recipient || '' : '');
    const [address, setAddress] = useState(correspondenceData?.mailDetails);
    const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
    const [addAdditionalRecipient, setAdditionalRecipient] = useState(false);

    const communicationTypes = [
        {
            label: t('correspondence.email'),
            value: CommunicationTypes.Email,
        },
        {
            label: t('correspondence.fax'),
            value: CommunicationTypes.Fax,
        },
        {
            label: t('correspondence.mail'),
            value: CommunicationTypes.Mail,
        },
    ];

    useEffect(() => {
        setCorrespondenceData({
            type: communicationType,
            recipient: communicationType === CommunicationTypes.Email ? email : fax,
            ccList: communicationType === CommunicationTypes.Email ? additionalEmails : [],
            mailDetails: address,
        });
    }, [email, fax, address, additionalEmails, setCorrespondenceData, communicationType]);

    const removeAdditionalRecipient = () => {
        setAdditionalEmails([]);
        setAdditionalRecipient(false);
    };

    function renderReceiptComponent(communicationType: string): React.ReactNode {
        switch (communicationType) {
            case CommunicationTypes.Email:
                return (
                    <>
                        <EmailAddress email={email} setEmail={(val: string) => setEmail(val)} error={error} />

                        {showAdditionalRecipient && (
                            <NavElement
                                className={'my-2 text-left'}
                                size={NavElementSize.Default}
                                title={t('correspondence.addAdditionalRecipient') as string}
                                type={NavElementType.Button}
                                onClick={() => setAdditionalRecipient(!addAdditionalRecipient)}
                                variant={NavElementVariant.Secondary}
                            >
                                {t('correspondence.addAdditionalRecipient') as string}
                            </NavElement>
                        )}
                        {addAdditionalRecipient && (
                            <div className="flex flex-row max-w-sm">
                                <AdditionalRecipient
                                    emails={additionalEmails}
                                    setEmails={setAdditionalEmails}
                                    classNames="flex-grow"
                                    setError={setError}
                                />
                                <IconButton
                                    aria-label={`${t('correspondence.removeAdditionalRecipient')}`}
                                    className="mt-10 ml-2"
                                    onClick={removeAdditionalRecipient}
                                >
                                    <TrashIcon height={24} width={24} />
                                </IconButton>
                            </div>
                        )}
                    </>
                );
            case CommunicationTypes.Fax:
                return <FaxNumber fax={fax} setFax={(val: string) => setFax(val)} />;
            case CommunicationTypes.Mail:
                return <ContactCenterAddress policy={policy} setAddress={setAddress} />;
            default:
                null;
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Radio
                items={communicationOptions ?? communicationTypes}
                label={t('correspondence.label') as string}
                onChange={event => {
                    setCommunicationType(event.target.value as CommunicationTypes);
                    setError({});
                }}
                value={communicationType}
            />

            {renderReceiptComponent(communicationType)}
        </div>
    );
};

export default CorrespondenceCard;
