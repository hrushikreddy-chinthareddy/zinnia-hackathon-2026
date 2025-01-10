import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import AdditionalRecipient from '@deps/components/otp-send-document/components/additional-recipient';
import ContactCenterAddress from '@deps/components/otp-send-document/components/contact-address';
import FaxNumber from '@deps/components/otp-send-document/components/fax-field';
import Radio, { RadioItem } from '@deps/components/radio/radio';
import { Correspondence } from '@deps/models/case/correspondence';
import { CommunicationTypes } from '@deps/models/case/send-document';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { PartyRole, PartyType, Policy } from '@deps/models/policy/sor-policy';
import { validateEmail } from '@deps/components/otp-send-document/correspondence';

const getPrimaryEmail = (policy: Policy) => {
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
    const recipients = correspondenceData?.recipients || [];

    let emailId = getPrimaryEmail(policy);

    const [communicationType, setCommunicationType] = useState(selectedCommunicationType || '');
    const [emails, setEmails] = useState(
        selectedCommunicationType === CommunicationTypes.Email ? (recipients.length ? recipients : emailId ? [emailId.trim()] : []) : []
    );
    const [fax, setFax] = useState(selectedCommunicationType === CommunicationTypes.Fax ? recipients || [] : []);
    const [address, setAddress] = useState(correspondenceData?.mailDetails);
    const [ccEmails, setCCEmails] = useState<string[]>([]);


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
            recipients: communicationType === CommunicationTypes.Email ? emails : fax,
            ccList: communicationType === CommunicationTypes.Email ? ccEmails : [],
            mailDetails: address,
        });
    }, [emails, fax, address, setCorrespondenceData, communicationType]);

   
    function renderReceiptComponent(communicationType: string): React.ReactNode {
        switch (communicationType) {
            case CommunicationTypes.Email:
                return (
                    <>
                        <AdditionalRecipient
                            emails={emails}
                            setEmails={setEmails}
                            classNames="flex-grow"
                            setError={setError}
                            policy={policy}
                        />
                    </>
                );
            case CommunicationTypes.Fax:
                return <FaxNumber fax={fax.length ? fax[0] : ''} setFax={(val: string) => setFax(val ? [val] : [])} />;
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
