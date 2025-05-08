import { Transition } from '@headlessui/react';
import { useTranslation } from 'next-i18next';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import IconButton from '@deps/components/icon-button/icon-button';
import { isEndDated } from '@deps/helpers/date.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { Country, State } from '@deps/models/policy/sor-policy';
import { ReactComponent as TrashIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';

interface AdditionalAddressLineProps {
    disabled: boolean;
    label: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    removeAddressLine: () => void;
    show: boolean;
    value?: string;
}

export const AdditionalAddressLine = ({ disabled, label, onChange, removeAddressLine, show, value }: AdditionalAddressLineProps) => {
    const { t } = useTranslation();

    return (
        <Transition
            as="div"
            className="flex w-full flex-row items-center gap-3 my-3"
            enter="transition ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            show={show}
        >
            <Field
                aria-label={label}
                label={label}
                labelClassNames="sr-only"
                onChange={onChange}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={toTitleCase(value)}
                variant={disabled ? FieldVariant.Inactive : FieldVariant.Default}
            />
            <IconButton
                aria-label={`${t('people.sideSheet.address.general.remove')} ${label}`}
                disabled={disabled}
                onClick={removeAddressLine}
            >
                <TrashIcon height={20} width={20} />
            </IconButton>
        </Transition>
    );
};

export const ENTERPRISE_ADDRESS_TYPE = {
    HOME: 'RESIDENCE',
    BUSINESS: 'BUSINESS',
    DEFAULT: 'DEFAULT',
    SECONDARY: 'SECONDARYADDRESS',
};

export type EnterpriseAddressType = (typeof ENTERPRISE_ADDRESS_TYPE)[keyof typeof ENTERPRISE_ADDRESS_TYPE];

export const INITIAL_ADDRESS = {
    addressType: ENTERPRISE_ADDRESS_TYPE.HOME,
    country: Country.US,
};

export interface EnterpriseAddress {
    /** Address Line 1 of the party */
    addressLine1?: string;
    /** Address Line 2 of the party */
    addressLine2?: string;
    /** Address Line 3 of the party */
    addressLine3?: string;
    addressType?: EnterpriseAddressType;
    /** City of the party address */
    city?: string;
    country?: Country;
    /** Date (with pattern "yyyy-mm-dd") The end date of the owner address */
    endDate?: string;
    /** Date (with pattern "yyyy-mm-dd") The start date of the owner address */
    startDate?: string;
    state?: State;
    /** Zip code of the party address */
    zipCode?: string;
    /** Zip code extension of the party address */
    zipCodeExtension?: string;
    addressId?: string;
}

export interface EnterpriseAddresses {
    addresses?: EnterpriseAddress[];
}

export const getAddresses = ({ addresses }: EnterpriseAddresses): EnterpriseAddress[] => {
    if (!addresses) return [];
    return addresses?.filter((address: any) => !isEndDated(address.endDate)) ?? [];
};

export const getResidenceAddresses = ({ addresses }: EnterpriseAddresses): EnterpriseAddress[] => {
    if (!addresses) return [];

    const validAddresses = addresses?.filter((address: any) => !isEndDated(address.endDate)) ?? [];

    const residenceAddresses: any[] = [];

    validAddresses.forEach((address: any) => {
        if (address.addressType == ENTERPRISE_ADDRESS_TYPE.HOME) {
            residenceAddresses.push(address);
        }
    });

    return residenceAddresses?.[0] || [];
};

export const getDefaultAddresses = ({ addresses }: EnterpriseAddresses): EnterpriseAddress[] => {
    if (!addresses) return [];

    const validAddresses = addresses?.filter((address: any) => !isEndDated(address.endDate)) ?? [];

    const defaultAddresses: any[] = [];

    validAddresses.forEach((address: any) => {
        if (address.addressType == ENTERPRISE_ADDRESS_TYPE.DEFAULT) {
            defaultAddresses.push(address);
        }
    });

    return defaultAddresses?.[0] || [];
};

export interface Errors {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipCodeExtension?: string;
}
