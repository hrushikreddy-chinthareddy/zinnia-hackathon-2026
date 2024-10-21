import { isEndDated } from '@deps/helpers/date.helper';
import { getPartyFullName } from '@deps/helpers/party-info-helper';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import {
    Address,
    BankAccount,
    Country,
    Email,
    EntityType,
    Gender,
    Identification,
    IdentificationType,
    Party,
    PartyRole,
    PartyType,
    Phone,
    Policy,
    PolicyParties,
} from '@deps/models/policy/sor-policy';

import { calculateAgeNumber } from '../age.helper';
import { Addresses } from './party-items/Addresses';
import { Banks } from './party-items/Banks';
import { Emails } from './party-items/Emails';
import { Phones } from './party-items/Phones';

const orderedRoles = [
    PartyRole.OWNER,
    PartyRole.JOINTOWNER,
    PartyRole.INSURED,
    'ANNUITANT' as PartyRole,
    'JOINTANNUITANT' as PartyRole,
    PartyRole.PAYOR,
    PartyRole.PRIMARYBENEFICIARY,
    PartyRole.CONTINGENTBENEFICIARY,
    PartyRole.AGENT,
    PartyRole.PRIMARYSERVICINGAGENT,
    PartyRole.PRIMARYWRITINGAGENT,
    'ADDITIONALWRITINGAGENT' as PartyRole,
    'ADDITIONALSERVICINGAGENT' as PartyRole,
    PartyRole.PAYEE,
    PartyRole.ASSIGNEE,
    'Secondary assignee' as PartyRole,
    'COVERAGEINSURED' as PartyRole,
    'Rider Insured' as PartyRole,
    PartyRole.THIRDPARTYDESIGNEE,
    'EXCHANGECOMPANY' as PartyRole,
];

export class PolicyParty {
    party: Party;
    private partyRolesList: PolicyParties[] = [];
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
    public entityType: EntityType | undefined;
    public organizationCode: string | undefined;
    public partyType: PartyType | undefined;
    public trustDate: string | undefined;
    public trustType: string | undefined;
    public identifications: Identification[] | undefined;
    public citizenCountry: Country | undefined;

    constructor(party: Party = {}) {
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

        this.addresses = new Addresses(party.addresses, party.preferredAddressIndicator);
        this.banks = new Banks(party.bankDetails);
        // to do - this is fake right now since there is no citizenCountry key on PartyBase yet
        this.citizenCountry = Country['US'];
        // this.citizenCountry = this.party.citizenCountry;
        this.emails = new Emails(party.emails);
        this.entityType = this.party.entityType;
        this.gender = this.party.gender;
        this.identifications = this.party.identifications;
        this.organizationCode = this.party.organizationCode;
        this.partyType = this.party.partyType;
        this.phones = new Phones(party.phones);
        this.trustDate = this.party.trustDate;
        this.trustType = this.party.trustType;
    }

    public addPartyRole(role?: PolicyParties) {
        if (!role) {
            return;
        }
        this.partyRolesList.push(role);
    }

    public get driversLicense() {
        return this.party.identifications?.find(
            identification => identification.identificationType === ('DRIVERLICENSE' as IdentificationType)
        );
    }

    public get passports() {
        return this.party.identifications?.filter(identification => identification.identificationType === IdentificationType.PASSPORT);
    }

    public get ssn(): string | undefined {
        return this.party.identifications?.find(identification => identification.identificationType === 'SSN')?.identificationValue;
    }

    public get stateId() {
        return this.party.identifications?.find(identification => identification.identificationType === IdentificationType.STATEPHOTOID);
    }

    public get taxId() {
        return this.party.identifications?.find(identification => identification.identificationType === IdentificationType.TIN);
    }

    public get partyRoles(): PolicyParties[] {
        return this.partyRolesList
            .filter(role => !isEndDated(role.endDate))
            .sort((a, b) => {
                return orderedRoles.indexOf(a.partyRole as PartyRole) - orderedRoles.indexOf(b.partyRole as PartyRole);
            });
    }

    public get preferredAddress(): Address | undefined {
        return this.addresses.preferred;
    }
    public get preferredBank(): BankAccount | undefined {
        return this.banks.preferred;
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
        parties?.forEach(party => {
            if (!party.partyId) {
                return;
            }
            const newParty = new PolicyParty(party);
            this.parties.push(newParty);
            this.partiesById.set(party.partyId, newParty);
        });
        partyRoles?.forEach(role => {
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
        return this.partiesByRole.get(role) || [];
    }

    public get owner(): PolicyParty | undefined {
        return this.getPartiesWithRole(PartyRole.OWNER)?.[0];
    }

    public get allOwners(): PolicyParty[] {
        return [...this.getPartiesWithRole(PartyRole.OWNER), ...this.getPartiesWithRole(PartyRole.JOINTOWNER)];
    }
}
