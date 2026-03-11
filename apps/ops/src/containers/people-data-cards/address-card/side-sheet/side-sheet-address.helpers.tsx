import { Transition } from '@headlessui/react';
import { TFunction, useTranslation } from 'next-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import IconButton from '@deps/components/icon-button/icon-button';
import Label, { LabelVariant } from '@deps/components/label/label';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { AddressType } from '@deps/models/policy/sor-policy';
import { ReactComponent as TrashIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';
import { Address } from '@zinnia/api-types/types/sor';

import styles from './side-sheet-address.helpers.module.css';

interface AdditionalAddressLineProps {
    disabled: boolean;
    label: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    removeAddressLine: () => void;
    show: boolean;
    value?: string;
}

interface AddressDetailsProps {
    address: Address;
    condensed?: boolean;
    isSelectedMailingAddress?: boolean;
}

export interface Errors {
    addressLine1?: string;
    caseId?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

interface GetAddressTypeOptions {
    t: TFunction;
}

interface GetFormErrors {
    address: Address;
    isDelete?: boolean;
    caseId?: string;
    t: TFunction;
    hasCase?: boolean;
}

export const AdditionalAddressLine = ({
    disabled,
    label,
    onChange,
    removeAddressLine,
    show,
    value,
}: AdditionalAddressLineProps) => {
    const { t } = useTranslation();

    return (
        <Transition
            as="div"
            className="flex w-full flex-row items-center gap-3"
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
                variant={
                    disabled ? FieldVariant.Inactive : FieldVariant.Default
                }
            />
            <IconButton
                aria-label={`${t('allFields.remove')} ${label}`}
                disabled={disabled}
                onClick={removeAddressLine}
            >
                <div className={styles.removeButtonContainer}>
                    <TrashIcon height={20} width={20} />
                    <span>{t('allFields.remove')}</span>
                </div>
            </IconButton>
        </Transition>
    );
};

export const AddressDetails = ({
    address,
    isSelectedMailingAddress,
    condensed = false,
}: AddressDetailsProps) => {
    const { t } = useTranslation();

    return (
        <>
            <Label
                label={
                    condensed
                        ? address.addressType ?? ''
                        : t('people.sideSheet.transactions.address')
                }
                variant={LabelVariant.FieldLabel}
            />
            <FormattedAddress address={address} />
            {isSelectedMailingAddress && (
                <AssistiveText
                    className="mt-1"
                    text={t('people.card.address.general.mailingAddress')}
                    variant={AssistiveTextVariant.Success}
                />
            )}
        </>
    );
};

export const getAddressTypeOptions = ({ t }: GetAddressTypeOptions) => {
    return [
        {
            label: t('people.card.address.addressOptions.residence') as string,
            value: AddressType.RESIDENCE,
        },
        {
            label: t('people.card.address.addressOptions.business') as string,
            value: AddressType.BUSINESS,
        },
        {
            label: t('people.card.address.addressOptions.poBox') as string,
            value: AddressType.POBOX,
        },
    ];
};

export const getNewAddressTypeOptions = ({ t }: GetAddressTypeOptions) => {
    return [
        {
            label: t('people.card.address.addressOptions.residence') as string,
            value: AddressType.RESIDENCE,
        },
        {
            label: t('people.card.address.addressOptions.business') as string,
            value: AddressType.BUSINESS,
        },
        {
            label: t('people.card.address.addressOptions.seasonal') as string,
            value: AddressType.SEASONAL,
        },
        {
            label: t('people.card.address.addressOptions.poBox') as string,
            value: AddressType.POBOX,
        },
        {
            label: t('people.card.address.addressOptions.other') as string,
            value: AddressType.OTHER,
        },
    ];
};

export const getFormErrors = ({
    address,
    caseId,
    isDelete,
    t,
    hasCase,
}: GetFormErrors) => {
    let errors: Errors = {};

    const { addressLine1, city, state, zipCode } = address;

    if (caseId == null && hasCase) {
        errors = { ...errors, caseId: `${t('allFields.missingCaseDocument')}` };
    }

    if (isDelete) {
        return errors;
    }

    if (!addressLine1) {
        errors = {
            ...errors,
            addressLine1: t('allFields.streetAddressMissing') as string,
        };
    }
    if (!zipCode) {
        errors = {
            ...errors,
            zipCode: t('allFields.zipCodeMissing') as string,
        };
    } else if (zipCode.length < 5) {
        errors = {
            ...errors,
            zipCode: t('allFields.invalidZipCode') as string,
        };
    }

    if (!city) {
        errors = { ...errors, city: t('allFields.cityMissing') as string };
    }

    if (!state) {
        errors = { ...errors, state: t('allFields.stateMissing') as string };
    }

    return errors;
};
