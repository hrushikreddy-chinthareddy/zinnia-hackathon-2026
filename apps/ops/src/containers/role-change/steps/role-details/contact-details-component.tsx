import {
    AddressType,
    PhoneType,
    EmailType,
    PartyRole,
} from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    AddressField,
    containerClasses,
    EmailField,
    fullcontainerClasses,
    PhoneField,
    PolicyRole,
    RoleField,
    RoleLabel,
    sectionClasses,
} from '@deps/constants/policy';
import { useRoleChange } from '@deps/contexts/RoleChangeContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import AddressDetails from '../../components/addressDetails';
import EmailDetails from '../../components/emailDetails';
import PhoneDetails from '../../components/phoneDetails';
import { ContactOptions, validate } from '../../role-change-helper';

const ContactDetailsComponent = ({
    handleChange,
    role,
    isReadOnly,
    roleLabel,
    idx,
    roleData,
}: {
    handleChange: any;
    role: PolicyRole;
    isReadOnly: boolean;
    roleLabel?: string;
    idx?: number;
    roleData: any;
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange.roleDetails',
    });

    const { setRoleData, addRole, removeRole, setCurrentErrors } =
        useRoleChange();

    const contactOptions = ContactOptions(t, role);
    const keysToValidate = ['areaCode', 'dialNumber'];

    const handleRolePartyChange = <
        T extends keyof typeof roleData.party,
        K extends keyof (typeof roleData.party)[T][0]
    >(
        arrayKey: T,
        index: number,
        key: K,
        value: any
    ) => {
        const updatedArray = [...(roleData.party[arrayKey] || [])];
        if (!updatedArray[index]) {
            updatedArray[index] = {};
        }

        updatedArray[index] = {
            ...updatedArray[index],
            [key]: value,
        };
        if (keysToValidate.includes(key as string)) {
            const errors = validate(
                {
                    ...roleData,
                    party: {
                        ...roleData.party,
                        [arrayKey]: updatedArray,
                    },
                },
                addRole,
                removeRole,
                t,
                (roleLabel as RoleLabel) ?? '',
                role.toUpperCase() as PartyRole
            );
            if (setCurrentErrors) {
                setCurrentErrors(errors);
            }
        }

        setRoleData((prevState: any) => {
            const updatedArray = [...(prevState.party[arrayKey] || [])];
            if (!updatedArray[index]) {
                updatedArray[index] = {};
            }

            updatedArray[index] = {
                ...updatedArray[index],
                [key]: value,
            };

            return {
                ...prevState,
                party: {
                    ...prevState.party,
                    [arrayKey]: updatedArray,
                },
            };
        });
    };

    const handleAddPartyArrayItem = (
        arrayKey: 'phones' | 'emails' | 'addresses'
    ) => {
        setRoleData((prevState: any) => {
            const existingArray = prevState.party?.[arrayKey] || [];
            const defaultValues: Record<typeof arrayKey, any> = {
                addresses: {
                    startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                    endDate: null,
                    addressType: AddressType.RESIDENCE,
                    addressLine1: '',
                    addressLine2: '',
                    addressLine3: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    zipCodeExtension: '',
                    country: 'US',
                    isPreferred: false,
                },
                phones: {
                    startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                    endDate: null,
                    phoneType: PhoneType.MOBILE,
                    countryCode: '1',
                    areaCode: '',
                    dialNumber: '',
                    extension: '',
                    bestTime: null,
                    timeZone: null,
                    isPreferred: false,
                },
                emails: {
                    startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                    endDate: null,
                    emailType: EmailType.PERSONAL,
                    emailAddress: '',
                    isPreferred: false,
                },
            };

            const newItem = defaultValues[arrayKey];

            return {
                ...prevState,
                party: {
                    ...prevState.party,
                    [arrayKey]: [...existingArray, newItem],
                },
            };
        });
    };

    const roleInfo = roleData;

    const onPreferredValueChange = (
        key: string,
        prefix: string,
        id: string
    ) => {
        setRoleData((prevState: any) => {
            const updatedArray = [...prevState.party[key]];
            const updatedValue = updatedArray.map((item, index) => ({
                ...item,
                isPreferred: `${prefix}-${index}` === id,
            }));

            return {
                ...prevState,
                party: {
                    ...prevState.party,
                    [key]: updatedValue,
                },
            };
        });
    };

    return (
        <>
            <div className="my-8">
                <Typography variant={TypographyVariant.H2}>
                    Contact Details
                </Typography>
            </div>

            <div
                className={containerClasses}
                key={roleInfo?.party?.preferredCommunicationType}
            >
                <div className={sectionClasses}>
                    <Radio
                        items={contactOptions}
                        label={t('prefferedContactMethod') as string}
                        onChange={(e) =>
                            handleChange(
                                RoleField.PreferredCommunicationType,
                                e.target.value
                            )
                        }
                        value={
                            roleInfo?.party?.preferredCommunicationType || null
                        }
                        orientation={RadioOrientation.Horizontal}
                        variant={
                            isReadOnly
                                ? RadioVariant.Inactive
                                : RadioVariant.Default
                        }
                        name={`preferredCommunicationType-${idx}`}
                        required
                    />
                </div>
            </div>

            <div className="flex w-full flex-col md:flex-row md:justify-between">
                <div className="my-4 flex  items-center">
                    <Typography className="mr-5" variant={TypographyVariant.H3}>
                        {t('address')}
                    </Typography>
                    {
                        <NavElement
                            onClick={() => handleAddPartyArrayItem('addresses')}
                            size={NavElementSize.Small}
                            startIcon={<AddIcon height={20} width={20} />}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                            disabled={isReadOnly}
                        >
                            {t('add')}
                        </NavElement>
                    }
                </div>
            </div>
            {roleInfo?.party?.addresses
                ?.filter((address: any) => !isEndDated(address.endDate))
                ?.map((address: any, index: number) => (
                    <div
                        className={fullcontainerClasses}
                        key={`addressContainer-${index}`}
                        data-testid={`addressDetails-${index}`}
                    >
                        <div className={sectionClasses}>
                            <AddressDetails
                                addressDetails={address}
                                handleAddressChange={handleRolePartyChange}
                                index={index}
                                isReadOnly={isReadOnly}
                                role={role}
                                onPreferredAddressChange={(id: string) =>
                                    onPreferredValueChange(
                                        AddressField.Addresses,
                                        AddressField.PreferredAddress,
                                        id
                                    )
                                }
                                disablePreferredAddress={
                                    roleInfo.party.addresses.length === 1
                                }
                                showPreferredCheckbox={true}
                            />
                        </div>
                    </div>
                ))}

            <div className="flex w-full flex-col md:flex-row md:justify-between">
                <div className="my-6 flex items-center">
                    <Typography className="mr-5" variant={TypographyVariant.H3}>
                        {t('phone')}
                    </Typography>
                    {
                        <NavElement
                            onClick={() => handleAddPartyArrayItem('phones')}
                            size={NavElementSize.Small}
                            startIcon={<AddIcon height={20} width={20} />}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                            disabled={isReadOnly}
                        >
                            {t('add')}
                        </NavElement>
                    }
                </div>
            </div>

            {roleInfo?.party?.phones
                ?.filter((phone: any) => !isEndDated(phone.endDate))
                ?.map((phone: any, index: number) => {
                    return (
                        <div
                            className={fullcontainerClasses}
                            key={`phoneConatiner-${index}`}
                            data-testid={`phoneDetails-${index}`}
                        >
                            <div className={sectionClasses}>
                                <PhoneDetails
                                    phoneDetails={phone}
                                    handlePhoneChange={handleRolePartyChange}
                                    index={index}
                                    isReadOnly={isReadOnly}
                                    isRequired={
                                        roleInfo.party
                                            .preferredCommunicationType ===
                                        t('phone').toUpperCase()
                                    }
                                    onPreferredPhoneChange={(id: string) =>
                                        onPreferredValueChange(
                                            PhoneField.Phones,
                                            PhoneField.PreferredPhone,
                                            id
                                        )
                                    }
                                    disablePreferredPhone={
                                        roleInfo.party.phones.length === 1
                                    }
                                    showPreferredCheckbox={true}
                                />
                            </div>
                        </div>
                    );
                })}

            <div className="flex w-full flex-col md:flex-row md:justify-between">
                <div className="my-6 flex  items-center">
                    <Typography className="mr-5" variant={TypographyVariant.H3}>
                        {t('email')}
                    </Typography>
                    {
                        <NavElement
                            onClick={() => handleAddPartyArrayItem('emails')}
                            size={NavElementSize.Small}
                            startIcon={<AddIcon height={20} width={20} />}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                            disabled={isReadOnly}
                        >
                            {t('add')}
                        </NavElement>
                    }
                </div>
            </div>

            {roleInfo?.party?.emails
                ?.filter((email: any) => !isEndDated(email.endDate))
                ?.map((email: any, index: number) => (
                    <div
                        className={fullcontainerClasses}
                        key={`emailContainer-${index}`}
                        data-testid={`emailDetails-${index}`}
                    >
                        <div className={sectionClasses}>
                            <EmailDetails
                                emailDetails={email}
                                handleEmailChange={handleRolePartyChange}
                                index={index}
                                isReadOnly={isReadOnly}
                                isRequired={
                                    roleInfo.party
                                        .preferredCommunicationType ===
                                    t('email').toUpperCase()
                                }
                                onPreferredEmailChange={(id: string) => {
                                    onPreferredValueChange(
                                        EmailField.Emails,
                                        EmailField.PreferredEmail,
                                        id
                                    );
                                }}
                                disablePreferredEmail={
                                    roleInfo.party.emails.length === 1
                                }
                                showPreferredCheckbox={true}
                            />
                        </div>
                    </div>
                ))}
        </>
    );
};

export default ContactDetailsComponent;
