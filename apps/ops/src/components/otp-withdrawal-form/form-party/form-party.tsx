import { useTranslation } from 'next-i18next';
import { useState, useEffect, useContext } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { FieldVariant } from '@deps/components/fields/field';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormSubtype } from '@deps/containers/otp/withdrawal-forms/flic-withdrawal-form.helpers';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    Address,
    AddressTypes,
    Party,
    PartyRoles,
    Phone,
    PhoneTypes,
} from '@deps/models/case/withdrawal/case';

import {
    AdditionalPartyInformation,
    PartyFields,
    SingleParty,
} from './party-helpers';
import PartyPhone, { DEFAULT_PHONE, PhoneFields } from './party-phone';
import AddressEntry, { DEFAULT_ADDRESS } from '../address-entry';
import { RecommendedByAgent } from './plugins/agent-reco';

export interface PartyConfig {
    partyRoleType: PartyRoles;
    title: string;
    fields: {
        fieldName: PartyFields;
        fieldLabel: string;
    }[];
    phones?: {
        phoneType: PhoneTypes;
        fields: {
            fieldName: PhoneFields;
            fieldLabel: string;
        }[];
    }[];
    addressFields?: {
        addressType: AddressTypes;
        title: string;
        isReadonly?: boolean;
    }[];
    isAddressChanged?: {
        addressType: AddressTypes;
        title: string;
    };
    agentRecommendation?: {
        label: string;
        shouldDisplay: (formSubtype: FormSubtype) => boolean;
    };
}

export const DEFAULT_Party = [
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
    },
];

interface FormPartiesProps {
    configs: PartyConfig[];
    isFormStateReadOnly?: boolean;
}

interface ISelectVarientByConfig {
    value: string;
    isFormStateReadOnly?: boolean;
    error?: string;
}

export interface IFieldConfig {
    label?: string;
    isFormStateReadOnly?: boolean;
}

export const selectVarientByConfig = ({
    value,
    isFormStateReadOnly,
    error,
}: ISelectVarientByConfig) => {
    if (isFormStateReadOnly) return FieldVariant.Inactive;
    if (error && !value) return FieldVariant.Error;
    return FieldVariant.Default;
};

export const getInitialParty = (
    parties: Party[]
): AdditionalPartyInformation[] => {
    return parties.map((party, index) => {
        return { ...party, id: index };
    });
};

export default function FormParties({
    configs,
    isFormStateReadOnly,
}: FormPartiesProps) {
    const { formSubtype, initialForm, formParty, setFormParty, formErrors } =
        useContext(FormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const [partyInfo, setPartyInfo] = useState<AdditionalPartyInformation[]>(
        getInitialParty(formParty?.parties || DEFAULT_Party)
    );
    const [isAddressChanged, setAddressChanged] = useState(false);

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
                };
                return parties.map((item, index) =>
                    index === existingItemIndex ? newItem : item
                );
            } else {
                return parties;
            }
        });
    };

    useEffect(() => {
        const parties = partyInfo.map((party) => {
            const mappedparty = { ...party };
            delete mappedparty.id;
            return mappedparty;
        });

        setFormParty((formParty) => ({
            ...formParty,
            parties,
        }));
    }, [partyInfo]);

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
        if (!party.phones) {
            party.phones = [
                {
                    ...DEFAULT_PHONE,
                    phoneType: { text: 'Owner_Phone_Day' as PhoneTypes },
                    phoneNumber: null,
                },
            ];
        }
        const phones = party?.phones;
        phones[phoneIndex] = phone;
        const updatedParty = { ...party, phones };
        setPartyInformation(updatedParty);
    };

    function updateChangedAddress(
        isAddressChanged: boolean,
        party: AdditionalPartyInformation,
        addressType: AddressTypes,
        currentAddress: Address = DEFAULT_ADDRESS
    ): void {
        setAddressChanged(isAddressChanged);
        const addresses = party.addresses;
        const updatedAddress = addresses.map((address) => {
            return address.addressType === addressType
                ? { ...currentAddress, isAddressChanged: isAddressChanged }
                : address;
        });

        const existingPartyIndex =
            initialForm?.data?.formRequest?.formParty?.parties.findIndex(
                (item) => item.partyRoleType === party.partyRoleType
            );
        const updatedAddresses =
            isAddressChanged === true
                ? updatedAddress
                : initialForm?.data?.formRequest?.formParty?.parties[
                      existingPartyIndex
                  ].addresses || [];

        const updatedParty = { ...party, addresses: updatedAddresses };

        setPartyInformation(updatedParty);
    }

    return (
        <CardContainer
            classNames={'w-full'}
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
                                    onDataChange={(val) =>
                                        setPartyInformation(val)
                                    }
                                />
                                {config?.addressFields?.map(
                                    (field, addressIndex) => {
                                        const currentAddress =
                                            party.addresses.find(
                                                (address) =>
                                                    address.addressType ===
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
                                                        />
                                                    </div>
                                                }
                                            </div>
                                        );
                                    }
                                )}
                                {/* Phone details */}
                                {config?.phones && (
                                    <Typography variant={TypographyVariant.H3}>
                                        {t(`phoneDetails.title`)}
                                    </Typography>
                                )}
                                {config?.phones?.map((field, phoneIndex) => {
                                    return (
                                        <div key={phoneIndex}>
                                            <PartyPhone
                                                isFormStateReadOnly={
                                                    isFormStateReadOnly
                                                }
                                                key={phoneIndex}
                                                fields={field.fields || null}
                                                phone={
                                                    party?.phones?.find(
                                                        (phone) =>
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
                                                            ]?.phoneNumber ||
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
                                })}
                                {config?.isAddressChanged && (
                                    <div className="mb-4">
                                        <div className="my-4 flex flex-wrap gap-8 max-md:flex-col">
                                            <CheckboxText
                                                label={
                                                    config?.isAddressChanged
                                                        ?.title ||
                                                    t(
                                                        `addressDetails.checkHereIfYourAddressHasChanged`
                                                    )
                                                }
                                                checked={isAddressChanged}
                                                onChange={(val) =>
                                                    updateChangedAddress(
                                                        val,
                                                        party,
                                                        config.isAddressChanged
                                                            ?.addressType ||
                                                            AddressTypes.DEFAULT
                                                    )
                                                }
                                                data-testid="isAddressChanged"
                                                isDisabled={isFormStateReadOnly}
                                            />
                                        </div>
                                        {isAddressChanged && (
                                            <>
                                                <div className="flex">
                                                    <Typography
                                                        variant={
                                                            TypographyVariant.H3
                                                        }
                                                        className="mb-4 mr-4"
                                                    >
                                                        {t(
                                                            `addressDetails.title`
                                                        )}
                                                    </Typography>
                                                </div>
                                                <AddressEntry
                                                    initialAddress={
                                                        DEFAULT_ADDRESS
                                                    }
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
                                                    onDataChange={(val) =>
                                                        updateChangedAddress(
                                                            isAddressChanged,
                                                            party,
                                                            config
                                                                .isAddressChanged
                                                                ?.addressType ||
                                                                AddressTypes.DEFAULT,
                                                            val
                                                        )
                                                    }
                                                    isFormStateReadOnly={
                                                        isFormStateReadOnly
                                                    }
                                                />
                                            </>
                                        )}
                                    </div>
                                )}

                                {config.agentRecommendation &&
                                formSubtype &&
                                config?.agentRecommendation.shouldDisplay(
                                    formSubtype
                                ) ? (
                                    <RecommendedByAgent />
                                ) : null}
                            </div>
                        </div>
                    );
                } else return null;
            })}
        </CardContainer>
    );
}
