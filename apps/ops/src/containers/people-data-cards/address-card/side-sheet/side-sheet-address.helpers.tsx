import { Transition } from '@headlessui/react';
import { Address, AddressType } from '@zinnia/api-types/types/sor';
import { TFunction, useTranslation } from 'next-i18next';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import IconButton from '@deps/components/icon-button/icon-button';
import Label, { LabelVariant } from '@deps/components/label/label';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { ReactComponent as TrashIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';

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
}

export const AdditionalAddressLine = ({ disabled, label, onChange, removeAddressLine, show, value }: AdditionalAddressLineProps) => {
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

export const AddressDetails = ({ address, isSelectedMailingAddress, condensed = false }: AddressDetailsProps) => {
    const { t } = useTranslation();

    return (
        <>
            <Label
                label={condensed ? address.addressType ?? '' : t('people.sideSheet.transactions.address')}
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
        { label: t('people.card.address.addressOptions.residence') as string, value: AddressType.RESIDENCE },
        { label: t('people.card.address.addressOptions.business') as string, value: AddressType.BUSINESS },
        { label: t('people.card.address.addressOptions.poBox') as string, value: AddressType.POBOX },
    ];
};

export const getFormErrors = ({ address, caseId, isDelete, t }: GetFormErrors) => {
    let errors: Errors = {};

    const { addressLine1, city, state, zipCode } = address;

    if (caseId == null) {
        errors = { ...errors, caseId: `${t('errors.missingCaseDocument')}` };
    }

    if (isDelete) {
        return errors;
    }

    if (!addressLine1) {
        errors = { ...errors, addressLine1: t('errors.streetAddress') as string };
    }

    if (!city) {
        errors = { ...errors, city: t('errors.city') as string };
    }

    if (!state) {
        errors = { ...errors, state: t('errors.state') as string };
    }

    if (!zipCode) {
        errors = { ...errors, zipCode: t('errors.zipCode') as string };
    } else if (zipCode.length < 5) {
        errors = { ...errors, zipCode: t('errors.invalidZip') as string };
    }

    return errors;
};
