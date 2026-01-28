import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';

import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import {
    Address,
    AddressType,
    Country,
    EntityType,
    Gender,
    Parties,
    PartyType,
    PreferredCommunicationType,
    Prefix,
    State,
    TrustType,
} from '@zinnia/api-types/types/sor';

import AddressCard from './address-card';
import { Addresses } from './address-card.helpers';

jest.mock('@deps/utils/server-logging');

const onClick = jest.fn();

const newDate = dayjs()
    .year(new Date().getFullYear() + 1)
    .month(7)
    .date(1)
    .toDate();
const startDate = dayjs(newDate).format(ZAHARA_API_DATE_FORMAT);
const endDate = dayjs(newDate).add(14, 'days').format(ZAHARA_API_DATE_FORMAT);

describe('AddressCard', () => {
    it('should render the formatted address', () => {
        const address: Address = {
            addressId: '1',
            addressLine1: '123 Main Street',
            addressLine2: 'Apt 4',
            addressLine3: '',
            addressType: AddressType.RESIDENCE,
            city: 'New York',
            country: Country.US,
            endDate: endDate,
            startDate: startDate,
            state: State.NY,
            zipCode: '10001',
            zipCodeExtension: '',
        };
        const party: Parties = {
            partyId: '789',
            beneficiaryPercentage: 50,
            partyType: PartyType.INDIVIDUAL,
            firstName: 'John',
            middleName: 'Doe',
            lastName: 'Smith',
            fullName: 'John Doe Smith',
            prefix: Prefix.MR,
            suffix: Parties.suffix.JR,
            gender: Gender.MALE,
            dateOfBirth: '1980-01-01',
            attainedAge: 43,
            birthCountry: Country.US,
            birthState: State.CA,
            trustDate: '2010-01-01',
            trustType: TrustType.INDIVIDUALTRUST,
            entityType: EntityType.SOLEPROPRIETORSHIP,
            preferredCommunicationType: PreferredCommunicationType.EMAIL,
            formerName: undefined,
            identifications: [],
            bankDetails: [],
            addresses: [address],
            phones: [],
            emails: [],
        };
        const { container } = render(
            <AddressCard
                party={party}
                partyRoles={[]}
                planCode="PLANCODE"
                policyNumber="12345"
            />
        );
        const formattedAddressElements =
            container.querySelectorAll('span.line-clamp-2');
        expect(formattedAddressElements.length).toBe(4);
        expect(formattedAddressElements[0]).toHaveTextContent(
            '123 Main Street'
        );
        expect(formattedAddressElements[1]).toHaveTextContent('Apt 4');
        expect(formattedAddressElements[2]).toHaveTextContent(
            'New York, NY 10001'
        );
        expect(formattedAddressElements[3]).toHaveTextContent('US');
    });
});

describe('ResidentialAddress', () => {
    it('should render the residential address', () => {
        const addresses = [
            {
                addressId: '1',
                addressLine1: '123 Main Street',
                addressLine2: 'Apt 4',
                addressLine3: '',
                addressType: AddressType.RESIDENCE,
                city: 'New York',
                country: 'US',
                endDate: endDate,
                startDate: startDate,
                state: 'NY',
                zipCode: '10001',
                zipCodeExtension: '',
            } as Address,
        ];
        render(<Addresses addresses={addresses} onEditClick={onClick} />);
        const residentialAddressElement = screen.getByText('123 Main Street');
        expect(residentialAddressElement).toBeInTheDocument();
    });

    it('should not render anything if there are no addresses', () => {
        render(<Addresses addresses={[]} onEditClick={onClick} />);
        const residentialAddressElement = screen.queryByText('123 Main Street');
        expect(residentialAddressElement).not.toBeInTheDocument();
    });
});

describe('BoxAddress', () => {
    it('should render the PO Box address', () => {
        const addresses = [
            {
                addressId: '1',
                addressLine1: 'Po Box 789',
                addressLine2: '',
                addressLine3: '',
                addressType: AddressType.POBOX,
                city: 'Denver',
                country: 'US',
                endDate: endDate,
                startDate: startDate,
                state: 'CO',
                zipCode: '80202',
                zipCodeExtension: '',
            } as Address,
        ];
        render(<Addresses addresses={addresses} onEditClick={onClick} />);
        const boxAddressElement = screen.getByText('Po Box 789');
        expect(boxAddressElement).toBeInTheDocument();
    });

    it('should not render anything if there are no addresses', () => {
        render(<Addresses addresses={[]} onEditClick={onClick} />);
        const boxAddressElement = screen.queryByText('Po Box 789');
        expect(boxAddressElement).not.toBeInTheDocument();
    });
});

describe('BusinessAddress', () => {
    it('should render the business address', () => {
        const addresses = [
            {
                addressId: '1',
                addressLine1: '789 Corporate Blvd',
                addressLine2: 'Suite 200',
                addressLine3: '',
                addressType: AddressType.BUSINESS,
                city: 'San Francisco',
                country: 'US',
                endDate: endDate,
                startDate: startDate,
                state: 'CA',
                zipCode: '94105',
                zipCodeExtension: '',
            } as Address,
        ];
        render(<Addresses addresses={addresses} onEditClick={onClick} />);
        const businessAddressElement = screen.getByText('789 Corporate Blvd');
        expect(businessAddressElement).toBeInTheDocument();
    });

    it('should not render anything if there are no addresses', () => {
        render(<Addresses addresses={[]} onEditClick={onClick} />);
        const businessAddressElement = screen.queryByText('789 Corporate Blvd');
        expect(businessAddressElement).not.toBeInTheDocument();
    });
});

describe('MailingAddress', () => {
    it('should render the mailing address', () => {
        const addresses = [
            {
                addressId: '1',
                addressLine1: '222 Main Street',
                addressLine2: 'Apt 4',
                addressLine3: '',
                addressType: AddressType.MAILING,
                city: 'New York',
                country: 'US',
                endDate: endDate,
                startDate: startDate,
                state: 'NY',
                zipCode: '10001',
                zipCodeExtension: '',
            } as Address,
        ];
        render(<Addresses addresses={addresses} onEditClick={onClick} />);
        const mailingAddressElement = screen.getByText('222 Main Street');
        expect(mailingAddressElement).toBeInTheDocument();
    });

    it('should not render anything if there are no addresses', () => {
        render(<Addresses addresses={[]} onEditClick={onClick} />);
        const mailingAddressElement = screen.queryByText('222 Main Street');
        expect(mailingAddressElement).not.toBeInTheDocument();
    });
});

describe('AddressCard', () => {
    it('should render the address card with all address types', () => {
        const addresses: Address[] = [
            {
                addressId: '1',
                addressLine1: '123 Main Street',
                addressLine2: 'Apt 4',
                addressLine3: '',
                addressType: AddressType.RESIDENCE,
                city: 'New York',
                country: Country.US,
                endDate: endDate,
                startDate: startDate,
                state: State.NY,
                zipCode: '10001',
                zipCodeExtension: '',
            },
            {
                addressId: '2',
                addressLine1: 'Po Box 789',
                addressLine2: '',
                addressLine3: '',
                addressType: AddressType.POBOX,
                city: 'Denver',
                country: Country.US,
                endDate: endDate,
                startDate: startDate,
                state: State.CO,
                zipCode: '80202',
                zipCodeExtension: '',
            },
            {
                addressId: '3',
                addressLine1: '789 Corporate Blvd',
                addressLine2: 'Suite 200',
                addressLine3: '',
                addressType: AddressType.BUSINESS,
                city: 'San Francisco',
                country: Country.US,
                endDate: endDate,
                startDate: startDate,
                state: State.CA,
                zipCode: '94105',
                zipCodeExtension: '',
            },
        ];
        const party: Parties = {
            partyId: '789',
            beneficiaryPercentage: 50,
            partyType: PartyType.INDIVIDUAL,
            firstName: 'John',
            middleName: 'Doe',
            lastName: 'Smith',
            fullName: 'John Doe Smith',
            prefix: Prefix.MR,
            suffix: Parties.suffix.JR,
            gender: Gender.MALE,
            dateOfBirth: '1980-01-01',
            attainedAge: 43,
            birthCountry: Country.US,
            birthState: State.CA,
            trustDate: '2010-01-01',
            trustType: TrustType.INDIVIDUALTRUST,
            entityType: EntityType.SOLEPROPRIETORSHIP,
            preferredCommunicationType: PreferredCommunicationType.EMAIL,
            identifications: [],
            bankDetails: [],
            addresses: addresses,
            phones: [],
            emails: [],
        };

        render(
            <AddressCard
                party={party}
                partyRoles={[]}
                planCode="PLANCODE"
                policyNumber="12345"
            />
        );
        const residentialAddressElement = screen.getByText('123 Main Street');
        expect(residentialAddressElement).toBeInTheDocument();
        const boxAddressElement = screen.getByText('Po Box 789');
        expect(boxAddressElement).toBeInTheDocument();
        const businessAddressElement = screen.getByText('789 Corporate Blvd');
        expect(businessAddressElement).toBeInTheDocument();
    });

    it('should not render anything if there are no addresses', () => {
        const party: Parties = {
            partyId: '789',
            beneficiaryPercentage: 50,
            partyType: PartyType.INDIVIDUAL,
            firstName: 'John',
            middleName: 'Doe',
            lastName: 'Smith',
            fullName: 'John Doe Smith',
            prefix: Prefix.MR,
            suffix: Parties.suffix.JR,
            gender: Gender.MALE,
            dateOfBirth: '1980-01-01',
            attainedAge: 43,
            birthCountry: Country.US,
            birthState: State.CA,
            trustDate: '2010-01-01',
            trustType: TrustType.INDIVIDUALTRUST,
            entityType: EntityType.SOLEPROPRIETORSHIP,
            preferredCommunicationType: PreferredCommunicationType.EMAIL,
            identifications: [],
            bankDetails: [],
            addresses: [],
            phones: [],
            emails: [],
        };
        render(
            <AddressCard
                party={party}
                partyRoles={[]}
                planCode="PLANCODE"
                policyNumber="12345"
            />
        );
        const residentialAddressElement = screen.queryByText('123 Main Street');
        expect(residentialAddressElement).not.toBeInTheDocument();
        const boxAddressElement = screen.queryByText('Po Box 789');
        expect(boxAddressElement).not.toBeInTheDocument();
        const businessAddressElement = screen.queryByText('789 Corporate Blvd');
        expect(businessAddressElement).not.toBeInTheDocument();
    });
});
