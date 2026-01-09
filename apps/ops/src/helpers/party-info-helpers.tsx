import { I18n, i18n, TFunction } from 'next-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { ReactComponent as User } from '@deps/styles/elements/icons/actions/user.svg';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';
import { ReactComponent as OfficeBuildingIcon } from '@deps/styles/elements/icons/icons_outlined/office-building.svg';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { POM_Models_ProducerType } from '@zinnia/api-types/types/pom';
import {
    AccountType,
    Address,
    AddressType,
    CoverageParticipants,
    EmploymentStatus,
    Gender,
    PartyType,
    Policy,
    Party,
    PolicyCoverage,
    PreferredCommunicationType,
    RelationshipToParty,
    RiskClass,
    SubStandardRating,
} from '@zinnia/api-types/types/sor';

import { getCountryByCode } from './countries.helpers';
import { isEndDated } from './date.helpers';
import { formatPhone, safeString, toTitleCase } from './string.helpers';

// switch case for header icon
export const getHeaderIcon = (partyType: string | undefined): JSX.Element => {
    switch (partyType) {
        case PartyType.TRUST:
            return (
                <DocumentIcon height={24} width={24} className="self-center" />
            );
        case PartyType.ORGANIZATION:
            return (
                <OfficeBuildingIcon
                    height={24}
                    width={24}
                    className="self-center"
                />
            );
        case PartyType.INDIVIDUAL:
        default:
            return (
                <User
                    role="presentation"
                    height={24}
                    width={24}
                    className="self-center"
                />
            );
    }
};

export const getPartyFullName = (partyInfo: Party | undefined): string => {
    const { partyType } = partyInfo || {};
    switch (partyType) {
        case PartyType.INDIVIDUAL:
            return getFullName(partyInfo);

        case PartyType.ORGANIZATION:
        case PartyType.TRUST:
            return toTitleCase(partyInfo?.fullName);
        default:
            return partyType ?? '';
    }
};

export const getHeaderText = (
    partyInfo:
        | (Party & {
              producerName?: string;
              producerType?: string;
          })
        | undefined
): string | JSX.Element => {
    const { partyType, producerType, producerName } = partyInfo || {};
    switch (partyType) {
        case PartyType.INDIVIDUAL:
            if (
                producerType === POM_Models_ProducerType.CORPORATION &&
                producerName
            ) {
                return <PiiWrapper>{toTitleCase(producerName)}</PiiWrapper>;
            }
            if (!partyInfo?.firstName && !!partyInfo?.fullName) {
                return (
                    <PiiWrapper>{toTitleCase(partyInfo?.fullName)}</PiiWrapper>
                );
            } else {
                return (
                    <PiiWrapper className="flex whitespace-nowrap xs:flex-col xs:gap-0 lg:flex-row lg:gap-2">
                        <span>
                            {`${safeString(toTitleCase(partyInfo?.firstName))}`}{' '}
                            {`${toTitleCase(partyInfo?.middleName)} `}
                        </span>
                        <span>
                            {`${safeString(toTitleCase(partyInfo?.lastName))}`}{' '}
                            {`${toTitleCase(partyInfo?.suffix)}`}
                        </span>
                    </PiiWrapper>
                );
            }

        case PartyType.ORGANIZATION:
            return <PiiWrapper>{toTitleCase(partyInfo?.fullName)}</PiiWrapper>;

        case PartyType.TRUST:
            return <PiiWrapper>{toTitleCase(partyInfo?.fullName)}</PiiWrapper>;
        default:
            return partyType ?? '';
    }
};

export const getSelectedPolicyParty = (
    policy: Policy,
    personId: string | string[] | undefined
): Party | null => {
    if (!personId || typeof personId !== 'string') return null;
    return (
        policy.parties?.find((person) => person.partyId === personId) ?? null
    );
};

function formatAddress(address: Address) {
    const formatted = [
        toTitleCase(address?.addressLine1),
        toTitleCase(address?.addressLine2),
        toTitleCase(address?.addressLine3),
        `${toTitleCase(address?.city)}, ${address?.state} ${address?.zipCode}${
            address?.zipCodeExtension ? `-${address?.zipCodeExtension}` : ''
        }`,
        getCountryByCode(address?.country),
    ].filter(Boolean);
    return formatted.join('<br/>');
}

export const getPrefCommunicationType = (
    partyInfo: Party | null,
    t: TFunction
): JSX.Element | null => {
    const { preferredCommunicationType } = partyInfo || {};
    let text: string | null = null;
    let contactValue = '';

    switch (preferredCommunicationType) {
        case PreferredCommunicationType.EMAIL: {
            text = t('people.party.contact.preferred.email');

            const emailInfo = partyInfo?.emails?.find(
                (email) => !isEndDated(email?.endDate)
            );
            contactValue =
                emailInfo && emailInfo.emailAddress
                    ? emailInfo?.emailAddress?.toLowerCase()
                    : '';
            break;
        }
        case PreferredCommunicationType.PHONE:
        case PreferredCommunicationType.TEXT: {
            text = t(
                `people.party.contact.preferred.${preferredCommunicationType.toLowerCase()}`
            );
            const phoneInfo = partyInfo?.phones?.find(
                (phone) => !isEndDated(phone?.endDate)
            );
            contactValue = phoneInfo ? formatPhone(phoneInfo) : '';
            break;
        }
        case PreferredCommunicationType.REGULARMAIL: {
            text = t('people.party.contact.preferred.mail');
            const addressInfo = partyInfo?.addresses?.find(
                (address) => !isEndDated(address?.endDate)
            );
            contactValue = addressInfo ? formatAddress(addressInfo) : '';
            break;
        }
        default: {
            const defaultAddressInfo = partyInfo?.addresses?.find(
                (address) => !isEndDated(address?.endDate)
            );
            contactValue = defaultAddressInfo
                ? formatAddress(defaultAddressInfo)
                : '';
            break;
        }
    }

    if (contactValue) {
        return (
            <div className="mr-8 break-all">
                <p className="typography-labels-field-label">
                    {t('people.party.contact.method')}
                </p>
                <p className="typography-content-body-sm">
                    <PiiWrapper>{contactValue}</PiiWrapper>
                </p>
                {text && (
                    <AssistiveText
                        text={text}
                        variant={AssistiveTextVariant.Success}
                    />
                )}
            </div>
        );
    } else {
        return null;
    }
};

export const getRelationshipToInsured = (
    relationshipToInsured: RelationshipToParty | null,
    t: TFunction
): string | null => {
    switch (relationshipToInsured) {
        case RelationshipToParty.CHILD:
            return t('relationshipToInsured.child');
        case RelationshipToParty.SON:
            return t('relationshipToInsured.son');
        case RelationshipToParty.DAUGHTER:
            return t('relationshipToInsured.daughter');
        case RelationshipToParty.GRANDCHILD:
            return t('relationshipToInsured.grandchild');
        case RelationshipToParty.BROTHER:
            return t('relationshipToInsured.brother');
        case RelationshipToParty.SISTER:
            return t('relationshipToInsured.sister');
        case RelationshipToParty.FATHER:
            return t('relationshipToInsured.father');
        case RelationshipToParty.MOTHER:
            return t('relationshipToInsured.mother');
        case RelationshipToParty.STEPFATHER:
            return t('relationshipToInsured.stepfather');
        case RelationshipToParty.STEPMOTHER:
            return t('relationshipToInsured.stepmother');
        case RelationshipToParty.SPOUSE:
            return t('relationshipToInsured.spouse');
        case RelationshipToParty.DOMESTICPARTNER:
            return t('relationshipToInsured.domesticPartner');
        case RelationshipToParty.LIFEPARTNER:
            return t('relationshipToInsured.lifePartner');
        case RelationshipToParty.FIANCE:
            return t('relationshipToInsured.fiance');
        case RelationshipToParty.EXECUTORS:
            return t('relationshipToInsured.executors');
        case RelationshipToParty.SELF:
            return t('relationshipToInsured.self');
        case RelationshipToParty.OTHER:
            return t('relationshipToInsured.other');
        default:
            return relationshipToInsured;
    }
};

export const getBankAccountType = (
    accountType: AccountType | string | undefined,
    t: TFunction,
    appendAccount = false
): string => {
    if (accountType == null) return DEFAULT_ERROR_STRING;

    let accountString;
    switch (accountType) {
        case AccountType.CHECKING:
            accountString = t('bankAccountType.checking');
            break;
        case AccountType.SAVINGS:
            accountString = t('bankAccountType.savings');
            break;
        case AccountType.BROKERAGEACCOUNT:
            accountString = t('bankAccountType.brokerageAmount');
            break;
        case AccountType.CERTIFICATEOFDEPOSIT:
            accountString = t('bankAccountType.certificateOfDeposit');
            break;
        case AccountType.CREDITCARD:
            accountString = t('bankAccountType.creditCard');
            break;
        case AccountType.DEBITCARD:
            accountString = t('bankAccountType.debitCard');
            break;
        default:
            accountString = accountType;
    }
    return appendAccount ? `${accountString} ${t('account')}` : accountString;
};

export const findCoverageParticipant = (
    coverage: PolicyCoverage,
    partyID: string | undefined
): CoverageParticipants | null => {
    if (coverage.coverageLayers) {
        for (const layer of coverage.coverageLayers) {
            const participant = layer.coverageParticipants?.find(
                (p) => p.partyId === partyID
            );
            if (participant) {
                return participant;
            }
        }
    }
    return null;
};

export const getRiskClass = (
    riskClass: RiskClass | undefined
): string | undefined => {
    const { t } = i18n as I18n;
    switch (riskClass) {
        case RiskClass.ULTRANONTOBACCO:
            return t(
                'people.card.underwritingInfo.riskClassOptions.ultraNonTobacco'
            ) as string;
        case RiskClass.ELITENONTOBACCO:
            return t(
                'people.card.underwritingInfo.riskClassOptions.eliteNonTobacco'
            ) as string;
        case RiskClass.PREFERREDNONTOBACCO:
            return t(
                'people.card.underwritingInfo.riskClassOptions.preferredNonTobacco'
            ) as string;
        case RiskClass.STANDARDNONTOBACCO:
            return t(
                'people.card.underwritingInfo.riskClassOptions.standardNonTobacco'
            ) as string;
        case RiskClass.STANDARDTOBACCO:
            return t(
                'people.card.underwritingInfo.riskClassOptions.standardTobacco'
            ) as string;
        case RiskClass.STANDARDAGGREGATE:
            return t(
                'people.card.underwritingInfo.riskClassOptions.standardAggregate'
            ) as string;
        case RiskClass.SUBSTANDARDNONTOBACCO:
            return t(
                'people.card.underwritingInfo.riskClassOptions.substandardNonTobacco'
            ) as string;
        case RiskClass.SUBSTANDARDTOBACCO:
            return t(
                'people.card.underwritingInfo.riskClassOptions.substandardTobacco'
            ) as string;
        default:
            return riskClass;
    }
};

export const getSubstandardRating = (
    substandardRating: SubStandardRating | undefined,
    t: TFunction
): string | undefined => {
    switch (substandardRating) {
        case SubStandardRating.NONETABLE:
            return t(
                'people.card.underwritingInfo.substandardRatingOptions.none'
            ) as string;
        case SubStandardRating.TABLEA:
            return t(
                'people.card.underwritingInfo.substandardRatingOptions.tableA'
            ) as string;
        case SubStandardRating.TABLEB:
            return t(
                'people.card.underwritingInfo.substandardRatingOptions.tableB'
            ) as string;
        case SubStandardRating.TABLEC:
            return t(
                'people.card.underwritingInfo.substandardRatingOptions.tableC'
            ) as string;
        case SubStandardRating.TABLED:
            return t(
                'people.card.underwritingInfo.substandardRatingOptions.tableD'
            ) as string;
        case SubStandardRating.TABLEE:
            return t(
                'people.card.underwritingInfo.substandardRatingOptions.tableE'
            ) as string;
        case SubStandardRating.TABLEF:
            return t(
                'people.card.underwritingInfo.substandardRatingOptions.tableF'
            ) as string;
        case SubStandardRating.TABLEG:
            return t(
                'people.card.underwritingInfo.substandardRatingOptions.tableG'
            ) as string;
        case SubStandardRating.TABLEH:
            return t(
                'people.card.underwritingInfo.substandardRatingOptions.tableH'
            ) as string;
        default:
            return substandardRating;
    }
};

export const getSexAtBirth = (
    sexAtBirth: Gender | undefined,
    t: TFunction
): string | undefined => {
    switch (sexAtBirth) {
        case Gender.MALE:
            return t('people.card.underwritingInfo.gender.male') as string;
        case Gender.FEMALE:
            return t('people.card.underwritingInfo.gender.female') as string;
        default:
            return sexAtBirth;
    }
};

export const getEmploymentStatus = (
    employmentStatus: EmploymentStatus | undefined,
    t: TFunction
): string | undefined => {
    switch (employmentStatus) {
        case EmploymentStatus.ACTIVE:
            return t(
                'people.card.underwritingInfo.employmentStatus.active'
            ) as string;
        case EmploymentStatus.RETIRED:
            return t(
                'people.card.underwritingInfo.employmentStatus.retired'
            ) as string;
        case EmploymentStatus.DISABLED:
            return t(
                'people.card.underwritingInfo.employmentStatus.disabled'
            ) as string;
        case EmploymentStatus.LAIDOFF:
            return t(
                'people.card.underwritingInfo.employmentStatus.laidOff'
            ) as string;
        case EmploymentStatus.LEAVEDUETOCHILDBIRTH:
            return t(
                'people.card.underwritingInfo.employmentStatus.leaveDueToChildbirth'
            ) as string;
        case EmploymentStatus.LEAVEDUETOMILITARYSERVICE:
            return t(
                'people.card.underwritingInfo.employmentStatus.leaveDueToMilitaryService'
            ) as string;
        case EmploymentStatus.LEAVEOFABSENCE:
            return t(
                'people.card.underwritingInfo.employmentStatus.leaveOfAbsence'
            ) as string;
        case EmploymentStatus.RESIGNED:
            return t(
                'people.card.underwritingInfo.employmentStatus.resigned'
            ) as string;
        case EmploymentStatus.SHORTTERMDISABILITY:
            return t(
                'people.card.underwritingInfo.employmentStatus.shortTermDisability'
            ) as string;
        case EmploymentStatus.TERMINATED:
            return t(
                'people.card.underwritingInfo.employmentStatus.terminated'
            ) as string;
        case EmploymentStatus.UNKNOWN:
            return t(
                'people.card.underwritingInfo.employmentStatus.unknown'
            ) as string;
        case EmploymentStatus.OTHER:
            return t(
                'people.card.underwritingInfo.employmentStatus.other'
            ) as string;
        default:
            return employmentStatus;
    }
};

export const getAddressType = (
    addressType: AddressType | undefined,
    t: TFunction
): string | null => {
    switch (addressType) {
        default:
        case AddressType.RESIDENCE:
            return t('people.card.addressOptions.residence');
        case AddressType.POBOX:
            return t('people.card.addressOptions.poBox');
        case AddressType.BUSINESS:
            return t('people.card.addressOptions.business');
    }
};

export const getFullName = (party: Party | undefined): string => {
    if (!party) {
        return DEFAULT_ERROR_STRING;
    }

    const { prefix, firstName, middleName, lastName, suffix } = party;

    return toTitleCase(
        [prefix, firstName, middleName, lastName, suffix]
            .filter(Boolean)
            .join(' ')
    );
};

/**
 * Constructs a First and Last name string from a party object.
 *
 * @param {Party} party - The party object
 * @returns {string} A string representation of the party's first and last name in title case. If party is not provided, returns DEFAULT_ERROR_STRING.
 * @example
 * const party = { prefix: 'Mr.', firstName: 'John', middleName: 'Jacob', lastName: 'Doe', suffix: 'Jr.' };
 * const firstLastName = getFirstLastName(party); // Returns: "Mr. John Doe Jr."
 */
export const getFirstLastName = (party: Party | undefined): string => {
    if (!party) {
        return DEFAULT_ERROR_STRING;
    }

    const { prefix, firstName, lastName, suffix } = party;

    return toTitleCase(
        [prefix, firstName, lastName, suffix].filter(Boolean).join(' ')
    );
};

export const getName = (party: Party | undefined): string => {
    if (!party) {
        return DEFAULT_ERROR_STRING;
    }

    const { firstName, lastName } = party;

    return toTitleCase([firstName, lastName].filter(Boolean).join(' '));
};
