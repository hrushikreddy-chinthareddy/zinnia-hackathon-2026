import { Meta } from '@storybook/react';

import { generateClassParty, generateParty } from '@deps/utils/mock/mockParty';
import { PartyRole, PolicyPartyRoles } from '@zinnia/api-types/types/sor';

import AddressCard from './address-card/address-card';
import BankCard from './bank-card/bank-card';
import EmailCard from './email-card/email-card';
import IdentificationCard from './identification-card/identification-card';
import PhoneCard from './phone-card/phone-card';

export default {
    title: 'Containers/PeopleDataCards',
    component: AddressCard,
} as Meta<typeof AddressCard>;

const partyRoles: PolicyPartyRoles[] = [
    { partyId: '789', partyRole: PartyRole.INSURED },
];

const policyParty = generateParty('789');
const policyParty2 = generateClassParty('789');

export const IdentificationCardContainer = () => {
    return (
        <div className="p-6">
            <IdentificationCard
                editable={true}
                selectedPolicyParty={policyParty2}
            />
        </div>
    );
};

export const AddressCardContainer = () => {
    return (
        <div className="p-6">
            <AddressCard
                editable={true}
                party={policyParty}
                partyRoles={partyRoles}
                policyNumber="12345"
            />
        </div>
    );
};

export const EmailCardContainer = () => {
    return (
        <div className="p-6">
            <EmailCard
                editable={true}
                party={policyParty}
                partyRoles={partyRoles}
                policyNumber="12345"
            />
        </div>
    );
};

export const PhoneCardContainer = () => {
    return (
        <div className="p-6">
            <PhoneCard
                editable={true}
                party={policyParty}
                partyRoles={partyRoles}
                policyNumber="12345"
            />
        </div>
    );
};

export const BankCardContainer = () => {
    return (
        <div className="p-6">
            <BankCard
                editable={true}
                party={policyParty}
                policyNumber="12345"
            />
        </div>
    );
};
