import { Policy } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import EmailAddress from '@deps/components/otp-send-document/components/email-field';
import FaxNumber from '@deps/components/otp-send-document/components/fax-field';
import Radio, { RadioItem } from '@deps/components/radio/radio';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    isEqualObjects,
    validateAddress,
    validateEmail,
    validateFax,
} from '@deps/containers/death-claim-container/steps/notification-method/notification-method.helpers';
import { useDeathClaim } from '@deps/contexts/DeathClaimContext';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import ContactAddress from './contact-address';
import {
    ClaimActionTypes,
    ClaimCommunicationTypes,
    NotificationMethod,
} from '../../death-claim.types';

type NotificationCardProps = {
    communicationOptions: RadioItem[];
    policy: Policy;
    party: any;
    index: number;
    handleNotification: (value: any, index: number) => void;
    defaultCommunicationType: ClaimCommunicationTypes | string;
    policyBeneficiaries: NotificationMethod[];
};
const NotificationCard = ({
    policy,
    communicationOptions,
    party,
    index,
    handleNotification,
    defaultCommunicationType,
    policyBeneficiaries,
}: NotificationCardProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'deathClaims.notificationMethod',
    });
    const [communicationType, setCommunicationType] = useState(
        party?.notificationMethod || defaultCommunicationType
    );
    const [email, setEmail] = useState(party?.email?.emailAddress || '');
    const [fax, setFax] = useState(party?.faxNumber || '');
    const [address, setAddress] = useState(party?.address || {});
    const [error, setError] = useState<FormValidationErrors>({});
    const { setFormErrors } = useDeathClaim();

    function renderReceiptComponent(
        communicationType: ClaimCommunicationTypes
    ): React.ReactNode {
        switch (communicationType) {
            case ClaimCommunicationTypes.Email:
                return (
                    <EmailAddress
                        email={email}
                        setEmail={(val: string) => setEmail(val)}
                    />
                );
            case ClaimCommunicationTypes.Fax:
                return (
                    <FaxNumber
                        fax={fax}
                        setFax={(val: string) => setFax(val)}
                    />
                );
            case ClaimCommunicationTypes.Mail:
                return (
                    <ContactAddress
                        policy={policy}
                        setAddress={setAddress}
                        party={party?.party}
                    />
                );
            default:
                null;
        }
    }

    useEffect(() => {
        if (error?.submit) {
            setFormErrors(error);
        } else setFormErrors({});
    }, [error]);

    useEffect(() => {
        let updatedNotification;
        setError({});
        if (communicationType === ClaimCommunicationTypes.Email) {
            const emailError = validateEmail(email);
            if (emailError) {
                setError((error) => ({
                    ...error,
                    submit: t(emailError) as string,
                }));
                return;
            }

            let action = ClaimActionTypes.NONE;
            if (!isNullEmptyOrUndefined(email)) {
                if (
                    policyBeneficiaries[index]['email']['emailAddress'] !==
                    email
                ) {
                    if (
                        isNullEmptyOrUndefined(
                            policyBeneficiaries[index]['email']['emailId']
                        )
                    ) {
                        action = ClaimActionTypes.ADD;
                    } else {
                        action = ClaimActionTypes.UPDATE;
                    }
                }
            }

            updatedNotification = {
                notificationMethod: communicationType,
                email: {
                    ...policyBeneficiaries[index]['email'],
                    action,
                    emailAddress: email,
                },
                address: {
                    ...policyBeneficiaries[index]['address'],
                    action: ClaimActionTypes.NONE,
                },
                faxNumber: '',
            };
        }

        if (communicationType === ClaimCommunicationTypes.Fax) {
            const faxError = validateFax(fax);
            if (faxError) {
                setError((error) => ({
                    ...error,
                    submit: t(faxError) as string,
                }));
                return;
            }

            updatedNotification = {
                notificationMethod: communicationType,
                faxNumber: fax,
                address: {
                    ...policyBeneficiaries[index]['address'],
                    action: ClaimActionTypes.NONE,
                },
                email: {
                    ...policyBeneficiaries[index]['email'],
                    action: ClaimActionTypes.NONE,
                },
            };
        }

        if (communicationType === ClaimCommunicationTypes.Mail) {
            const addressError = validateAddress(address);
            if (addressError) {
                setError((error) => ({
                    ...error,
                    submit: t(addressError) as string,
                }));
                return;
            }

            let action = ClaimActionTypes.NONE;
            if (
                address?.addressId !==
                policyBeneficiaries[index]['address']?.addressId
            ) {
                action = ClaimActionTypes.ADD;
            } else if (
                address?.addressId ===
                policyBeneficiaries[index]['address']?.addressId
            ) {
                const isEqual = isEqualObjects(
                    address,
                    policyBeneficiaries[index]['address']
                );
                action = isEqual
                    ? ClaimActionTypes.NONE
                    : ClaimActionTypes.UPDATE;
            }
            address.action = action;
            updatedNotification = {
                notificationMethod: communicationType,
                address: address,
                email: {
                    ...policyBeneficiaries[index]['email'],
                    action: ClaimActionTypes.NONE,
                },
                faxNumber: '',
            };
        }

        handleNotification(updatedNotification, index);
    }, [email, fax, address, communicationType, index, t]);

    return (
        <div className="p-7 border-1 rounded-md border-gray-200 mt-2">
            <Typography
                variant={TypographyVariant.H3}
                className="capitalize mb-5"
            >
                {toTitleCase(
                    [party?.party.firstName, party?.party.lastName]
                        .filter(Boolean)
                        .join(' ')
                )}
            </Typography>
            <div className="flex flex-col gap-4">
                <Radio
                    id={`communication-type-${party?.party.partyId}`}
                    items={communicationOptions}
                    label={t('label') as string}
                    onChange={(event) => {
                        setCommunicationType(
                            event.target.value as ClaimCommunicationTypes
                        );
                    }}
                    value={communicationType}
                    name={
                        `communication-type-${party?.party.partyId}-` +
                        Math.random()
                    }
                />
                {renderReceiptComponent(communicationType)}
                {error?.submit && (
                    <AssistiveText
                        text={error?.submit}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                )}
            </div>
        </div>
    );
};

export default NotificationCard;
