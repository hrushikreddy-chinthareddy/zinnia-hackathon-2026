import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { TFunction } from 'next-i18next';
import { SetStateAction } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { FieldVariant } from '@deps/components/fields/field';
import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import {
    BooleanValue,
    EntityTypeValue,
    NewTrustType,
    PolicyRole,
    ReasonValue,
    RoleLabel,
    Roles,
} from '@deps/constants/policy';
import {
    ExtendedEmail,
    ExtendedPhone,
    RoleData,
} from '@deps/contexts/RoleChangeContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_ERROR_STRING,
    ZAHARA_API_DATE_FORMAT,
    DIAL_NUMBER_MAX_LEN,
} from '@deps/types/constants';
import { capitalize } from '@deps/utils/strings';
import {
    Country,
    IdentificationType,
    Party,
    PartyRole,
    PartyType,
    Policy,
    PolicyPartyRoles,
    PreferredCommunicationType,
} from '@zinnia/api-types/types/sor';

import { newTrustOptions } from '../bene-change/components/beneficiary-details/bene-identification/bene-identification.helpers';

dayjs.extend(utc);

export const BooleanOptions = (t: TFunction) => {
    return [
        {
            label: t('yes'),
            value: BooleanValue.Yes,
        },
        {
            label: t('no'),
            value: BooleanValue.No,
        },
    ];
};

export const ContactOptions = (t: TFunction, role: string) => {
    let options = [
        {
            label: t('email'),
            value: PreferredCommunicationType.EMAIL,
        },
        {
            label: t('mail'),
            value: PreferredCommunicationType.REGULARMAIL,
        },
    ];
    if (
        role.toUpperCase() === Roles.THIRDPARTYDESIGNEE ||
        role.toUpperCase() === Roles.NEWTHIRDPARTYDESIGNEE
    ) {
        options = options.filter(
            (option) => option.value !== PreferredCommunicationType.REGULARMAIL
        );
    }
    return options;
};

export const ReasonOptions = (t: TFunction) => {
    return [
        { label: t('reasonOptions.ownerDeath'), value: ReasonValue.OwnerDeath },
        {
            label: t('reasonOptions.giftTransfer'),
            value: ReasonValue.GiftTransfer,
        },
        {
            label: t('reasonOptions.transferConsideration'),
            value: ReasonValue.TransferConsideration,
        },
    ];
};

export const countryOptions = [
    { label: 'Afghanistan', value: 'AF' },
    { label: 'Albania', value: 'AL' },
    { label: 'Algeria', value: 'DZ' },
    { label: 'Andorra', value: 'AD' },
    { label: 'Angola', value: 'AO' },
    { label: 'Argentina', value: 'AR' },
    { label: 'Armenia', value: 'AM' },
    { label: 'Australia', value: 'AU' },
    { label: 'Austria', value: 'AT' },
    { label: 'Azerbaijan', value: 'AZ' },
    { label: 'Bahamas', value: 'BS' },
    { label: 'Bahrain', value: 'BH' },
    { label: 'Bangladesh', value: 'BD' },
    { label: 'Barbados', value: 'BB' },
    { label: 'Belarus', value: 'BY' },
    { label: 'Belgium', value: 'BE' },
    { label: 'Belize', value: 'BZ' },
    { label: 'Benin', value: 'BJ' },
    { label: 'Bhutan', value: 'BT' },
    { label: 'Bolivia', value: 'BO' },
    { label: 'Bosnia and Herzegovina', value: 'BA' },
    { label: 'Botswana', value: 'BW' },
    { label: 'Brazil', value: 'BR' },
    { label: 'Brunei', value: 'BN' },
    { label: 'Bulgaria', value: 'BG' },
    { label: 'Burkina Faso', value: 'BF' },
    { label: 'Burundi', value: 'BI' },
    { label: 'Cambodia', value: 'KH' },
    { label: 'Cameroon', value: 'CM' },
    { label: 'Canada', value: 'CA' },
    { label: 'Cape Verde', value: 'CV' },
    { label: 'Central African Republic', value: 'CF' },
    { label: 'Chad', value: 'TD' },
    { label: 'Chile', value: 'CL' },
    { label: 'China', value: 'CN' },
    { label: 'Colombia', value: 'CO' },
    { label: 'Comoros', value: 'KM' },
    { label: 'Costa Rica', value: 'CR' },
    { label: 'Croatia', value: 'HR' },
    { label: 'Cuba', value: 'CU' },
    { label: 'Cyprus', value: 'CY' },
    { label: 'Czech Republic', value: 'CZ' },
    { label: 'Democratic Republic of the Congo', value: 'CD' },
    { label: 'Denmark', value: 'DK' },
    { label: 'Djibouti', value: 'DJ' },
    { label: 'Dominica', value: 'DM' },
    { label: 'Dominican Republic', value: 'DO' },
    { label: 'Ecuador', value: 'EC' },
    { label: 'Egypt', value: 'EG' },
    { label: 'El Salvador', value: 'SV' },
    { label: 'Equatorial Guinea', value: 'GQ' },
    { label: 'Eritrea', value: 'ER' },
    { label: 'Estonia', value: 'EE' },
    { label: 'Eswatini', value: 'SZ' },
    { label: 'Ethiopia', value: 'ET' },
    { label: 'Fiji', value: 'FJ' },
    { label: 'Finland', value: 'FI' },
    { label: 'France', value: 'FR' },
    { label: 'Gabon', value: 'GA' },
    { label: 'Gambia', value: 'GM' },
    { label: 'Georgia', value: 'GE' },
    { label: 'Germany', value: 'DE' },
    { label: 'Ghana', value: 'GH' },
    { label: 'Greece', value: 'GR' },
    { label: 'Grenada', value: 'GD' },
    { label: 'Guatemala', value: 'GT' },
    { label: 'Guinea', value: 'GN' },
    { label: 'Guinea-Bissau', value: 'GW' },
    { label: 'Guyana', value: 'GY' },
    { label: 'Haiti', value: 'HT' },
    { label: 'Honduras', value: 'HN' },
    { label: 'Hungary', value: 'HU' },
    { label: 'Iceland', value: 'IS' },
    { label: 'India', value: 'IN' },
    { label: 'Indonesia', value: 'ID' },
    { label: 'Iran', value: 'IR' },
    { label: 'Iraq', value: 'IQ' },
    { label: 'Ireland', value: 'IE' },
    { label: 'Israel', value: 'IL' },
    { label: 'Italy', value: 'IT' },
    { label: 'Jamaica', value: 'JM' },
    { label: 'Japan', value: 'JP' },
    { label: 'Jordan', value: 'JO' },
    { label: 'Kazakhstan', value: 'KZ' },
    { label: 'Kenya', value: 'KE' },
    { label: 'Kiribati', value: 'KI' },
    { label: 'Kuwait', value: 'KW' },
    { label: 'Kyrgyzstan', value: 'KG' },
    { label: 'Laos', value: 'LA' },
    { label: 'Latvia', value: 'LV' },
    { label: 'Lebanon', value: 'LB' },
    { label: 'Lesotho', value: 'LS' },
    { label: 'Liberia', value: 'LR' },
    { label: 'Libya', value: 'LY' },
    { label: 'Liechtenstein', value: 'LI' },
    { label: 'Lithuania', value: 'LT' },
    { label: 'Luxembourg', value: 'LU' },
    { label: 'Madagascar', value: 'MG' },
    { label: 'Malawi', value: 'MW' },
    { label: 'Malaysia', value: 'MY' },
    { label: 'Maldives', value: 'MV' },
    { label: 'Mali', value: 'ML' },
    { label: 'Malta', value: 'MT' },
    { label: 'Mauritania', value: 'MR' },
    { label: 'Mauritius', value: 'MU' },
    { label: 'Mexico', value: 'MX' },
    { label: 'Moldova', value: 'MD' },
    { label: 'Monaco', value: 'MC' },
    { label: 'Mongolia', value: 'MN' },
    { label: 'Montenegro', value: 'ME' },
    { label: 'Morocco', value: 'MA' },
    { label: 'Mozambique', value: 'MZ' },
    { label: 'Myanmar', value: 'MM' },
    { label: 'Namibia', value: 'NA' },
    { label: 'Nepal', value: 'NP' },
    { label: 'Netherlands', value: 'NL' },
    { label: 'New Zealand', value: 'NZ' },
    { label: 'Nicaragua', value: 'NI' },
    { label: 'Niger', value: 'NE' },
    { label: 'Nigeria', value: 'NG' },
    { label: 'North Korea', value: 'KP' },
    { label: 'North Macedonia', value: 'MK' },
    { label: 'Norway', value: 'NO' },
    { label: 'Oman', value: 'OM' },
    { label: 'Pakistan', value: 'PK' },
    { label: 'Palestine', value: 'PS' },
    { label: 'Panama', value: 'PA' },
    { label: 'Papua New Guinea', value: 'PG' },
    { label: 'Paraguay', value: 'PY' },
    { label: 'Peru', value: 'PE' },
    { label: 'Philippines', value: 'PH' },
    { label: 'Poland', value: 'PL' },
    { label: 'Portugal', value: 'PT' },
    { label: 'Qatar', value: 'QA' },
    { label: 'Romania', value: 'RO' },
    { label: 'Russia', value: 'RU' },
    { label: 'Rwanda', value: 'RW' },
    { label: 'Saudi Arabia', value: 'SA' },
    { label: 'Senegal', value: 'SN' },
    { label: 'Serbia', value: 'RS' },
    { label: 'Seychelles', value: 'SC' },
    { label: 'Sierra Leone', value: 'SL' },
    { label: 'Singapore', value: 'SG' },
    { label: 'Slovakia', value: 'SK' },
    { label: 'Slovenia', value: 'SI' },
    { label: 'Somalia', value: 'SO' },
    { label: 'South Africa', value: 'ZA' },
    { label: 'South Korea', value: 'KR' },
    { label: 'South Sudan', value: 'SS' },
    { label: 'Spain', value: 'ES' },
    { label: 'Sri Lanka', value: 'LK' },
    { label: 'Sudan', value: 'SD' },
    { label: 'Suriname', value: 'SR' },
    { label: 'Sweden', value: 'SE' },
    { label: 'Switzerland', value: 'CH' },
    { label: 'Syria', value: 'SY' },
    { label: 'Taiwan', value: 'TW' },
    { label: 'Tajikistan', value: 'TJ' },
    { label: 'Tanzania', value: 'TZ' },
    { label: 'Thailand', value: 'TH' },
    { label: 'Togo', value: 'TG' },
    { label: 'Tonga', value: 'TO' },
    { label: 'Trinidad and Tobago', value: 'TT' },
    { label: 'Tunisia', value: 'TN' },
    { label: 'Turkey', value: 'TR' },
    { label: 'Turkmenistan', value: 'TM' },
    { label: 'Uganda', value: 'UG' },
    { label: 'Ukraine', value: 'UA' },
    { label: 'United Arab Emirates', value: 'AE' },
    { label: 'United Kingdom', value: 'GB' },
    { label: 'United States', value: 'US' },
    { label: 'Uruguay', value: 'UY' },
    { label: 'Uzbekistan', value: 'UZ' },
    { label: 'Vanuatu', value: 'VU' },
    { label: 'Vatican City', value: 'VA' },
    { label: 'Venezuela', value: 'VE' },
    { label: 'Vietnam', value: 'VN' },
    { label: 'Yemen', value: 'YE' },
    { label: 'Zambia', value: 'ZM' },
    { label: 'Zimbabwe', value: 'ZW' },
];

export const checkForIrrevocableBeneficiaries = (
    parties: Array<Party>,
    roles: Array<PolicyPartyRoles>
) => {
    const activeBeneficiaryRoles = roles.filter(
        (role: PolicyPartyRoles) =>
            (role.partyRole === PartyRole.PRIMARYBENEFICIARY ||
                role.partyRole === PartyRole.CONTINGENTBENEFICIARY) &&
            !isEndDated(role.endDate)
    );
    for (const role of activeBeneficiaryRoles) {
        const party = parties.find(
            (party: Party) => party.partyId === role.partyId
        );
        if (party && party.isIrrevocable) {
            return true;
        }
    }
    return false;
};

export const buildSignatures = (policy: Policy, role: PartyRole) => {
    const parties = policy?.parties || [];
    const partyRoles = policy?.partyRoles || [];
    let isJointOwner = false;

    const activeJointOwner = partyRoles.find(
        (role) =>
            role.partyRole === String(PartyRole.JOINTOWNER) &&
            !isEndDated(role.endDate)
    );

    if (activeJointOwner && activeJointOwner.partyId) {
        const jointOwnerData = parties.find(
            (party) => party.partyId === activeJointOwner.partyId
        );
        if (jointOwnerData) {
            isJointOwner = true;
        }
    }

    const isIrrevocable = checkForIrrevocableBeneficiaries(parties, partyRoles);

    const createSignature = (signType: string) => ({
        signType,
        isSignedPresent: null,
        signDate: null,
        signDesignation: null,
    });

    const signatures =
        role == PartyRole.OWNER
            ? [createSignature(Roles.OWNER), createSignature(Roles.NEWOWNER)]
            : role == PartyRole.JOINTOWNER
            ? [createSignature(Roles.OWNER), createSignature(Roles.JOINT_OWNER)]
            : [createSignature(Roles.OWNER)];

    if (
        isJointOwner &&
        [PartyRole.OWNER, PartyRole.JOINTOWNER].includes(role)
    ) {
        role == PartyRole.JOINTOWNER
            ? signatures.push(createSignature(Roles.NEWJOINT_OWNER))
            : signatures.push(createSignature(Roles.JOINT_OWNER));
    }

    if (
        isIrrevocable &&
        [PartyRole.OWNER, PartyRole.JOINTOWNER].includes(role)
    ) {
        signatures.push(createSignature(Roles.IRREVOCABLE));
    }

    if ([PartyRole.THIRDPARTYDESIGNEE].includes(role)) {
        if (activeJointOwner) {
            signatures.push(createSignature(Roles.JOINT_OWNER));
        }
    }

    return signatures;
};

export const getActiveRoleParty = (
    policy: Policy,
    setExistingRoleData: React.Dispatch<SetStateAction<RoleData[]>>,
    roleValue: PartyRole
): void => {
    const parties = policy?.parties || [];
    const partyRoles = policy?.partyRoles || [];
    const activeRole = partyRoles.filter(
        (role) => role.partyRole === roleValue && !isEndDated(role.endDate)
    );

    if (!activeRole || activeRole.length === 0) {
        if (setExistingRoleData) {
            setExistingRoleData([]);
        }
    } else {
        // If multiple active roles, process each and return an array of parties
        const existingDataArray = activeRole.map((roleObj: any) => {
            let existingData =
                parties.find((party) => party.partyId === roleObj.partyId) ||
                {};

            existingData = { ...existingData };

            if ((existingData?.identifications ?? []).length > 0) {
                const ssnIdentification = (
                    existingData.identifications ?? []
                ).find(
                    (id) => id.identificationType === IdentificationType.SSN
                ) as any;

                if (ssnIdentification) {
                    let usCitizen = BooleanValue.No;

                    if (ssnIdentification?.issueCountry === Country.US) {
                        usCitizen = BooleanValue.Yes;
                    }

                    const permanentResident =
                        ssnIdentification?.permanentResident === true
                            ? BooleanValue.Yes
                            : ssnIdentification?.permanentResident === false
                            ? BooleanValue.No
                            : null;

                    const updatedIdentification = {
                        ...ssnIdentification,
                        usCitizen,
                        permanentResident,
                    };

                    existingData.identifications = [
                        updatedIdentification as any,
                    ];
                } else {
                    existingData.identifications = [];
                }
            }

            return existingData;
        });

        if (setExistingRoleData) {
            const mappedData = existingDataArray.map((data) => {
                return { party: data };
            });
            setExistingRoleData(mappedData as any);
        }
    }
};

export const normalizeRole = (role: string): PolicyRole => {
    return role.replace(/^new/i, '') as PolicyRole;
};

export const rolePartyCheck = (
    role: PolicyRole,
    partyType: PartyType
): boolean => {
    return (
        [
            PolicyRole.OWNER,
            PolicyRole.JOINTOWNER,
            PolicyRole.THIRDPARTYDESIGNEE,
        ].includes(role) &&
        (partyType === PartyType.TRUST || partyType === PartyType.ORGANIZATION)
    );
};

export const roleCheck = (role: PolicyRole): boolean => {
    return [
        PolicyRole.OWNER,
        PolicyRole.JOINTOWNER,
        PolicyRole.THIRDPARTYDESIGNEE,
    ].includes(role);
};

export const getFormattedDate = (date?: string | null): string => {
    return date && dayjs(date, ZAHARA_API_DATE_FORMAT).isValid()
        ? dayjs(date, ZAHARA_API_DATE_FORMAT).format(DATE_PICKER_FORMAT)
        : '';
};

export const getFormattedZaharaDate = (date?: string | null): string | null => {
    return date && dayjs(date, DATE_PICKER_FORMAT).isValid()
        ? dayjs(date, DATE_PICKER_FORMAT).format(ZAHARA_API_DATE_FORMAT)
        : null;
};

export const buildRoleChangeRequestBody = (
    roleData: RoleData,
    role: PolicyRole
) => {
    const {
        supportingDocumentAttached,
        changeReason = null,
        relationshipToParty = null,
        party = {},
        documents,
        caseId,
        correlationId,
    } = roleData || {};

    const { partyType = PartyType.INDIVIDUAL } = party || {};
    const isRolePartyCheck =
        [PolicyRole.OWNER, PolicyRole.JOINTOWNER].includes(role) &&
        [PartyType.TRUST, PartyType.ORGANIZATION].includes(partyType);

    let {
        firstName,
        fullName,
        middleName,
        prefix,
        suffix,
        phones = [],
        emails = [],
        addresses = [],
    } = party;

    const {
        lastName,
        trustType,
        dateOfBirth,
        gender = null,
        identifications = [],
        preferredCommunicationType = null,
        trustDate = null,
        entityType,
    } = party;

    if (partyType != PartyType.INDIVIDUAL) {
        firstName = '';
        middleName = '';
        prefix = undefined;
        suffix = undefined;
    }

    const signatures = (roleData?.signatures || []).map((sig: any) => ({
        ...sig,
        isSignedPresent:
            sig.isSignedPresent === BooleanValue.Yes
                ? true
                : sig.isSignedPresent === BooleanValue.No
                ? false
                : null,
        signDate: getFormattedZaharaDate(sig.signDate),
        signDesignation: sig.signDesignation || null,
    }));

    phones = phones.filter((item: any) => {
        const isEmpty = !item.dialNumber?.trim() || !item.phoneType;
        return !item.remove && !isEmpty;
    });

    emails = emails.filter((item: any) => {
        const isEmpty = !item.emailAddress?.trim();
        return !item.remove && !isEmpty;
    });

    addresses = addresses.filter((item: any) => {
        const isEmpty = !item.addressLine1?.trim();
        return !item.remove && !isEmpty;
    });

    fullName =
        partyType === PartyType.INDIVIDUAL
            ? toTitleCase(
                  [prefix, firstName, middleName, lastName, suffix]
                      .filter(Boolean)
                      .join(' ')
              ) || ''
            : lastName ?? '';

    const updatedIdentifications = identifications.map(
        (identification: any) => {
            const { usCitizen, permanentResident, ...rest } = identification;
            return {
                ...rest,
                issueCountry:
                    usCitizen === BooleanValue.Yes
                        ? Country.US
                        : rest.issueCountry || null,
                permanentResident:
                    usCitizen === BooleanValue.Yes
                        ? null
                        : permanentResident === BooleanValue.Yes
                        ? true
                        : permanentResident === BooleanValue.No
                        ? false
                        : null,
            };
        }
    );

    return {
        effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
        caseId,
        correlationId: correlationId || uuidV4(),
        changeReason: changeReason || null,
        signatures: signatures || [],
        beneDetailsReqInd: false,
        documents:
            partyType === PartyType.TRUST ||
            role !== PolicyRole.THIRDPARTYDESIGNEE
                ? documents
                : [],
        supportingDocumentAttached:
            role === PolicyRole.THIRDPARTYDESIGNEE &&
            partyType !== PartyType.TRUST
                ? null
                : supportingDocumentAttached === BooleanValue.Yes
                ? true
                : supportingDocumentAttached === BooleanValue.No
                ? false
                : null,
        relationshipToParty,
        party: {
            partyType,
            identifications: updatedIdentifications,
            prefix,
            firstName,
            middleName,
            lastName,
            suffix,
            fullName,
            trustType: partyType === PartyType.TRUST ? trustType : null,
            gender: isRolePartyCheck ? null : gender,
            dateOfBirth: isRolePartyCheck
                ? null
                : getFormattedZaharaDate(dateOfBirth),
            preferredCommunicationType,
            addresses,
            phones,
            emails,
            entityType:
                partyType === PartyType.ORGANIZATION ? entityType : null,
            trustDate:
                partyType === PartyType.TRUST
                    ? getFormattedZaharaDate(trustDate)
                    : null,
        },
    };
};

export const validate = (
    roleData: any,
    addRole: boolean,
    removeRole: boolean,
    t: TFunction,
    roleLabel: RoleLabel,
    role: PartyRole,
    removedTpdIndex?: number | null
) => {
    const currentErrors: Record<string, string> = {};
    const { party } = roleData;
    const {
        partyType,
        firstName,
        lastName,
        addresses,
        trustDate,
        preferredCommunicationType,
        phones,
        emails,
    } = party;
    const allowedRolesForRemove: (Roles | PartyRole)[] = [
        Roles.THIRDPARTYDESIGNEE,
        Roles.NEWTHIRDPARTYDESIGNEE,
    ];

    if (
        allowedRolesForRemove.includes(role) &&
        addRole &&
        removedTpdIndex !== null
    ) {
        return currentErrors;
    }
    if (addRole) {
        currentErrors['owner'] = t('formValidations.addRole', { roleLabel });
        return currentErrors;
    }

    if (!removeRole && !allowedRolesForRemove.includes(role)) {
        currentErrors['removeOwner'] = t('formValidations.removeRole', {
            roleLabel,
        });
        return currentErrors;
    }

    if ([PartyRole.OWNER, PartyRole.JOINTOWNER].includes(role)) {
        if (roleData?.changeReason == ReasonValue.OwnerDeath) {
            currentErrors['reason'] = t('formValidations.reason');
        }
        if (!roleData?.relationshipToParty) {
            currentErrors['relationship'] = t('formValidations.relationship', {
                roleLabel,
            });
        }
        if (!trustDate && partyType === PartyType.TRUST) {
            currentErrors['trustDate'] = t('formValidations.trustDate', {
                roleLabel,
            });
        }
        if (!roleData?.party?.preferredCommunicationType) {
            currentErrors['preferredType'] = t(
                'formValidations.preferredType',
                { roleLabel }
            );
        }
    }

    if (partyType === PartyType.INDIVIDUAL) {
        if ([PartyRole.PAYOR, PartyRole.THIRDPARTYDESIGNEE].includes(role)) {
            if (!firstName?.trim()) {
                currentErrors['name'] = t('formValidations.name', {
                    roleLabel,
                });
            }
        } else {
            const allowedRoles: (Roles | PartyRole)[] = [
                Roles.PAYOR,
                Roles.THIRDPARTYDESIGNEE,
                Roles.NEWTHIRDPARTYDESIGNEE,
            ];
            if (
                !allowedRoles.includes(role) &&
                (!firstName?.trim() || !lastName?.trim())
            ) {
                currentErrors['name'] = t('formValidations.name', {
                    roleLabel,
                });
            }
        }
    } else {
        if (!lastName?.trim()) {
            currentErrors['name'] = t('formValidations.name', { roleLabel });
        }
    }

    if (addresses && addresses.length > 0) {
        const invalidAddress = addresses.some((address: any) => {
            if (address.remove !== true) {
                if (
                    [PartyRole.OWNER, PartyRole.JOINTOWNER].includes(
                        role.toUpperCase() as PartyRole
                    ) &&
                    !address?.addressLine1?.trim()
                ) {
                    return true;
                }
                const hasAddressLine =
                    address.addressLine1?.trim() ||
                    address.addressLine2?.trim();

                if (hasAddressLine) {
                    if (!address.city?.trim()) {
                        currentErrors['city'] = t('formValidations.city');
                    }
                    if (!address.state?.trim()) {
                        currentErrors['state'] = t('formValidations.state');
                    }
                    if (!address.zipCode?.trim()) {
                        currentErrors['zipCode'] = t('formValidations.zipCode');
                    }
                } else {
                    currentErrors['addressLine1'] = t(
                        'formValidations.addressDetails',
                        { roleLabel }
                    );
                }
            }
            return false;
        });

        if (invalidAddress) {
            currentErrors['address'] = t('formValidations.addressDetails', {
                roleLabel,
            });
        }
    }

    if (preferredCommunicationType === PreferredCommunicationType.EMAIL) {
        if (
            !emails ||
            emails.length === 0 ||
            !emails.some((email: ExtendedEmail) => email.remove !== true)
        ) {
            currentErrors['emailRequired'] = t('formValidations.emailRequired');
        } else {
            const invalidEmail = emails.some((email: ExtendedEmail) => {
                return (
                    email.remove !== true &&
                    (!email.emailAddress || email.emailAddress.trim() === '')
                );
            });
            if (invalidEmail) {
                currentErrors['email'] = t('formValidations.validEmail');
            }
        }
    }
    if (
        !phones ||
        phones.length === 0 ||
        !phones.some((phone: ExtendedPhone) => phone.remove !== true)
    ) {
        currentErrors['phoneRequired'] = t('formValidations.phoneRequired');
    } else {
        const invalidPhone = party.phones.some((phone: ExtendedPhone) => {
            return (
                (phone.remove !== true && !phone.dialNumber) ||
                phone?.dialNumber?.trim() === '' ||
                Number(phone?.dialNumber?.trim().length) < DIAL_NUMBER_MAX_LEN
            );
        });
        if (invalidPhone) {
            currentErrors['phone'] = t('formValidations.validPhone');
        }
    }

    return currentErrors;
};

export const getVariant = (
    key: string,
    targetObject: any,
    isReadOnly: boolean
) => {
    if (isReadOnly) {
        return FieldVariant.Inactive;
    }
    const isEmpty = !targetObject?.[key]?.trim();
    return isEmpty ? FieldVariant.Error : FieldVariant.Default;
};

export const filterNotRemoved = <T extends object>(
    items: T[] | undefined | null
): T[] => {
    return (items || []).filter((item: T) => !(item as any)?.remove) || [];
};

export const getVisibleAddressLines = (address?: any): number => {
    if (!address) return 1;
    if (address.addressLine3?.trim()) return 3;
    if (address.addressLine2?.trim()) return 2;
    return 1;
};

export const createTransactionLink = (
    transactionType: string,
    policy: { policyNumber?: string; planCode?: string },
    t: (key: string, options?: any) => string,
    eligibilityData: Record<string, any>
): any => {
    const defaultConfig: any = {
        href: t(`site.navLinks.${transactionType}.link`, {
            id: policy.policyNumber,
            planCode: policy.planCode,
        }),
        name: t(`site.navLinks.${transactionType}.text`),
        hideLabel: false,
        isEligible:
            eligibilityData?.[`isEligibleManage${capitalize(transactionType)}`],
    };

    return defaultConfig;
};

export const getPartyName = (party: Party | undefined): string => {
    if (!party) {
        return DEFAULT_ERROR_STRING;
    }

    const {
        firstName = '',
        lastName = '',
        middleName = '',
        fullName = '',
    } = party;

    return toTitleCase(
        [firstName, middleName, lastName]
            .filter((name) => name && name.trim() !== '')
            .join(' ') || fullName?.trim()
    );
};

export const getContactLabel = (
    value: PreferredCommunicationType,
    t: TFunction,
    role: string
): string => {
    const option = ContactOptions(t, role).find(
        (option) => option.value === value
    );
    return option ? option.label : '';
};

export const formatDate = (date?: string | null): string => {
    if (!date) {
        return DEFAULT_ERROR_STRING;
    }
    return dayjs(date, DATE_PICKER_FORMAT).format(DEFAULT_DATE_FORMAT);
};

export const getTrustTypeLabel = (
    value: NewTrustType,
    t: TFunction,
    defaultLabel: string = ''
): string => {
    const option = newTrustOptions(t).find((option) => option.value === value);

    return option?.label ?? defaultLabel;
};

export const getEntityTypeLabel = (
    value: EntityTypeValue,
    t: TFunction,
    defaultLabel: string = 'Other'
): string => {
    const option = entityTypeOptions(t).find(
        (option) => option.value === value
    );
    return option?.label ?? defaultLabel;
};

export const ANYTIME = 'Anytime';
export const DEFAULT_COUNTRY_CODE = '1';
export const NEW = 'new';
export const NO = 'No';
export const IDENTIFICATIONS = 'identifications';
export const INTERNAL500CTALINK =
    'https://zinnia.atlassian.net/servicedesk/customer/portal/6';

export const GetIsReadOnly = (
    isReadOnly: boolean,
    role: PolicyRole
): boolean => {
    return (
        isReadOnly ||
        [PolicyRole.OWNER, PolicyRole.PAYOR, PolicyRole.THIRDPARTYDESIGNEE]
            .map((r) => r.toUpperCase())
            .includes(role)
    );
};

export const CLIENT_COPY = 'CLIENT_COPY';
export const NEW_BUSINESS = 'NEW_BUSINESS';

export const entityTypeOptions = (t: TFunction) => {
    return [
        {
            label: t('entityTypeOptions.soleProprietorship'),
            value: EntityTypeValue.SoleProprietorship,
        },
        {
            label: t('entityTypeOptions.generalPartnership'),
            value: EntityTypeValue.GeneralPartnership,
        },
        {
            label: t('entityTypeOptions.limitedPartnership'),
            value: EntityTypeValue.LimitedPartnership,
        },
        {
            label: t('entityTypeOptions.sCorporation'),
            value: EntityTypeValue.SCorporation,
        },
        {
            label: t('entityTypeOptions.cCorporation'),
            value: EntityTypeValue.CCorporation,
        },
        {
            label: t('entityTypeOptions.limitedLiabilityCompany'),
            value: EntityTypeValue.LimitedLiabilityCompany,
        },
        {
            label: t('entityTypeOptions.charitableOrganization'),
            value: EntityTypeValue.CharitableOrganization,
        },
        {
            label: t('entityTypeOptions.estate'),
            value: EntityTypeValue.Estate,
        },
        {
            label: t('entityTypeOptions.corporation'),
            value: EntityTypeValue.Corporation,
        },
        {
            label: t('entityTypeOptions.other'),
            value: EntityTypeValue.Other,
        },
    ];
};

export const createMainCta = (t: TFunction, handleContinue: () => void) => {
    return {
        text: t('general.continue'),
        onClick: handleContinue,
    };
};

export const createSecondaryCta = (
    t: TFunction,
    policy: Policy,
    parentPage: ParentPage
) => {
    const { policyNumber, product } = policy;

    return {
        text: t('general.leaveTransaction'),
        href: `/policies/${product?.planCode}/${policyNumber}/policy/${parentPage}`,
    };
};
