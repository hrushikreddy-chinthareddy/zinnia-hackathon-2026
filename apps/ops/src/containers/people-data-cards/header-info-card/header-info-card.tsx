import { Phone } from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';
import { FC, useContext, useMemo, useState } from 'react';

import FieldData from '@deps/components/fields/field-data/field-data';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { PolicyAllOfPartiesItem, Address, Email } from '@deps/models/policy/sor-policy';
import { NonFinancialTransactionActions, NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';

import SideSheetPeopleHeader from '../side-sheet-people-header/side-sheet-people-header';
import { SidesheetCommunicationsPreference } from './sidesheet/sidesheet-communications-preference';
import { FormattedAddress } from '../address-card/address-card.helpers';

type HeaderInfoCardProps = {
    selectedPolicyParty?: PolicyAllOfPartiesItem;
    children: React.ReactNode;
    t: TFunction;
    editable?: boolean;
};

export const HeaderInfoCard: FC<HeaderInfoCardProps> = ({ children, selectedPolicyParty, t, editable }) => {
    return (
        <div className="flex items-start align-middle justify-between bg-opacity-50">
            <CommunicationPreferenceField partyInfo={selectedPolicyParty} t={t} editable={editable} />
            {children}
        </div>
    );
};

type CommunicationPreferenceFieldProps = {
    partyInfo?: PolicyAllOfPartiesItem;
    t: TFunction;
    editable?: boolean;
};
const CommunicationPreferenceField = ({ partyInfo, t, editable = true }: CommunicationPreferenceFieldProps): JSX.Element | null => {
    const sidesheet = useSideSheetContext();
    const { policyDetails } = useContext(PolicyData);
    const currentParty = policyDetails.parties?.getPartyById(partyInfo?.partyId ?? '');
    const [contactValue, setContactValue] = useState(currentParty?.preferredCommunication);

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

    const handleEditClick = () => {
        sidesheet.changeSideSheetContent(
            <SideSheetPeopleHeader
                action={NonFinancialTransactionActions.Edit}
                transaction={NonFinancialTransactions.CommunicationPreference}
            />,
            <SidesheetCommunicationsPreference
                planCode={policyDetails.planCode}
                onCancel={() => sidesheet.handleOpen(false)}
                setPreferredCommunication={setContactValue}
                party={currentParty}
                emails={partyInfo?.emails ?? []}
                addresses={partyInfo?.addresses ?? []}
                policyNumber={policyDetails.policyNumber}
            />
        );
        sidesheet.handleOpen(true);
    };

    return (
        <div className="mr-8 break-all">
            <div className="flex flex:row gap-2 items-center align-middle">
                <FieldData
                    className="field-label font-primary font-bold"
                    handleEditClick={handleEditClick}
                    editable={editable}
                    label={t('people.party.contact.method')}
                >
                    <PiiWrapper>{displayValue}</PiiWrapper>
                </FieldData>
            </div>
        </div>
    );
};
