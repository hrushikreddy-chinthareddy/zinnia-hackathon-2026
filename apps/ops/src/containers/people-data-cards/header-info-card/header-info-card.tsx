import { SideSheet } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';
import { FC, useContext, useMemo, useState } from 'react';

import FieldData from '@deps/components/fields/field-data/field-data';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import useOnEditClick from '@deps/hooks/user-carrier-specific/useOnEditClick';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { Parties, Address, Email, Phone } from '@zinnia/api-types/types/sor';

import SideSheetPeopleHeader from '../side-sheet-people-header/side-sheet-people-header';
import { SidesheetCommunicationsPreference } from './sidesheet/sidesheet-communications-preference';
import { FormattedAddress } from '../address-card/address-card.helpers';

type HeaderInfoCardProps = {
    selectedPolicyParty?: Parties;
    children: React.ReactNode;
    t: TFunction;
    editable?: boolean;
    isUserPermissionedToEditCards?: boolean;
};

export const HeaderInfoCard: FC<HeaderInfoCardProps> = ({
    children,
    selectedPolicyParty,
    t,
    editable,
    isUserPermissionedToEditCards,
}) => {
    return (
        <div className="flex items-start align-middle justify-between bg-opacity-50">
            <CommunicationPreferenceField
                partyInfo={selectedPolicyParty}
                t={t}
                editable={editable}
                isUserPermissionedToEditCards={isUserPermissionedToEditCards}
            />
            {children}
        </div>
    );
};

type CommunicationPreferenceFieldProps = {
    partyInfo?: Parties;
    t: TFunction;
    editable?: boolean;
    isUserPermissionedToEditCards?: boolean;
};
const CommunicationPreferenceField = ({
    partyInfo,
    t,
    editable = true,
    isUserPermissionedToEditCards = true,
}: CommunicationPreferenceFieldProps): JSX.Element | null => {
    const { policyDetails } = useContext(PolicyData);
    const currentParty = policyDetails.parties?.getPartyById(
        partyInfo?.partyId ?? ''
    );
    // We are setting the preferred communication type off of the enterprise api return rather than
    // from preference management services here because the preference management endpoint requires
    // the users auth partyId and we don't have access to that from ops
    const [contactValue, setContactValue] = useState(
        currentParty?.preferredCommunication
    );
    const [isOpen, setIsOpen] = useState(false);

    const displayValue = useMemo(() => {
        if (!contactValue) return '';
        switch (true) {
            case 'addressId' in contactValue:
                return <FormattedAddress address={contactValue as Address} />;
            case 'phoneId' in contactValue:
                return (contactValue as Phone).dialNumber;

            case 'emailId' in contactValue:
                return (contactValue as Email).emailAddress;
            default:
                return '';
        }
    }, [contactValue]);

    const openSidesheet = () => {
        setIsOpen(true);
    };

    const handleEditClick = useOnEditClick({
        defaultCallback: openSidesheet,
        party: currentParty?.party,
    });

    return (
        <div className="mr-8 break-all">
            <div className="flex flex:row gap-2 items-center align-middle">
                <FieldData
                    labelClassName="!gap-1"
                    className="field-label font-primary font-bold"
                    handleEditClick={handleEditClick}
                    editable={editable}
                    isUserPermissionedToEditCards={
                        isUserPermissionedToEditCards
                    }
                    label={t(
                        'people.sideSheet.transactions.communicationpreference'
                    )}
                >
                    <PiiWrapper>{displayValue}</PiiWrapper>
                </FieldData>
            </div>
            <SideSheet
                trigger={null}
                open={isOpen}
                onOpenChange={setIsOpen}
                preventCloseOnOutsideClick={false}
                header={
                    <SideSheetPeopleHeader
                        action={NonFinancialTransactionActions.Edit}
                        transaction={
                            NonFinancialTransactions.CommunicationPreference
                        }
                    />
                }
            >
                <SidesheetCommunicationsPreference
                    planCode={policyDetails.planCode}
                    onCancel={() => setIsOpen(false)}
                    setPreferredCommunication={setContactValue}
                    party={currentParty}
                    emails={partyInfo?.emails ?? []}
                    addresses={partyInfo?.addresses ?? []}
                    policyNumber={policyDetails.policyNumber}
                    policy={policyDetails.policy}
                />
            </SideSheet>
        </div>
    );
};
