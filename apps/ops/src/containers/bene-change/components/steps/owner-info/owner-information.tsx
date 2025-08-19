import {
    IdentificationType,
    PartyType,
    PhoneBase,
    Policy,
} from '@zinnia/api-types/types/sor';
import { FieldSize } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Field, { FieldType, FieldVariant } from '@deps/components/fields/field';
import AddressEntry, {
    DEFAULT_ADDRESS,
} from '@deps/components/otp-withdrawal-form/address-entry';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { SingleParty } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import PartyPhone, {
    DEFAULT_PHONE,
} from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import { RadioOrientation } from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useBeneChange } from '@deps/containers/bene-change/bene-change-provider';
import CardContainer from '@deps/containers/card-container/card-container';
import { isEndDated } from '@deps/helpers/date.helpers';
import {
    Address,
    AddressTypes,
    Party,
    PartyRoles,
    Phone,
    PhoneTypes,
} from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import {
    ENTERPRISE_ADDRESS_TYPE,
    EnterpriseAddress,
} from '../../beneficiary-details/address-details/address-details.helpers';
import {
    newTrustOptions,
    TrustType,
} from '../../beneficiary-details/bene-identification/bene-identification.helpers';
import PartyTypes from '../../beneficiary-details/bene-identification/party-type';
import { ENTERPRISE_PHONE_TYPE } from '../../beneficiary-details/phone-details/phone-details.helpers';

export const DEFAULT_PARTY = [
    {
        partyRoleType: PartyRoles.OWNER,
        firstName: '',
        middleName: '',
        lastName: '',
        fullName: '',
        suffix: null,
        dob: { text: null },
        taxId: '',
        email: null,
        employer: null,
        maritalStatus: { text: null },
        addresses: [],
        phones: [],
        partyType: PartyType.INDIVIDUAL,
    },
];

interface OwnerInformationProps {
    configs: PartyConfig[];
    isFormStateReadOnly?: boolean;
    policy: Policy;
}

type UpdatePartyPropertyFn = (
    party: Party,
    key: keyof Party,
    value: any
) => void;

type TranslationFunction = (key: string) => string;

const formatAddress = (address: EnterpriseAddress) => {
    return {
        addressLine1: address?.addressLine1 || '',
        addressLine2: address?.addressLine2 || null,
        addressLine3: address?.addressLine3 || null,
        addressLine4: null,
        addressType:
            address?.addressType === ENTERPRISE_ADDRESS_TYPE.HOME
                ? AddressTypes.DEFAULT
                : AddressTypes.MAILING_ADDRESS,
        city: address?.city || null,
        country: address?.country,
        state: address?.state || '',
        zip: address?.zipCode || '',
        zipPlusFour: address?.zipCodeExtension || null,
        startDate: address?.startDate || null,
        endDate: address?.endDate || null,
        addressId: address?.addressId || null,
    };
};

const formatPhone = (phone: PhoneBase) => {
    return {
        phoneNumber: phone?.dialNumber || null,
        phoneTypeDesc: null,
        phoneType: {
            text: PhoneTypes.Owner_Phone_Day,
        },
    };
};

const getFormattedAddresses = (policyParty: any) => {
    const addresses = [];
    let homeAddresses = policyParty?.addresses
        ?.map((address: any) => {
            if (
                address.addressType === ENTERPRISE_ADDRESS_TYPE.HOME &&
                !isEndDated(address?.endDate)
            ) {
                return address;
            }
        })
        .filter((item: any) => item !== undefined);

    homeAddresses = homeAddresses?.sort((a: any, b: any) => {
        if (a.addressId === policyParty?.preferredAddressIndicator) return -1;
        if (b.addressId === policyParty?.preferredAddressIndicator) return 1;

        return dayjs(a?.startDate, ZAHARA_API_DATE_FORMAT).isBefore(
            dayjs(b?.startDate, ZAHARA_API_DATE_FORMAT)
        )
            ? 1
            : -1;
    });

    if (homeAddresses && homeAddresses.length > 0) {
        addresses.push(homeAddresses[0]);
    }
    let mailingAddresses = policyParty?.addresses
        ?.map((address: any) => {
            if (
                address.addressType === ENTERPRISE_ADDRESS_TYPE.MAILING &&
                !isEndDated(address.endDate)
            ) {
                return address;
            }
        })
        .filter((item: any) => item !== undefined);

    mailingAddresses = mailingAddresses?.sort((a: any, b: any) => {
        if (a.addressId === policyParty?.preferredAddressIndicator) return -1;
        if (b.addressId === policyParty?.preferredAddressIndicator) return 1;
        return dayjs(a?.startDate, ZAHARA_API_DATE_FORMAT).isBefore(
            dayjs(b?.startDate, ZAHARA_API_DATE_FORMAT)
        )
            ? 1
            : -1;
    });

    if (mailingAddresses && mailingAddresses.length > 0) {
        addresses.push(mailingAddresses[0]);
    }

    const formattedAddresses: any = [];
    addresses?.map((address: any) => {
        formattedAddresses.push(formatAddress(address));
    });

    return formattedAddresses;
};

const getPartyInfo = (policy: Policy, role: PartyRoles) => {
    const id = policy?.partyRoles?.find(
        (partyRole) => partyRole.partyRole === role.replace('_', '')
    )?.partyId;
    if (!id) {
        return null;
    }
    const policyParty = policy?.parties?.find((item) => item.partyId === id);

    const phones = policyParty?.phones
        ?.map((phone) => {
            if (
                (phone.phoneType === ENTERPRISE_PHONE_TYPE.MOBILE ||
                    phone.phoneType === ENTERPRISE_PHONE_TYPE.HOME) &&
                !isEndDated(phone.endDate)
            ) {
                return formatPhone(phone);
            }
        })
        .filter((item: any) => item !== undefined);

    const formattedAddresses: any = getFormattedAddresses(policyParty);
    const validemails =
        policyParty?.emails?.filter((email) => !isEndDated(email.endDate)) ||
        [];

    const partyType = policyParty?.partyType;

    const lastName =
        policyParty?.lastName ||
        (partyType !== PartyType.INDIVIDUAL ? policyParty?.fullName : null) ||
        null;

    const {
        firstName = '',
        middleName = '',
        fullName = '',
        dateOfBirth = null,
        identifications = [],
        preferredAddressIndicator = null,
        trustType = undefined,
    } = policyParty || {};

    const taxId = identifications.find(
        (identification) =>
            identification.identificationType === IdentificationType.SSN
    )?.identificationValue;

    return {
        partyRoleType: role,
        firstName,
        middleName,
        lastName,
        fullName,
        maritalStatus: {
            text: null,
        },
        dob: { text: dateOfBirth },
        taxId: taxId || undefined,
        email: validemails?.length > 0 ? validemails[0].emailAddress : '',
        addresses: formattedAddresses ?? [],
        phones: phones ?? [],
        id: id,
        preferredAddressIndicator,
        partyType,
        trustType,
    };
};
const getInitialParty = (policy: Policy, configs: any) => {
    const initialParties: any = [];
    configs?.map((config: any) => {
        const party = getPartyInfo(policy, config.partyRoleType);
        //const jointOwnerParty = getPartyInfo(policy, PartyRoles.JOINT_OWNER);

        if (party) {
            initialParties.push(party);
        }

        //if (jointOwnerParty) {
        //    initialParties.push(jointOwnerParty);
        //}
    });

    return initialParties;
};

export interface AdditionalPartyInformation extends Party {
    id?: string;
}

export default function OwnerInformation({
    configs,
    isFormStateReadOnly,
    policy,
}: OwnerInformationProps) {
    const { formErrors, setOwnerInfo, ownerInfo } = useBeneChange();
    const { t } = useTranslation(undefined, {
        keyPrefix: 'beneChange.ownerInfo',
    });
    const parties =
        ownerInfo.length > 0 ? ownerInfo : getInitialParty(policy, configs);

    const [partyInfo, setPartyInfo] = useState<any[]>(parties || DEFAULT_PARTY);

    const setPartyInformation = (val: Party) => {
        setPartyInfo((parties) => {
            const existingItemIndex = parties.findIndex(
                (item) => item.partyRoleType === val.partyRoleType
            );
            if (existingItemIndex !== -1) {
                const newItem = {
                    ...parties[existingItemIndex],
                    firstName: val.firstName,
                    middleName: val.middleName,
                    lastName: val.lastName,
                    dob: val.dob,
                    email: val.email,
                    taxId: val.taxId,
                    maritalStatus: val.maritalStatus,
                    addresses: val.addresses,
                    trustType: val.trustType,
                };
                return parties.map((item, index) =>
                    index === existingItemIndex ? newItem : item
                );
            } else {
                return parties;
            }
        });
    };

    const handleAddressChange = (
        address: Address,
        party: Party,
        addressIndex: number
    ) => {
        const addresses = party.addresses;
        addresses[addressIndex] = address;
        const updatedParty = { ...party, addresses };
        setPartyInformation(updatedParty);
    };

    const handlePhoneChange = (
        phone: Phone,
        party: Party,
        phoneIndex: number
    ) => {
        const phones = party.phones;
        phones[phoneIndex] = phone;
        const updatedParty = { ...party, phones };
        setPartyInformation(updatedParty);
    };

    const updatePartyProperty = (
        party: Party,
        key: keyof Party,
        value: string
    ): void => {
        const updatedParty = {
            ...party,
            [key]: value,
        };
        setPartyInformation(updatedParty);
    };

    const renderNameField = (
        party: Party,
        updatePartyProperty: UpdatePartyPropertyFn,
        t2: TranslationFunction
    ) => (
        <div className="my-4 grid w-full grid-cols-2">
            <Field
                label={
                    party.partyType === PartyType.TRUST
                        ? t2(`trustName`) || ''
                        : t2(`companyName`) || ''
                }
                onChange={(event) => {
                    updatePartyProperty(party, 'lastName', event.target.value);
                }}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={party?.lastName || ''}
                maxLength={40}
                variant={FieldVariant.Default}
            />
        </div>
    );

    useEffect(() => {
        const parties = partyInfo.map((party) => {
            const mappedparty = { ...party };
            delete mappedparty.id;
            return mappedparty;
        });
        setOwnerInfo(() => [...parties]);
    }, [partyInfo, setOwnerInfo]);

    const { t: t2 } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.identification',
    });

    return (
        <CardContainer
            classNames={'w-full !p-2'}
            containerClassNames="w-full content-divider"
        >
            {configs?.map((config, index) => {
                const party = partyInfo.find(
                    (party) => party.partyRoleType === config.partyRoleType
                );
                if (party) {
                    return (
                        <div key={index} className="mb-4">
                            <Typography
                                variant={TypographyVariant.H3}
                                className="mb-4"
                                data-testid="data-testid-form-party-title"
                            >
                                {config.title || t(`personalDetails.title`)}
                            </Typography>
                            <div>
                                <PartyTypes
                                    partyIdentification={party.partyType}
                                    onPartyChange={() => {}}
                                    isReadOnly={true}
                                    orientation={RadioOrientation.Horizontal}
                                    variant={TypographyVariant.H6}
                                />
                                {party.partyType !== PartyType.INDIVIDUAL &&
                                    renderNameField(
                                        party,
                                        updatePartyProperty,
                                        t2
                                    )}
                                {party.partyType == PartyType.TRUST && (
                                    <div className="my-4 grid w-full grid-cols-2">
                                        <SelectSimple
                                            label={t2('trustType') as string}
                                            options={newTrustOptions(t2)}
                                            onChange={(event) => {
                                                updatePartyProperty(
                                                    party,
                                                    'trustType',
                                                    event
                                                );
                                            }}
                                            size={FieldSize.Small}
                                            value={
                                                party.trustType ??
                                                TrustType.Individual
                                            }
                                            variant={FieldVariant.Default}
                                            disabled={false}
                                        />
                                    </div>
                                )}
                                <SingleParty
                                    fields={config.fields}
                                    isFormStateReadOnly={isFormStateReadOnly}
                                    formParty={party}
                                    formErrors={{
                                        name: formErrors[
                                            `name${party?.partyRoleType}`
                                        ],
                                        ssn: formErrors[
                                            `ssn${party?.partyRoleType}`
                                        ],
                                        email: formErrors[
                                            `email${party?.partyRoleType}`
                                        ],
                                        dob: formErrors[
                                            `dob${party?.partyRoleType}`
                                        ],
                                    }}
                                    onDataChange={(val: Party) => {
                                        setPartyInformation(val);
                                    }}
                                    partyType={party.partyType}
                                />
                                {config?.phones?.map(
                                    (field: any, phoneIndex: number) => {
                                        return (
                                            <div key={phoneIndex}>
                                                <PartyPhone
                                                    isFormStateReadOnly={
                                                        isFormStateReadOnly
                                                    }
                                                    key={phoneIndex}
                                                    fields={
                                                        field.fields || null
                                                    }
                                                    phone={
                                                        party.phones.find(
                                                            (phone: any) =>
                                                                phone?.phoneType
                                                                    ?.text ===
                                                                field.phoneType
                                                        ) || {
                                                            ...DEFAULT_PHONE,
                                                            phoneType: {
                                                                text: field?.phoneType,
                                                            },
                                                            phoneNumber:
                                                                party?.phones?.[
                                                                    phoneIndex
                                                                ]
                                                                    ?.phoneNumber ||
                                                                null,
                                                        }
                                                    }
                                                    onDataChange={(val) =>
                                                        handlePhoneChange(
                                                            val,
                                                            party,
                                                            phoneIndex
                                                        )
                                                    }
                                                />
                                            </div>
                                        );
                                    }
                                )}
                                {config?.addressFields?.map(
                                    (field: any, addressIndex: number) => {
                                        const currentAddress =
                                            party.addresses?.find(
                                                (address: any) =>
                                                    address?.addressType ===
                                                    field.addressType
                                            ) || DEFAULT_ADDRESS;
                                        return (
                                            <div key={addressIndex}>
                                                {
                                                    <div className="mb-4">
                                                        <div className="flex">
                                                            <Typography
                                                                variant={
                                                                    TypographyVariant.H3
                                                                }
                                                                className="mb-4 mr-4"
                                                            >
                                                                {field.title ||
                                                                    t(
                                                                        `addressDetails.residentialAddressTitle`
                                                                    )}
                                                            </Typography>
                                                        </div>

                                                        <AddressEntry
                                                            initialAddress={{
                                                                ...currentAddress,
                                                                addressType:
                                                                    field.addressType,
                                                            }}
                                                            errors={{
                                                                addressLine1:
                                                                    formErrors[
                                                                        `addressLine1${party?.partyRoleType}`
                                                                    ],
                                                                city: formErrors[
                                                                    `city${party?.partyRoleType}`
                                                                ],
                                                                state: formErrors[
                                                                    `state${party?.partyRoleType}`
                                                                ],
                                                                zip: formErrors[
                                                                    `zip${party?.partyRoleType}`
                                                                ],
                                                            }}
                                                            onDataChange={(
                                                                val
                                                            ) =>
                                                                handleAddressChange(
                                                                    val,
                                                                    party,
                                                                    addressIndex
                                                                )
                                                            }
                                                            isFormStateReadOnly={
                                                                field?.isReadonly ||
                                                                isFormStateReadOnly
                                                            }
                                                            isPayeeAddress={
                                                                true
                                                            }
                                                            capitalize={false}
                                                        />
                                                    </div>
                                                }
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    );
                } else return null;
            })}
        </CardContainer>
    );
}
