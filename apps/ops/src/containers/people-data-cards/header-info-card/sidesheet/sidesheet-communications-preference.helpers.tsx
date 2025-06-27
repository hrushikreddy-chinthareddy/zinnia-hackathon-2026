import { Address, Email } from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';
import { Dispatch, SetStateAction } from 'react';

import { PolicyParty } from '@deps/helpers/policy-sor/Parties';
export type SideSheetCommnunicationPreferenceProps = {
    addresses: Address[];
    emails: Email[];
    onCancel: () => void;
    party?: PolicyParty;
    planCode?: string;
    policyNumber?: string;
    setPreferredCommunication: Dispatch<
        SetStateAction<Email | Address | undefined>
    >;
};

interface GetFormErrors {
    caseId?: string;
    isDelete?: boolean;
    preferredCommunication?: Email | Address;
    t: TFunction;
}

export interface Errors {
    caseId?: string;
    emailAddress?: string;
    address?: string;
    communicationPreference?: string;
}

export const getFormErrors = ({
    caseId,
    preferredCommunication,
    isDelete,
    t,
}: GetFormErrors) => {
    let errors: Errors = {};

    if (caseId == null) {
        errors = {
            ...errors,
            caseId: `${t('people.sideSheet.email.errors.missingCaseDocument')}`,
        };
    }

    if (isDelete) {
        return errors;
    }

    if (preferredCommunication === undefined) {
        errors = {
            ...errors,
            communicationPreference: `${t(
                'people.sideSheet.communicationpreference.errors.isMissing'
            )}`,
        };
        return errors;
    }
    if ('addressId' in preferredCommunication) {
        if (
            !preferredCommunication.addressId ||
            !preferredCommunication.addressLine1
        ) {
            errors = {
                ...errors,
                emailAddress: `${t(
                    'people.sideSheet.communicationpreference.errors.address'
                )}`,
            };
        }
    }
    if ('emailId' in preferredCommunication) {
        if (
            !preferredCommunication.emailId ||
            !preferredCommunication.emailAddress
        ) {
            errors = {
                ...errors,
                emailAddress: `${t(
                    'people.sideSheet.communicationpreference.errors.emailAddress'
                )}`,
            };
        } else if (
            !/\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+/.test(
                preferredCommunication.emailAddress
            )
        ) {
            errors = {
                ...errors,
                emailAddress: t(
                    'people.sideSheet.communicationpreference.errors.isInvalid'
                ) as string,
            };
        }
    }

    return errors;
};
