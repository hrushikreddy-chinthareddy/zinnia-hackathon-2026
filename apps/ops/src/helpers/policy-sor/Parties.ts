import { isEndDated } from '@deps/helpers/date.helpers';
import { getPartyFullName } from '@deps/helpers/party-info-helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import {
    Address,
    BankAccount,
    Country,
    Email,
    EntityType,
    Gender,
    Identification,
    Parties as ApiParties,
    PartyRole,
    PartyType,
    PreferredCommunicationType,
    Phone,
    Policy,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

import { calculateAgeNumber } from '../age.helpers';
import { Addresses } from './party-items/Addresses';
import { Banks } from './party-items/Banks';
import { Emails } from './party-items/Emails';
import { Phones } from './party-items/Phones';

const orderedRoles = [
    PartyRole.OWNER,
    PartyRole.JOINTOWNER,
    PartyRole.INSURED,
    PartyRole.ANNUITANT,
    PartyRole.JOINTANNUITANT,
    PartyRole.PAYOR,
    PartyRole.PRIMARYBENEFICIARY,
    PartyRole.CONTINGENTBENEFICIARY,
    PartyRole.AGENT,
    PartyRole.PRIMARYSERVICINGAGENT,
    PartyRole.PRIMARYWRITINGAGENT,
    'ADDTITIONALWRITINGAGENT' as PartyRole, // BPB - Just in Case the typo is only in the typing
    PartyRole.ADDITIONALWRITINGGAGENT,
    PartyRole.ADDITIONALSERVICINGAGENT,
    PartyRole.PAYEE,
    PartyRole.ASSIGNEE,
    'Secondary assignee' as PartyRole,
    PartyRole.COVERAGEINSURED,
    'Rider Insured' as PartyRole,
    PartyRole.THIRDPARTYDESIGNEE,
    PartyRole.EXCHANGECOMPANY,
];

export class PolicyParty {
    party: ApiParties;
    public partyRolesList: PolicyPartyRoles[] = [];
    public addresses: Addresses;
    public ageInYears: number | undefined;
    public banks: Banks;
    public emails: Emails;
    public phones: Phones;
    public partyId: string | undefined;
    public prefix: string | undefined;
    public firstName: string | undefined;
    public middleName: string | undefined;
    public lastName: string | undefined;
    public suffix: string | undefined;
    public fullName: string;
    public formattedBirthDate: string | undefined;
    public gender: Gender | undefined;
    public genderIdentity: string | undefined;
    public entityType: EntityType | undefined;
    public organizationCode: string | undefined;
    public partyType: PartyType | undefined;
    public trustDate: string | undefined;
    public trustType: string | undefined;
    public identifications: Identification[] | undefined;
    public citizenCountry: Country | undefined;

    constructor(party: ApiParties = {}) {
        this.ageInYears = calculateAgeNumber(party.dateOfBirth);
        this.firstName = party.firstName;
        this.formattedBirthDate = convertKebabedDateString(party.dateOfBirth);
        this.prefix = party.prefix;
        this.fullName = getPartyFullName(party);
        this.lastName = party.lastName;
        this.middleName = party.middleName;
        this.party = party;
        this.partyId = party.partyId;
        this.suffix = party.suffix;

        this.addresses = new Addresses(
            party.addresses,
            party.preferredAddressIndicator
        );
        this.banks = new Banks(party.bankDetails);
        // to do - this is fake right now since there is no citizenCountry key on PartyBase yet
        this.citizenCountry = Country['US'];
        // this.citizenCountry = this.party.citizenCountry;
        this.emails = new Emails(party.emails);
        this.entityType = this.party.entityType;
        this.gender = this.party.gender;
        this.genderIdentity = this.party.genderIdentity;
        this.identifications = this.party.identifications;
        this.organizationCode = this.party.organizationCode;
        this.partyType = this.party.partyType;
        this.phones = new Phones(party.phones);
        this.trustDate = this.party.trustDate;
        this.trustType = this.party.trustType;
    }

    public addPartyRole(role?: PolicyPartyRoles) {
        if (!role) {
            return;
        }
        this.partyRolesList.push(role);
    }

    public get driversLicense() {
        return this.party.identifications?.find(
            (identification) =>
                identification.identificationType ===
                ('DRIVERLICENSE' as Identification.identificationType)
        );
    }

    public get passports() {
        return this.party.identifications?.filter(
            (identification) =>
                identification.identificationType ===
                Identification.identificationType.PASSPORT
        );
    }

    public get ssn(): string | null | undefined {
        return this.party.identifications?.find(
            (identification) => identification.identificationType === 'SSN'
        )?.identificationValue;
    }

    public get stateId() {
        return this.party.identifications?.find(
            (identification) =>
                identification.identificationType ===
                Identification.identificationType.STATEPHOTOID
        );
    }

    public get taxId() {
        return this.party.identifications?.find(
            (identification) =>
                identification.identificationType ===
                Identification.identificationType.TIN
        );
    }

    public get partyRoles(): PolicyPartyRoles[] {
        return this.partyRolesList
            .filter((role) => !isEndDated(role.endDate))
            .sort((a, b) => {
                return (
                    orderedRoles.indexOf(a.partyRole as PartyRole) -
                    orderedRoles.indexOf(b.partyRole as PartyRole)
                );
            });
    }

    public get preferredAddress(): Address | undefined {
        return this.addresses.preferred;
    }

    public get preferredBank(): BankAccount | undefined {
        return this.banks.preferred;
    }

    public get preferredCommunicationType(): PreferredCommunicationType {
        return (
            this.party.preferredCommunicationType ??
            PreferredCommunicationType.NOPREFERENCESPECIFIED
        );
    }

    public get preferredCommunication(): Address | Email | Phone | undefined {
        switch (this.preferredCommunicationType) {
            case PreferredCommunicationType.EMAIL:
                return this.emails.preferred;
            case PreferredCommunicationType.PHONE:
            case PreferredCommunicationType.TEXT:
                return this.phones.preferred;
            case PreferredCommunicationType.REGULARMAIL:
                return this.addresses.preferred;
            default:
                return undefined;
        }
    }

    public get preferredEmail(): Email | undefined {
        return this.emails.preferred;
    }

    public get bestAvailableAddress(): Address | undefined {
        return this.addresses.bestAvailable;
    }

    public get bestAvailablePhone(): Phone | undefined {
        return this.phones.bestAvailable;
    }

    public get bestAvailableEmail(): Email | undefined {
        return this.emails.bestAvailable;
    }

    public get isUSCitizen(): boolean {
        return this.citizenCountry === Country.US;
    }
}

export class Parties {
    public parties: Array<PolicyParty> = [];
    private partiesById: Map<string, PolicyParty> = new Map();
    private partiesByRole: Map<PartyRole, PolicyParty[]> = new Map();
    constructor({ parties = [], partyRoles = [] }: Policy = {}) {
        parties?.forEach((party) => {
            if (!party.partyId) {
                return;
            }
            const newParty = new PolicyParty(party);
            this.parties.push(newParty);
            this.partiesById.set(party.partyId, newParty);
        });
        partyRoles?.forEach((role) => {
            if (!role.partyId || !role.partyRole) {
                return;
            }
            if (!this.partiesByRole.has(role.partyRole)) {
                this.partiesByRole.set(role.partyRole, []);
            }
            const party = this.partiesById.get(role.partyId);
            if (party) {
                party.addPartyRole(role);
                this.partiesByRole.get(role.partyRole)?.push(party);
            }
        });
    }

    public getPartyById(id: string): PolicyParty | undefined {
        return this.partiesById.get(id);
    }

    public getPartiesWithRole(role: PartyRole): PolicyParty[] {
        const parties = this.partiesByRole.get(role) || [];
        // PolicyParty.partyRoles already filters out end-dated roles
        return parties.filter((p) =>
            p.partyRoles?.some((pr) => pr.partyRole === role)
        );
    }

    public get owner(): PolicyParty | undefined {
        return this.getPartiesWithRole(PartyRole.OWNER)?.[0];
    }

    public get allOwners(): PolicyParty[] {
        return [
            ...this.getPartiesWithRole(PartyRole.OWNER),
            ...this.getPartiesWithRole(PartyRole.JOINTOWNER),
        ];
    }
}
