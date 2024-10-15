import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import ContactCenterAddress from '@deps/components/otp-send-document/components/contact-address';
import EmailAddress from '@deps/components/otp-send-document/components/email-field';
import FaxNumber from '@deps/components/otp-send-document/components/fax-field';
import Radio, { RadioItem } from '@deps/components/radio/radio';
import { Correspondence } from '@deps/models/case/correspondence';
import { CommunicationTypes } from '@deps/models/case/send-document';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { PartyRole, PartyType, Policy } from '@deps/models/policy/sor-policy';

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
    correspondenceData?: Correspondence;
    setCorrespondenceData: (val: Correspondence) => void;
};
const CorrespondenceCard = ({ policy, communicationOptions, correspondenceData, error, setCorrespondenceData }: CorrespondenceProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });

    const selectedCommunicationType = correspondenceData?.type;
    const recipient = correspondenceData?.recipient;
    const emailId = getPrimaryEmail(policy);
    const [communicationType, setCommunicationType] = useState(selectedCommunicationType || '');
    const [email, setEmail] = useState(selectedCommunicationType === CommunicationTypes.Email ? recipient || emailId : '');
    const [fax, setFax] = useState(selectedCommunicationType === CommunicationTypes.Fax ? recipient || '' : '');
    const [address, setAddress] = useState(correspondenceData?.mailDetails);

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
            mailDetails: address,
        });
    }, [email, fax, address, setCorrespondenceData, communicationType]);

    function renderReceiptComponent(communicationType: string): React.ReactNode {
        switch (communicationType) {
            case CommunicationTypes.Email:
                return <EmailAddress email={email} setEmail={(val: string) => setEmail(val)} error={error} />;
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
                onChange={event => setCommunicationType(event.target.value as CommunicationTypes)}
                value={communicationType}
            />

            {renderReceiptComponent(communicationType)}
        </div>
    );
};

export default CorrespondenceCard;
